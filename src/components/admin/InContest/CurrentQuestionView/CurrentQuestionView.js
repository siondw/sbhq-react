// src/components/admin/InContest/CurrentQuestionView/CurrentQuestionView.js
import React, { useState, useEffect, useCallback } from "react"; // Add useCallback
import { supabase } from "../../../../supabase"; // adjust path
import styles from "./CurrentQuestionView.module.css";

function CurrentQuestionView({
  contest,
  roundNumber,
  submissionOpen,
  questions,
  onCreateQuestion,
}) {
  const [pendingCorrectOption, setPendingCorrectOption] = useState("");
  const [answersDistribution, setAnswersDistribution] = useState({});
  const [totalAnswers, setTotalAnswers] = useState(0);

  // Identify the question for this round (may be undefined)
  const currentQ = questions.find((q) => q.round === roundNumber);
  const questionId = currentQ?.id;

  // Wrap in useCallback
  const fetchAnswersDistribution = useCallback(async () => {
    if (!questionId) return;
    try {
      const { data: answers, error } = await supabase
        .from("answers")
        .select("answer")
        .eq("contest_id", contest.id)
        .eq("round", roundNumber);
      
      if (error) throw error;

      const counts = {};
      answers.forEach((row) => {
        const ans = row.answer || "No Answer";
        counts[ans] = (counts[ans] || 0) + 1;
      });
      setAnswersDistribution(counts);
      setTotalAnswers(Object.values(counts).reduce((sum, val) => sum + val, 0));
    } catch (err) {
      console.error("Error fetching distribution:", err);
    }
  }, [questionId, contest.id, roundNumber]); // Add dependencies

  // Always call useEffect — never conditionally
  useEffect(() => {
    // Fetch initial distribution
    fetchAnswersDistribution();

    // If there's no valid question, skip subscription setup
    if (!questionId) return;

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`answers-contest-${contest.id}-round-${roundNumber}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
          filter: `contest_id=eq.${contest.id},round=eq.${roundNumber}`,
        },
        () => {
          fetchAnswersDistribution();
        }
      )      
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, contest.id, roundNumber, fetchAnswersDistribution]); // Add fetchAnswersDistribution

  // If no question, show generic UI; Hook is already called above
  if (!currentQ) {
    return (
      <div className={styles.noQuestion}>
        <p>No question set for Round {roundNumber} yet.</p>
        <button onClick={onCreateQuestion}>Create Question</button>
      </div>
    );
  }

  // Deconstruct fields from the found question
  const { question, options, correct_option } = currentQ;

  // Handler to set correct_option
  async function handleSetCorrectOption() {
    if (!pendingCorrectOption) {
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

  // Summaries if there's a correct option
  const total = totalAnswers;
  let numCorrect = 0;
  let numWrong = 0;
  if (correct_option) {
    numCorrect = answersDistribution[correct_option] || 0;
    numWrong = total - numCorrect;
  }

  return (
    <div className={styles.currentQWrapper}>
      <h2>Round {roundNumber}</h2>
      <h3>{question}</h3>

      {submissionOpen ? (
        <div className={styles.openPhase}>
          <p>Submissions are open! (Real-time distribution):</p>
          {options?.map((opt) => (
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
                {options?.map((opt, idx) => (
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

              <div className={styles.distributionBox}>
                <p>Submissions distribution:</p>
                {options?.map((opt) => (
                  <div key={opt} className={styles.optionRow}>
                    <strong>{opt}:</strong> {answersDistribution[opt] || 0} response(s)
                  </div>
                ))}
                <div className={styles.optionRow}>
                  <strong>Total submissions:</strong> {total}
                </div>
              </div>
            </>
          ) : (
            <>
              <p>
                Submissions closed. The correct option is:{" "}
                <strong>{correct_option}</strong>.
              </p>
              <div className={styles.distributionBox}>
                <p>Final distribution:</p>
                {options?.map((opt) => (
                  <div
                    key={opt}
                    className={
                      opt === correct_option ? `${styles.optionRow} ${styles.correctHighlight}` : styles.optionRow
                    }
                  >
                    <strong>{opt}:</strong> {answersDistribution[opt] || 0} response(s)
                  </div>
                ))}
                <div className={styles.optionRow}>
                  <strong>Total submissions:</strong> {total}
                </div>
                <p>
                  Correct: {numCorrect} &nbsp;|&nbsp; Wrong: {numWrong}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CurrentQuestionView;
