import React from "react";
import styles from "./QuestionList.module.css";
import type { QuestionRow } from "../../../../types/sbhq";

type Question = QuestionRow & { correct_option?: string | null; options?: string[] | Record<string, string> | null; text?: string };

interface QuestionsListProps {
  questions: Question[];
  onEditQuestion: (q: Question) => void;
}

function QuestionsList({ questions, onEditQuestion }: QuestionsListProps) {
  if (!questions.length) {
    return (
      <div className={styles.questionsList}>
        <h3>All Questions</h3>
        <p className={styles.noQuestions}>No questions created yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.questionsList}>
      <h3>All Questions</h3>
      {questions.map((q) => {
        const correctOption = q.correct_option || null;
        const questionText = q.question || q.text || "";
        const opts = Array.isArray(q.options) ? q.options : Object.values(q.options || {});
        return (
          <div key={q.id} className={styles.questionItem}>
            <div>
              <strong>Round {q.round}</strong>: {questionText}
            </div>
            {opts.length > 0 && <div>Options: {opts.join(", ")}</div>}
            {correctOption && <div className={styles.correctLabel}>Correct: {correctOption}</div>}
            <button onClick={() => onEditQuestion(q)}>Edit</button>
          </div>
        );
      })}
    </div>
  );
}

export default QuestionsList;
