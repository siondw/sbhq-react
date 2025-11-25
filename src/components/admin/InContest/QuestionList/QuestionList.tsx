import React from "react";
import styles from "./QuestionList.module.css";
import { AdminQuestion } from "../CurrentQuestionView/CurrentQuestionView";

interface QuestionsListProps {
  questions: AdminQuestion[];
  onEditQuestion: (question: AdminQuestion) => void;
}

function QuestionsList({ questions, onEditQuestion }: QuestionsListProps) {
  return (
    <div className={styles.questionsList}>
      <h3>All Questions</h3>
      {questions.map((q) => {
        const correctOption = q.correct_option || null;
        return (
          <div key={q.id} className={styles.questionItem}>
            <div>
              <strong>Round {q.round}</strong>: {q.question}
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
