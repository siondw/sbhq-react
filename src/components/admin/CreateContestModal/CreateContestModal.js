import React, { useState } from "react";
import { supabase } from "../../../supabase";
import styles from "./CreateContestModal.module.css";

function CreateContestModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(""); // Expected "YYYY-MM-DDTHH:mm"
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validate form fields
    if (!name.trim()) {
      setError("Please provide a contest name.");
      return;
    }
    if (!date) {
      setError("Please choose a date and time.");
      return;
    }
    if (!price || isNaN(price)) {
      setError("Please provide a valid numeric price.");
      return;
    }

    setLoading(true);

    try {
      // Parse and convert local date to UTC
      const localDate = new Date(date);
      const utcDate = localDate.toISOString();

      // Insert into the database
      const { error } = await supabase.from("contests").insert([
        {
          name: name.trim(),
          start_time: utcDate, // Save as UTC ISO string
          price: parseFloat(price),
          current_round: 0,
          finished: false,
          lobby_open: false,
          submission_open: false,
        },
      ]);

      if (error) throw error;

      // Refresh parent data and close modal
      onCreated();
      onClose();
    } catch (err) {
      console.error("Error during contest creation:", err);
      setError("Failed to create contest. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Create New Contest</h2>

        {/* Form */}
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

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateContestModal;
