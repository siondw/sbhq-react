// src/pages/CorrectScreen/CorrectScreen.js

import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import GameStatsSummary from "../../components/GameStatsSummary/GameStatsSummary";
import styles from "./CorrectScreen.module.css";
import { useAuth } from "../../contexts/AuthContext"; // Assuming there's an AuthContext to get user info
import useRequireState from "../../hooks/useRequireState"; // Reusing the custom hook for state validation

function CorrectScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the custom hook to require 'contest' in location.state
  const { contest } = useRequireState(["contest"], "/login"); // Redirect to '/login' if 'contest' is missing

  const contestId = contest?.id;
  const { user, loading: authLoading } = useAuth(); // Retrieve user data

  const [currentRound, setCurrentRound] = useState(contest?.currentRound); // Start with the current round
  const [isActive, setIsActive] = useState(true); // Assume active until told otherwise

  const [numberOfRemainingPlayers, setNumberOfRemainingPlayers] = useState(0); // Dynamic count
  const [loadingPlayers, setLoadingPlayers] = useState(true); // Loading state for players
  const [errorFetchingPlayers, setErrorFetchingPlayers] = useState(null); // Error state for players

  const gradientStyle = "linear-gradient(180deg, #01710C 0%, #54627B 100%)"; // Example gradient

  useEffect(() => {
    if (!contestId || !user?.uid) return; // Ensure we have both contestId and userId

    const db = getDatabase();

    // References to listen to
    const roundRef = ref(db, `contests/${contestId}/currentRound`);
    const activeStatusRef = ref(db, `contests/${contestId}/participants/${user.uid}/active`);
    const participantsRef = ref(db, `contests/${contestId}/participants`);

    // Listener for round changes
    const handleRoundChange = (snapshot) => {
      const newRound = snapshot.val();
      if (newRound !== null && newRound !== currentRound) {
        setCurrentRound(newRound); // Update current round
        // Redirect to the QuestionScreen with updated contest details
        navigate("/question", { state: { contest: { ...contest, currentRound: newRound } } });
      }
    };

    // Listener for user's active status
    const handleActiveStatus = (snapshot) => {
      const activeStatus = snapshot.val();
      if (activeStatus === false) {
        // If the participant is inactive, direct them to the eliminated screen
        navigate("/eliminated");
      }
    };

    // Listener for participants to count active players
    const handleParticipants = (snapshot) => {
      const participantsData = snapshot.val();
      console.log("Fetched participants data from Firebase:", participantsData);

      if (!participantsData) {
        console.warn("No participants found for contest:", contestId);
        setNumberOfRemainingPlayers(0);
        setLoadingPlayers(false);
        return;
      }

      // Count active participants
      const activeCount = Object.values(participantsData).reduce((count, participant) => {
        return participant.active ? count + 1 : count;
      }, 0);

      console.log(`Number of active participants: ${activeCount}`);
      setNumberOfRemainingPlayers(activeCount);
      setLoadingPlayers(false);
    };

    // Attach listeners
    onValue(roundRef, handleRoundChange, (error) => {
      console.error("Error fetching currentRound:", error);
    });

    onValue(activeStatusRef, handleActiveStatus, (error) => {
      console.error("Error fetching activeStatus:", error);
    });

    onValue(participantsRef, handleParticipants, (error) => {
      console.error("Error fetching participants:", error);
      setErrorFetchingPlayers("There was an error fetching the participants.");
      setLoadingPlayers(false);
    });

    // Cleanup listeners on unmount
    return () => {
      off(roundRef, "value", handleRoundChange);
      off(activeStatusRef, "value", handleActiveStatus);
      off(participantsRef, "value", handleParticipants);
    };
  }, [contestId, user?.uid, navigate, contest, currentRound]);

  // Prevent the user from going back after submitting
  useEffect(() => {
    const preventBackNavigation = () => {
      window.history.pushState(null, document.title, window.location.href);
    };

    // Add an event listener to prevent the back button from working
    window.addEventListener("popstate", preventBackNavigation);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  if (authLoading || loadingPlayers) {
    return <div>Loading...</div>;
  }

  if (errorFetchingPlayers) {
    console.error("Error fetching players:", errorFetchingPlayers);
    return <div>Error: {errorFetchingPlayers}</div>;
  }

  return (
    <div className={styles.correctScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span className={styles.correctText}>Correct</span>
          <span className={styles.checkMarkIcon}>✔️</span>
        </div>
        <MainText
          header=""
          subheader="Stay Tuned for the Next Question..."
          gradient={gradientStyle}
        />
      </div>
      <GameStatsSummary
        numberOfRemainingPlayers={numberOfRemainingPlayers}
        roundNumber={currentRound || 1} // Display the current round
        className={styles.gameStatsSummary}
      />
    </div>
  );
}

export default CorrectScreen;
