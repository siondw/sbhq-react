import React from "react";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import styles from "./CorrectScreen.module.css";

import GameStatsSummary from "../../components/GameStatsSummary/GameStatsSummary";

function CorrectScreen() {
  const gradientStyle = "linear-gradient(180deg, #01710C 0%, #54627B 100%)"; // Example gradient
  const numberOfRemainingPlayers = 10;
  const roundNumber = 3;

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
        roundNumber={roundNumber}
        className={styles.gameStatsSummary}
      />
    </div>
  );
}

export default CorrectScreen;
