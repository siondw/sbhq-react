import React from 'react';
import styles from './OverviewContent.module.css'; // Import the CSS file

const OverviewContent = () => {
  // Placeholder data for now (will be dynamic later)
  const totalParticipants = 8282;
  const currentRound = 5;
  const totalQuestions = 20;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Dashboard Overview</h2>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Total Participants</h3>
          <p>{totalParticipants}</p>
        </div>
        <div className={styles.card}>
          <h3>Current Round</h3>
          <p>{currentRound}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Questions</h3>
          <p>{totalQuestions}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
