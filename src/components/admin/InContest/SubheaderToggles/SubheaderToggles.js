// src/components/admin/InContest/SubheaderToggles.js
import React from "react";
import styles from "./SubheaderToggles.module.css";

function SubheaderToggles({
  lobbyOpen,
  submissionOpen,
  finished,
  onToggleLobby,
  onToggleSubmission,
  onToggleFinished,
  roundNumber,
  onIncrementRound,
}) {
  return (
    <div className={styles.subheader}>
      <div className={styles.toggleItem}>
        <span>Lobby:</span>
        <button onClick={onToggleLobby} className={styles.toggleButton}>
          {lobbyOpen ? "ON" : "OFF"}
        </button>
      </div>
      <div className={styles.toggleItem}>
        <span>Submissions:</span>
        <button onClick={onToggleSubmission} className={styles.toggleButton}>
          {submissionOpen ? "ON" : "OFF"}
        </button>
      </div>
      <div className={styles.toggleItem}>
        <span>Finished:</span>
        <button onClick={onToggleFinished} className={styles.toggleButton}>
          {finished ? "ON" : "OFF"}
        </button>
      </div>

      <div className={styles.roundContainer}>
        <span>Round: {roundNumber}</span>
        {/* Up/down arrows */}
        <button onClick={() => onIncrementRound(+1)}>▲</button>
        <button onClick={() => onIncrementRound(-1)}>▼</button>
      </div>
    </div>
  );
}

export default SubheaderToggles;
