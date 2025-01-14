// src/components/admin/InContest/CurrentQuestionView/CurrentQuestionView.js
import React from "react";
import styles from "./CurrentQuestionView.module.css";

function CurrentQuestionView({
  contest,
  roundNumber,
  submissionOpen,
  questions,
  onCreateQuestion,
}) {
  // Find the "current question" for this round
  const currentQ = questions.find((q) => q.round === roundNumber);
  
  // We'll do simple logic: if no currentQ -> prompt user to create
  if (!currentQ) {
    return (
      <div className={styles.noQuestion}>
        <p>No question set for Round {roundNumber} yet.</p>
        <button onClick={onCreateQuestion}>Create Question</button>
      </div>
    );
  }

  // If we have a current question, show it
  return (
    <div className={styles.currentQWrapper}>
      <h2>Round {roundNumber}</h2>
      <h3>{currentQ.text}</h3>
      {/* If submissionOpen is true, show a partial pie chart or “N participants answered” maybe?
          For now, just a placeholder */}
      {submissionOpen ? (
        <p>Submissions are open! (Show distribution or poll for # answered...)</p>
      ) : (
        <p>Submissions are closed or not opened yet.</p>
      )}
      {/* Could also show “Set Correct Answer” if none is set, etc. */}
      {/* We'll keep it simple for now. */}
    </div>
  );
}

export default CurrentQuestionView;
