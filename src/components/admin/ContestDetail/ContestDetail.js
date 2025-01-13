// src/components/admin/ContestDetail/ContestDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../supabase"; // adjust import path
import styles from "./ContestDetail.module.css";

function ContestDetail() {
  const { id } = useParams(); // The contest ID from /admin/:id
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toggles
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [newQText, setNewQText] = useState("");
  const [newQOptions, setNewQOptions] = useState(["", ""]);
  const [newQRound, setNewQRound] = useState(1);

  // Pie Data (submissions distribution)
  const [pieData, setPieData] = useState([]);

  // 1) Fetch Contest
  useEffect(() => {
    async function fetchContest() {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("*")
          .eq("id", id)
          .single();
        if (error || !data) throw error || new Error("Contest not found.");
        setContest(data);
        setLobbyOpen(data.lobby_open);
        setSubmissionsOpen(data.submission_open);
        setCurrentRound(data.current_round);
      } catch (err) {
        console.error("Error fetching contest:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContest();
  }, [id]);

  // 2) Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("contest_id", id)
          .order("round", { ascending: true });
        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    }
    fetchQuestions();
  }, [id]);

  // 3) Toggle Lobby
  const handleToggleLobby = async () => {
    const updated = !lobbyOpen;
    try {
      const { error } = await supabase
        .from("contests")
        .update({ lobby_open: updated })
        .eq("id", id);
      if (error) throw error;
      setLobbyOpen(updated);
    } catch (err) {
      console.error("Error toggling lobby:", err);
    }
  };

  // 4) Toggle Submissions
  const handleToggleSubmissions = async () => {
    const updated = !submissionsOpen;
    try {
      const { error } = await supabase
        .from("contests")
        .update({ submission_open: updated })
        .eq("id", id);
      if (error) throw error;
      setSubmissionsOpen(updated);
    } catch (err) {
      console.error("Error toggling submissions:", err);
    }
  };

  // 5) Next Round
  const handleNextRound = async () => {
    try {
      const newRound = currentRound + 1;
      const { error } = await supabase
        .from("contests")
        .update({ current_round: newRound })
        .eq("id", id);
      if (error) throw error;
      setCurrentRound(newRound);
    } catch (err) {
      console.error("Error updating round:", err);
    }
  };

  // 6) Add Question
  const handleAddQuestion = async () => {
    if (!newQText.trim()) {
      alert("Question text cannot be empty.");
      return;
    }
    const filledOptions = newQOptions.filter((opt) => opt.trim() !== "");
    if (filledOptions.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    try {
      const { error } = await supabase.from("questions").insert({
        contest_id: id,
        text: newQText,
        options: filledOptions,
        round: newQRound,
        correctAnswer: null,
      });
      if (error) throw error;

      // add to local state
      setQuestions((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          text: newQText,
          options: filledOptions,
          round: newQRound,
          contest_id: id,
        },
      ]);

      // reset
      setNewQText("");
      setNewQOptions(["", ""]);
      setNewQRound(1);
    } catch (err) {
      console.error("Error adding question:", err);
    }
  };

  // 7) Pie Chart data
  const fetchPieData = async () => {
    if (questions.length === 0) {
      setPieData([]);
      return;
    }
    // e.g. look at last question
    const lastQuestionId = questions[questions.length - 1].id;
    try {
      const { data, error } = await supabase
        .from("answers")
        .select("answer")
        .eq("question_id", lastQuestionId);
      if (error) throw error;

      const counts = {};
      data.forEach((row) => {
        counts[row.answer] = (counts[row.answer] || 0) + 1;
      });
      const dist = Object.entries(counts).map(([option, count]) => ({ option, count }));
      setPieData(dist);
    } catch (err) {
      console.error("Error fetching pie data:", err);
    }
  };

  useEffect(() => {
    fetchPieData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // Minimal Pie
  const PieChart = ({ data }) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) {
      return <div className={styles.noData}>No data yet.</div>;
    }
    let currentAngle = 0;
    return (
      <svg width="200" height="200" viewBox="0 0 32 32" className={styles.pieSvg}>
        {data.map((d, i) => {
          const sliceAngle = (d.count / total) * 360;
          const largeArc = sliceAngle > 180 ? 1 : 0;
          const start = ((currentAngle - 90) * Math.PI) / 180;
          const end = ((currentAngle + sliceAngle - 90) * Math.PI) / 180;
          const x1 = 16 + 16 * Math.cos(start);
          const y1 = 16 + 16 * Math.sin(start);
          const x2 = 16 + 16 * Math.cos(end);
          const y2 = 16 + 16 * Math.sin(end);
          const pathData = `M16 16 L ${x1} ${y1} A 16 16 0 ${largeArc} 1 ${x2} ${y2} z`;
          const color = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"][i % 4];

          currentAngle += sliceAngle;
          return <path key={i} d={pathData} fill={color} />;
        })}
        <circle cx="16" cy="16" r="8" fill="#121212" />
      </svg>
    );
  };

  if (loading) return <div className={styles.loading}>Loading Contest...</div>;
  if (!contest) return <div className={styles.error}>Contest not found.</div>;

  return (
    <div className={styles.detailContainer}>
      <h2 className={styles.detailTitle}>{contest.name}</h2>
      <p className={styles.statusText}>
        Round {currentRound} | Lobby: {lobbyOpen ? "Open" : "Closed"} | Submissions:{" "}
        {submissionsOpen ? "Open" : "Closed"}
      </p>

      <div className={styles.buttonRow}>
        <button onClick={handleToggleLobby}>
          {lobbyOpen ? "Close Lobby" : "Open Lobby"}
        </button>
        <button onClick={handleToggleSubmissions}>
          {submissionsOpen ? "Close Submissions" : "Open Submissions"}
        </button>
        <button onClick={handleNextRound}>Next Round</button>
        <button onClick={fetchPieData}>Refresh Pie</button>
      </div>

      {/* Create Question */}
      <div className={styles.questionBox}>
        <h3>Create New Question</h3>
        <input
          type="text"
          value={newQText}
          onChange={(e) => setNewQText(e.target.value)}
          placeholder="Question text"
          className={styles.input}
        />
        <div className={styles.roundRow}>
          <label>Round:</label>
          <input
            type="number"
            min={1}
            value={newQRound}
            onChange={(e) => setNewQRound(parseInt(e.target.value, 10))}
          />
        </div>
        <div className={styles.optionsBlock}>
          {newQOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              value={opt}
              onChange={(e) => {
                const copy = [...newQOptions];
                copy[idx] = e.target.value;
                setNewQOptions(copy);
              }}
              placeholder={`Option ${idx + 1}`}
            />
          ))}
          <button onClick={() => setNewQOptions((prev) => [...prev, ""])}>+ Add Option</button>
        </div>
        <button onClick={handleAddQuestion}>Add Question</button>
      </div>

      {/* Existing Questions */}
      <div className={styles.questionsList}>
        <h3>Existing Questions</h3>
        {questions.length === 0 ? (
          <p>No questions yet.</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className={styles.questionItem}>
              <p>
                <strong>Round {q.round}</strong>: {q.text}
              </p>
              <p className={styles.smallText}>Options: {q.options?.join(", ")}</p>
            </div>
          ))
        )}
      </div>

      {/* Pie Chart */}
      <div className={styles.pieBox}>
        <h3>Submission Distribution (Last Question)</h3>
        <PieChart data={pieData} />
      </div>
    </div>
  );
}

export default ContestDetail;
