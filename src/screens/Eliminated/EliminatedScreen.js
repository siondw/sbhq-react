import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import styles from "./EliminatedScreen.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";
import { useAuth } from "../../contexts/AuthContext";

function EliminatedScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Access the authenticated user from AuthContext

  const { contest } = location.state || {};

  const [pollingCount, setPollingCount] = useState(0); // Track number of polls
  const [hasNavigated, setHasNavigated] = useState(false); // Avoid multiple navigations
  const maxPollingCount = 10; // 5 minutes (10 polls at 30-second intervals)
  const pollingInterval = 30000; // 30 seconds

  useEffect(() => {
    if (!contest || !user) {
      navigate("/", { replace: true });
      return;
    }

    const pollForReinstatement = async () => {
      try {
        // Poll the participant's status
        const { data, error } = await supabase
          .from("participants")
          .select("active, elimination_round")
          .eq("user_id", user.id) // Use the user ID from useAuth
          .eq("contest_id", contest.id)
          .single();

        if (error) {
          console.error("Error fetching participant status:", error.message);
          return;
        }

        if (data?.active && data?.elimination_round === null && !hasNavigated) {
          setHasNavigated(true);
          navigate("/correct", { replace: true, state: { contest } });
        }
      } catch (err) {
        console.error("Error during polling:", err.message);
      }
    };

    const interval = setInterval(() => {
      if (pollingCount < maxPollingCount) {
        pollForReinstatement();
        setPollingCount((prev) => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, pollingInterval);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [contest, user, navigate, pollingCount, hasNavigated]);

  const gradientStyle = "linear-gradient(167deg, #710117 29.79%, #54627B 90.89%)"; // Example gradient

  return (
    <div className={styles.eliminatedScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span className={styles.eliminatedText}>Eliminated</span>
          <span className={styles.xIcon}>❌</span> {/* Added x emoji */}
        </div>
        <MainText
          header=""
          subheader="Thanks for playing!"
          gradient={gradientStyle}
        />
      </div>
    </div>
  );
}

export default EliminatedScreen;
