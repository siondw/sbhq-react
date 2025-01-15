import React, { useState, useEffect, useCallback } from "react";
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

  // Log question and state info for debugging
  console.log("Current Question ID:", questionId);
  console.log("Current Answers Distribution:", answersDistribution);
  console.log("Total Answers:", totalAnswers);

  // Fetch answers distribution
  const fetchAnswersDistribution = useCallback(async () => {
    if (!questionId) {
      console.warn("fetchAnswersDistribution: No question ID, skipping fetch.");
      return;
    }

    console.log("Fetching answers distribution for question ID:", questionId);

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

      console.log("Fetched Answers Distribution:", counts);

      setAnswersDistribution(counts);
      setTotalAnswers(Object.values(counts).reduce((sum, val) => sum + val, 0));
    } catch (err) {
      console.error("Error fetching distribution:", err);
    }
  }, [questionId, contest.id, roundNumber]);

  useEffect(() => {
    // Initial fetch
    console.log("Running useEffect for initial data fetch and subscription.");
    fetchAnswersDistribution();

    if (!questionId) {
      console.warn("useEffect: No question ID, skipping subscription setup.");
      return;
    }

    // Subscribe to real-time changes
    console.log("Setting up real-time subscription for question ID:", questionId);

    const channel = supabase
      .channel(`answers-contest-${contest.id}-round-${roundNumber}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "answers",
          filter: `contest_id=eq.${contest.id},round=eq.${roundNumber}`,
        },
        (payload) => {
          console.log("Real-time insert event received:", payload);
          fetchAnswersDistribution();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up subscription for question ID:", questionId);
      supabase.removeChannel(channel);
    };
  }, [questionId, contest.id, roundNumber, fetchAnswersDistribution]);

  if (!currentQ) {
    console.log("No question for the current round:", roundNumber);
    return (
      <div className={styles.noQuestion}>
        <p>No question set for Round {roundNumber} yet.</p>
        <button onClick={onCreateQuestion}>Create Question</button>
      </div>
    );
  }

  const { question, options, correct_option } = currentQ;

  async function handleSetCorrectOption() {
    if (!pendingCorrectOption) {
      alert("Please select an option to mark correct.");
      return;
    }

    console.log("Setting correct option:", pendingCorrectOption);

    try {
      const { error } = await supabase
        .from("questions")
        .update({ correct_option: pendingCorrectOption })
        .eq("id", questionId);

      if (error) throw error;

      console.log("Correct option set successfully:", pendingCorrectOption);

      currentQ.correct_option = pendingCorrectOption;
      setPendingCorrectOption("");
      alert("Correct option set!");
    } catch (err) {
      console.error("Error setting correct_option:", err);
      alert("Error setting correct option. Check console.");
    }
  }

  const total = totalAnswers;
  let numCorrect = 0;
  let numWrong = 0;

  if (correct_option) {
    numCorrect = answersDistribution[correct_option] || 0;
    numWrong = total - numCorrect;

    console.log(`Correct answers: ${numCorrect}, Wrong answers: ${numWrong}`);
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
