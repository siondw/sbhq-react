// OverviewContent.js
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, get, child } from "firebase/database";
import styles from './OverviewContent.module.css'; // Import the CSS file
import { UserGroupIcon, RefreshIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline'; // Import Heroicons

const OverviewContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [activeParticipants, setActiveParticipants] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const contestsRef = ref(db, 'contests');

    const handleContests = (snapshot) => {
      const contestsData = snapshot.val();
      if (!contestsData) {
        setError("No contests found.");
        setIsLoading(false);
        return;
      }

      // Find all contests with lobbyOpen: true
      const openContests = Object.values(contestsData).filter(contest => contest.lobbyOpen === true);
      
      if (openContests.length === 0) {
        // No open contests; render nothing
        setContest(null);
        setIsLoading(false);
        return;
      }

      // Assuming only one contest can have an open lobby at a time
      const currentContest = openContests[0];
      setContest(currentContest);
      setCurrentRound(currentContest.currentRound);

      // Fetch participants and count active ones
      const participantsRef = ref(db, `contests/${currentContest.id}/participants`);
      
      const handleParticipants = (participantsSnapshot) => {
        const participantsData = participantsSnapshot.val();
        if (!participantsData) {
          setActiveParticipants(0);
        } else {
          const activeCount = Object.values(participantsData).filter(participant => participant.active === true).length;
          setActiveParticipants(activeCount);
        }
      };

      onValue(participantsRef, handleParticipants, (error) => {
        console.error("Error fetching participants:", error);
        setError("Error fetching participants.");
      });

      // Fetch the question for the current round
      const questionRef = ref(db, `questions/${currentContest.id}`);
      
      const handleQuestions = (questionsSnapshot) => {
        const questionsData = questionsSnapshot.val();
        if (!questionsData) {
          setCurrentQuestion("No questions found for this contest.");
          setIsLoading(false);
          return;
        }

        // Find the question associated with the current round
        const questionEntry = Object.values(questionsData).find(question => question.round === currentContest.currentRound);
        
        if (questionEntry) {
          setCurrentQuestion(questionEntry.text);
        } else {
          setCurrentQuestion("No question found for the current round.");
        }

        setIsLoading(false);
      };

      onValue(questionRef, handleQuestions, (error) => {
        console.error("Error fetching questions:", error);
        setError("Error fetching questions.");
        setIsLoading(false);
      });
    };

    onValue(contestsRef, handleContests, (error) => {
      console.error("Error fetching contests:", error);
      setError("Error fetching contests.");
      setIsLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      off(contestsRef, 'value', handleContests);
    };
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Loading overview...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!contest) {
    // No contest with open lobby; render nothing or a placeholder
    return null;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Dashboard Overview</h2>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <UserGroupIcon className={styles.icon} />
          </div>
          <h3 className={styles.cardTitle}>Total Active Participants</h3>
          <p className={styles.cardValue}>{activeParticipants}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <RefreshIcon className={styles.icon} />
          </div>
          <h3 className={styles.cardTitle}>Current Round</h3>
          <p className={styles.cardValue}>{currentRound}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <QuestionMarkCircleIcon className={styles.icon} />
          </div>
          <h3 className={styles.cardTitle}>Current Question</h3>
          <p className={styles.cardValue}>{currentQuestion}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
