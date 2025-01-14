// src/components/admin/InContest/QuestionModal/QuestionModal.js
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../supabase";
import styles from "./QuestionModal.module.css";

function QuestionModal({ contestId, question, onClose, onSavedOrDeleted }) {
  // question=null means "creating new," otherwise we load existing
  const isEditing = !!question;
  const [round, setRound] = useState(question?.round || 1);
  const [text, setText] = useState(question?.text || "");
  const [options, setOptions] = useState(question?.options || ["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // handle create/update
  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) {
      alert("Question text cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      if (!isEditing) {
        // Create new
        const { error } = await supabase.from("questions").insert({
          contest_id: contestId,
          round,
          text,
          options,
          correctAnswer: correctAnswer || null,
        });
        if (error) throw error;
      } else {
        // Update existing
        const { error } = await supabase
          .from("questions")
          .update({
            round,
            text,
            options,
            correctAnswer: correctAnswer || null,
          })
          .eq("id", question.id);
        if (error) throw error;
      }

      // done
      onSavedOrDeleted();
    } catch (err) {
      console.error("Error saving question:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // handle delete
  async function handleDelete() {
    if (!question) return;
    const confirm = window.confirm("Delete this question?");
    if (!confirm) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", question.id);
      if (error) throw error;

      onSavedOrDeleted();
    } catch (err) {
      console.error("Error deleting question:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{isEditing ? "Edit Question" : "Create Question"}</h2>
        {error && <div className={styles.error}>Error: {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Round:</label>
            <input
              type="number"
              value={round}
              onChange={(e) => setRound(parseInt(e.target.value, 10))}
              min={1}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Question Text:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Options (comma separated or array):</label>
            {/* a simple approach or you can do more advanced UI */}
            <textarea
              value={options.join("\n")}
              onChange={(e) => setOptions(e.target.value.split("\n"))}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Correct Answer (optional):</label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={styles.deleteButton}
              >
                Delete
              </button>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionModal;
