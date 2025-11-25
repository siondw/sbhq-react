import React, { useState } from "react";
import { supabase } from "../../../../supabase";
import styles from "./QuestionModal.module.css";
import { AdminQuestion } from "../CurrentQuestionView/CurrentQuestionView";

interface QuestionModalProps {
  contestId: string;
  question: AdminQuestion | null;
  onClose: () => void;
  onSavedOrDeleted: () => void;
}

function QuestionModal({
  contestId,
  question,
  onClose,
  onSavedOrDeleted,
}: QuestionModalProps) {
  const isEditing = !!question;
  const initialOptions = Array.isArray(question?.options)
    ? question.options
    : Object.values(question?.options || {});
  const [round, setRound] = useState(question?.round || 1);
  const [questionText, setQuestionText] = useState(question?.question || "");
  const [options, setOptions] = useState<string[]>(initialOptions || ["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(question?.correct_option || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOptionChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const newOptions = [...options];
    newOptions[idx] = e.target.value;
    setOptions(newOptions);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!questionText.trim()) {
      alert("Question text cannot be empty.");
      return;
    }
    const finalOptions = options.filter((opt) => opt.trim());
    try {
      setLoading(true);
      setError(null);

      if (!isEditing) {
        const { error } = await supabase.from("questions").insert({
          contest_id: contestId,
          round,
          question: questionText,
          options: finalOptions,
          correct_option: correctOption || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("questions")
          .update({
            round,
            question: questionText,
            options: finalOptions,
            correct_option: correctOption || null,
          })
          .eq("id", question.id);
        if (error) throw error;
      }

      onSavedOrDeleted();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error saving question:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!question) return;
    const confirmDelete = window.confirm("Delete this question?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", question.id);
      if (error) throw error;

      onSavedOrDeleted();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error deleting question:", err);
      setError(message);
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
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Options:</label>
            <div className={styles.optionsGrid}>
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  className={styles.optionInput}
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(e, idx)}
                />
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Correct Answer (optional):</label>
            <input
              type="text"
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
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
