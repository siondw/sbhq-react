import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../supabase";
import styles from "./CurrentQuestionView.module.css";
import type { QuestionRow } from "../../../../types/sbhq";

type Question = QuestionRow & { options?: string[] | Record<string, string> | null; correct_option?: string | null };

interface CurrentQuestionViewProps {
  roundNumber: number;
  submissionOpen: boolean;
  questions: Question[];
  onCreateQuestion: () => void;
}

function CurrentQuestionView({ roundNumber, submissionOpen, questions, onCreateQuestion }: CurrentQuestionViewProps) {
  const [pendingCorrectOption, setPendingCorrectOption] = useState("");
  const [answersDistribution, setAnswersDistribution] = useState<Record<string, number>>({});
  const [totalAnswers, setTotalAnswers] = useState(0);

  // Identify the question for this round (may be undefined)
  const currentQ = questions.find((q) => q.round === roundNumber);
  const questionId = currentQ?.id;
  const normalizedOptions = currentQ
    ? Array.isArray(currentQ.options)
      ? currentQ.options
      : Object.values(currentQ.options || {})
    : [];

  // Fetch answers distribution
  const fetchAnswersDistribution = useCallback(async () => {
    if (!questionId) {
      console.warn("fetchAnswersDistribution: No question ID, skipping fetch.");
      return;
    }

    try {
      const { data: answers, error } = await supabase
        .from("answers")
        .select("answer")
        .eq("question_id", questionId); // Updated to use question_id

      if (error) throw error;

      const counts: Record<string, number> = {};
      (answers || []).forEach((row) => {
        const ans = (row as { answer?: string }).answer || "No Answer";
        counts[ans] = (counts[ans] || 0) + 1;
      });

      setAnswersDistribution(counts);
      setTotalAnswers(Object.values(counts).reduce((sum, val) => sum + (val as number), 0));
    } catch (err) {
      console.error("Error fetching distribution:", err);
    }
  }, [questionId]);

  useEffect(() => {
    fetchAnswersDistribution();

    if (!questionId) {
      console.warn("useEffect: No question ID, skipping subscription setup.");
      return;
    }

    const channel = supabase
      .channel(`answers-question-${questionId}`) // Updated channel name
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "answers",
          filter: `question_id=eq.${questionId}`, // Updated to filter by question_id
        },
        () => {
          fetchAnswersDistribution();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, fetchAnswersDistribution]);

  if (!currentQ) {
    return (
      <div className={styles.noQuestion}>
        <p>No question set for Round {roundNumber} yet.</p>
        <button onClick={onCreateQuestion}>Create Question</button>
      </div>
    );
  }

  const { question, correct_option } = currentQ;

  async function handleSetCorrectOption() {
    if (!pendingCorrectOption || !questionId) {
      alert("Please select an option to mark correct.");
      return;
    }

    try {
      const { error } = await supabase
        .from("questions")
        .update({ correct_option: pendingCorrectOption })
        .eq("id", questionId);

      if (error) throw error;

      currentQ.correct_option = pendingCorrectOption;
      setPendingCorrectOption("");
      alert("Correct option set!");
    } catch (err) {
      console.error("Error setting correct_option:", err);
      alert("Error setting correct option. Check console.");
    }
  }

  const total = totalAnswers;

  return (
    <div className={styles.currentQWrapper}>
      <h2>Round {roundNumber}</h2>
      <h3>{question}</h3>

      {submissionOpen ? (
        <div className={styles.openPhase}>
          <p>Submissions are open! (Real-time distribution):</p>
          {normalizedOptions?.map((opt) => (
            <div key={opt} className={styles.optionRow}>
              <strong>{opt}:</strong> {answersDistribution[opt] || 0} response(s)
            </div>
          ))}
          <div className={styles.optionRow}>
            <strong>Total submissions:</strong> {total}
          </div>
        </div>
      ) : (
        <div className={styles.closedPhase}>
          {!correct_option ? (
            <>
              <p>Submissions closed. Set the correct option:</p>
              <div className={styles.optionsList}>
                {normalizedOptions?.map((opt, idx) => (
                  <label key={idx} className={styles.optionItem}>
                    <input
                      type="radio"
                      name="correctOption"
                      value={opt}
                      onChange={(e) => setPendingCorrectOption(e.target.value)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <button
                onClick={handleSetCorrectOption}
                className={styles.confirmButton}
              >
                Confirm Correct Option
              </button>
            </>
          ) : (
            <>
              <p>
                Submissions closed. The correct option is:{" "}
                <strong>{correct_option}</strong>.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CurrentQuestionView;
