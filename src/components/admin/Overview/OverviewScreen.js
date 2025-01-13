// src/components/admin/Overview/OverviewScreen.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase"; // Adjust path
import styles from "./OverviewScreen.module.css";

function OverviewScreen() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  // 1) Fetch contests
  useEffect(() => {
    async function fetchContests() {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setContests(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, []);

  // 2) Create new contest
  const handleCreateContest = async () => {
    if (!name.trim()) {
      alert("Please enter a contest name.");
      return;
    }
    try {
      const { error } = await supabase.from("contests").insert([
        {
          name,
          date,
          lobby_open: false,
          submission_open: false,
          current_round: 1,
        },
      ]);
      if (error) throw error;

      // Refresh
      const { data } = await supabase
        .from("contests")
        .select("*")
        .order("created_at", { ascending: false });
      setContests(data || []);

      setName("");
      setDate("");
    } catch (err) {
      alert("Error creating contest: " + err.message);
    }
  };

  // 3) Navigate to detail
  const handleCardClick = (contestId) => {
    navigate(`/admin/${contestId}`);
  };

  if (loading) return <div className={styles.loading}>Loading Contests...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.overviewContainer}>
      <h2 className={styles.heading}>All Contests</h2>

      {/* Create Contest Form */}
      <div className={styles.createArea}>
        <h3>Create a New Contest</h3>
        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="Contest Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleCreateContest} className={styles.button}>
            Create
          </button>
        </div>
      </div>

      {/* Grid of existing contests */}
      <div className={styles.grid}>
        {contests.map((contest) => (
          <div
            key={contest.id}
            className={styles.card}
            onClick={() => handleCardClick(contest.id)}
          >
            <h4>{contest.name}</h4>
            {contest.date && (
              <p className={styles.cardInfo}>
                {new Date(contest.date).toLocaleString()}
              </p>
            )}
            <p className={styles.cardInfo}>
              Round {contest.current_round} | Lobby:{" "}
              {contest.lobby_open ? "Open" : "Closed"} | Submissions:{" "}
              {contest.submission_open ? "Open" : "Closed"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OverviewScreen;
