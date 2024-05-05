import React from "react";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import styles from "./CorrectScreen.module.css";

import GameStatsSummary from "../../components/GameStatsSummary/GameStatsSummary";

function CorrectScreen() {
  const gradientStyle = "linear-gradient(180deg, #01710C 0%, #54627B 100%)"; // Example gradient
  const numberOfRemainingPlayers = 10; // Example data
  const roundNumber = 3; // Example data

  return (
    <div className={styles.correctScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span className={styles.correctText}>Correct</span>
          <span className={styles.checkMarkIcon}>✔️</span>
        </div>
        <MainText
          header="" // Keep empty if "Correct" text is handled separately
          subheader="Stay Tuned for the Next Question..."
          gradient={gradientStyle} // Pass the gradient as a prop
        />
      </div>
    </div>
  );
}

export default CorrectScreen;
