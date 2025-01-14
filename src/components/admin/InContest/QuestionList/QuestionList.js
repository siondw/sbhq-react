// src/components/admin/InContest/QuestionList/QuestionsList.js
import React from "react";
import styles from "./QuestionsList.module.css";

function QuestionsList({ questions, onEditQuestion }) {
  return (
    <div className={styles.questionsList}>
      <h3>All Questions</h3>
      {questions.map((q) => {
        const correctOption = q.correctAnswer || null; // or however you store it
        // Possibly stats: how many got it right/wrong?
        return (
          <div key={q.id} className={styles.questionItem}>
            <div>
              <strong>Round {q.round}</strong>: {q.text}
            </div>
            {correctOption && (
              <div className={styles.correctLabel}>
                Correct: {correctOption}
                {/* Later you can show how many got it right/wrong if you store stats */}
              </div>
            )}
            <button onClick={() => onEditQuestion(q)}>Edit</button>
          </div>
        );
      })}
    </div>
  );
}

export default QuestionsList;
