// src/pages/Admin/ContestDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabase"; // or wherever your supabase client is
import styles from "./ContestDetail.module.css"; // Example CSS module for dark styling

function ContestDetail() {
  const { id: contestId } = useParams(); // contestId from the route
  const [contest, setContest] = useState(null);
  const [loadingContest, setLoadingContest] = useState(true);

  // Toggles
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState(["", ""]);
  const [newQuestionRound, setNewQuestionRound] = useState(1);

  // For the pie chart (submission distribution)
  const [pieData, setPieData] = useState([]); // e.g. [{ option: "A", count: 10 }, { option: "B", count: 5 }]

  // 1) Fetch the contest info
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("*")
          .eq("id", contestId)
          .single();

        if (error || !data) {
          throw error || new Error("Contest not found");
        }
        setContest(data);
        setLobbyOpen(data.lobby_open);
        setSubmissionsOpen(data.submission_open);
        setCurrentRound(data.current_round);
      } catch (err) {
        console.error("Error fetching contest:", err);
      } finally {
        setLoadingContest(false);
      }
    };
    fetchContest();
  }, [contestId]);

  // 2) Fetch questions for this contest
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!contestId) return;
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("contest_id", contestId)
          .order("round", { ascending: true });

        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, [contestId]);

  // 3) (Optional) Poll or subscribe for “pieData” (submission distribution)
  // For demonstration, let's do a simple fetch on mount
  // and add a refresh button. You could also poll every X seconds if you like.
  const fetchPieData = async () => {
    try {
      // EXAMPLE: We'll assume we have an "answers" table with:
      //  question_id, answer, count or we sum up
      // We'll just gather the last question or something.
      // For real usage, you'd adapt to your actual structure or a specific question
      if (questions.length === 0) return;
      const lastQuestionId = questions[questions.length - 1].id;

      const { data: answers, error } = await supabase
        .from("answers")
        .select("answer")
        .eq("question_id", lastQuestionId);
      if (error) throw error;

      // Tally up counts by answer
      const counts = {};
      answers.forEach((row) => {
        counts[row.answer] = (counts[row.answer] || 0) + 1;
      });
      // Convert to array
      const distribution = Object.entries(counts).map(([option, count]) => ({
        option,
        count,
      }));
      setPieData(distribution);
    } catch (err) {
      console.error("Error fetching pie data:", err);
    }
  };

  useEffect(() => {
    fetchPieData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // ============ Contest Toggles ============

  const handleToggleLobby = async () => {
    try {
      const { error } = await supabase
        .from("contests")
        .update({ lobby_open: !lobbyOpen })
        .eq("id", contestId);
      if (error) throw error;
      setLobbyOpen((prev) => !prev);
    } catch (err) {
      console.error("Error toggling lobby:", err);
    }
  };

  const handleToggleSubmissions = async () => {
    try {
      const { error } = await supabase
        .from("contests")
        .update({ submission_open: !submissionsOpen })
        .eq("id", contestId);
      if (error) throw error;
      setSubmissionsOpen((prev) => !prev);
    } catch (err) {
      console.error("Error toggling submissions:", err);
    }
  };

  const handleNextRound = async () => {
    try {
      const newRound = currentRound + 1;
      const { error } = await supabase
        .from("contests")
        .update({ current_round: newRound })
        .eq("id", contestId);
      if (error) throw error;
      setCurrentRound(newRound);
    } catch (err) {
      console.error("Error incrementing round:", err);
    }
  };

  // ============ Questions Management ============

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) {
      alert("Question text cannot be empty.");
      return;
    }
    // Filter out empty options
    const filledOptions = newQuestionOptions.filter((opt) => opt.trim() !== "");
    if (filledOptions.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    try {
      const { error } = await supabase.from("questions").insert({
        contest_id: contestId,
        text: newQuestionText,
        options: filledOptions,
        round: newQuestionRound,
        correctAnswer: null,
      });

      if (error) throw error;

      // Refresh question list
      setQuestions((prev) => [
        ...prev,
        {
          // we can’t get the ID automatically from the insert without returning data,
          // so we’ll do a manual fetch or just approximate:
          id: Math.random().toString(36).substr(2, 9),
          contest_id: contestId,
          text: newQuestionText,
          options: filledOptions,
          round: newQuestionRound,
          correctAnswer: null,
        },
      ]);

      // Reset fields
      setNewQuestionText("");
      setNewQuestionOptions(["", ""]);
      setNewQuestionRound(1);
    } catch (err) {
      console.error("Error adding question:", err);
      alert("Could not add question.");
    }
  };

  // ============ Simple Pie Chart (Pure SVG Example) ============
  // We'll create a small helper to render a pie chart from `pieData`.
  // This is a minimal approach. For a robust chart, you'd likely use chart.js or recharts.

  const PieChart = ({ data = [] }) => {
    // Sum up total
    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) {
      return <div className={styles.chartContainer}>No data yet.</div>;
    }

    // We'll do a simplistic “donut” approach
    let currentAngle = 0;
    return (
      <svg width="200" height="200" viewBox="0 0 32 32" className={styles.chartContainer}>
        {data.map((d, i) => {
          const sliceAngle = (d.count / total) * 360;
          const largeArc = sliceAngle > 180 ? 1 : 0;

          // Convert angles to radians
          const startRadians = (Math.PI * (currentAngle - 90)) / 180;
          const endRadians = (Math.PI * (currentAngle + sliceAngle - 90)) / 180;

          // Start coords
          const x1 = 16 + 16 * Math.cos(startRadians);
          const y1 = 16 + 16 * Math.sin(startRadians);
          // End coords
          const x2 = 16 + 16 * Math.cos(endRadians);
          const y2 = 16 + 16 * Math.sin(endRadians);

          // color pick (just random or from a small palette)
          const color = ["#00bfa6", "#ffcc00", "#ff7f7f", "#66ccff", "#cc66ff"][i % 5];

          const pathData = [
            `M16,16 L${x1},${y1} A16,16 0 ${largeArc} 1 ${x2},${y2} z`,
          ].join(" ");

          currentAngle += sliceAngle;
          return <path d={pathData} fill={color} key={i} />;
        })}
        {/* White circle in the middle to make it a donut */}
        <circle cx="16" cy="16" r="8" fill="#121212" />
      </svg>
    );
  };

  if (loadingContest) return <div className={styles.loading}>Loading Contest...</div>;

  if (!contest) {
    return <div className={styles.error}>Contest not found.</div>;
  }

  // ============ Render UI ============
  return (
    <div className={styles.contestDetail}>
      <h1 className={styles.title}>{contest.name || "Contest Detail"}</h1>

      <div className={styles.togglesRow}>
        <div className={styles.toggleItem}>
          <span>Lobby Open:</span>
          <button onClick={handleToggleLobby} className={styles.toggleButton}>
            {lobbyOpen ? "Yes (Click to Close)" : "No (Click to Open)"}
          </button>
        </div>
        <div className={styles.toggleItem}>
          <span>Submissions Open:</span>
          <button onClick={handleToggleSubmissions} className={styles.toggleButton}>
            {submissionsOpen ? "Yes (Click to Close)" : "No (Click to Open)"}
          </button>
        </div>
        <div className={styles.toggleItem}>
          <span>Current Round: {currentRound}</span>
          <button onClick={handleNextRound} className={styles.toggleButton}>
            Next Round
          </button>
        </div>
      </div>

      {/* Questions Section */}
      <section className={styles.questionsSection}>
        <h2>Questions</h2>
        <div className={styles.newQuestionForm}>
          <label>Question Text:</label>
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            className={styles.input}
          />
          <label>Round:</label>
          <input
            type="number"
            min={1}
            value={newQuestionRound}
            onChange={(e) => setNewQuestionRound(parseInt(e.target.value, 10))}
            className={styles.input}
          />
          <label>Options:</label>
          {newQuestionOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              value={opt}
              onChange={(e) => {
                const copy = [...newQuestionOptions];
                copy[idx] = e.target.value;
                setNewQuestionOptions(copy);
              }}
              placeholder={`Option ${idx + 1}`}
              className={styles.input}
            />
          ))}
          {/* Add a new option if you want more than 2 */}
          <button
            onClick={() => setNewQuestionOptions((prev) => [...prev, ""])}
            className={styles.addOptionButton}
          >
            + Add Option
          </button>

          <button onClick={handleAddQuestion} className={styles.submitButton}>
            Add Question
          </button>
        </div>

        <div className={styles.questionsList}>
          {questions.map((q) => (
            <div key={q.id} className={styles.questionItem}>
              <p>
                <strong>Round {q.round}:</strong> {q.text}
              </p>
              <p>Options: {q.options?.join(", ")}</p>
              <p>Correct Answer: {q.correctAnswer || "Not Set"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pie Chart Section */}
      <section className={styles.chartSection}>
        <h2>Submission Distribution</h2>
        <PieChart data={pieData} />
        <button onClick={fetchPieData} className={styles.refreshButton}>
          Refresh
        </button>
      </section>
    </div>
  );
}

export default ContestDetail;
