// src/components/admin/Overview/CreateContestModal.js

import React, { useState } from "react";
import { supabase } from "../../../supabase"; 
import styles from "./CreateContestModal.module.css";

function CreateContestModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(""); // "2025-01-12T21:00"
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide a contest name.");
      return;
    }
    if (!date) {
      alert("Please choose a date/time.");
      return;
    }
    if (!price) {
      alert("Please provide a price.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Insert a new row with defaults
      // current_round=0, finished=false, lobby_open=false, submission_open=false
      const { error } = await supabase.from("contests").insert([
        {
          name,
          start_time: date, // "2025-01-12T21:00"
          price,
          current_round: 0,
          finished: false,
          lobby_open: false,
          submission_open: false,
        },
      ]);
      if (error) throw error;

      // Fire onCreated so parent can refresh data
      onCreated();
      // Close modal
      onClose();
    } catch (err) {
      console.error("Error creating contest:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Create New Contest</h2>

        {/* The form */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Contest Name:</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Trivia Night"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Date & Time:</label>
            <input
              type="datetime-local"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Price:</label>
            <input
              type="text"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="E.g. 10.00"
            />
          </div>

          {error && <div className={styles.error}>Error: {error}</div>}

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateContestModal;
