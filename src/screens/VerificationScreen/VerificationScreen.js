import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import UsernameInput from "../../components/UsernameInput/UsernameInput";
import styles from "./VerificationScreen.module.css";
import { supabase } from "../../supabase"; // Import your Supabase client

function VerificationScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userHasUsername, setUserHasUsername] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const hasFetchedData = useRef(false); // Prevents multiple fetches

  useEffect(() => {
    const fetchUserData = async () => {
      if (hasFetchedData.current) return; // Avoid duplicate requests
      hasFetchedData.current = true;

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error("Failed to get current session");
        }

        const { user } = sessionData.session;
        setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from("users")
          .select("username")
          .eq("id", user.id)
          .single();

        if (error) {
          throw new Error("Error checking username in the database");
        }

        // Check if the `username` is null
        setUserHasUsername(!!data?.username);

        // If the user has a username, delay the redirect by 1 second
        if (data?.username) {
          setTimeout(() => {
            navigate("/join-contests");
          }, 1000); // 1-second delay
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]); // Ensure dependencies include navigate

  const handleUsernameSubmit = async (username) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ username })
        .eq("id", currentUserId);

      if (error) {
        throw new Error("Failed to save username");
      }

      navigate("/join-contests");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.verificationScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.content}>
        {userHasUsername ? (
          <MainText
            header="Welcome Back!"
            subheader="Redirecting you to your dashboard..."
          />
        ) : (
          <>
            <MainText
              header="Set Your Username"
              subheader="Please choose a unique username to complete your profile."
            />
            <UsernameInput onSubmit={handleUsernameSubmit} />
          </>
        )}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default VerificationScreen;
