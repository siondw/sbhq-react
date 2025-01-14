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
  const [role, setRole] = useState(null); // To track user role
  const hasFetchedData = useRef(false); // Prevents multiple fetches

  useEffect(() => {
    const fetchUserData = async () => {
      if (hasFetchedData.current) return; // Avoid duplicate requests
      hasFetchedData.current = true;

      try {
        console.log("Fetching session data...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session) {
          console.error("Failed to fetch session:", sessionError);
          throw new Error("Failed to get current session");
        }

        const { user } = sessionData.session;
        setCurrentUserId(user.id);

        console.log("Fetching user details from database for user ID:", user.id);
        const { data, error } = await supabase
          .from("users")
          .select("username, role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Database error fetching user details:", error);
          throw new Error("Error checking user details in the database");
        }

        console.log("Fetched user data:", data);
        setUserHasUsername(!!data?.username);
        setRole(data?.role);

        if (data?.username) {
          setTimeout(() => {
            navigate("/join-contests");
          }, 1000);
        }
      } catch (err) {
        console.error("Error in fetchUserData:", err.message);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      hasFetchedData.current = false; // Reset fetch state
    };
  }, [navigate]);

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
      console.error("Error in handleUsernameSubmit:", err.message);
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
            header={`Welcome Back, ${role === "admin" ? "Admin" : "User"}!`}
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
