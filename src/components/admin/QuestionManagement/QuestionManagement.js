// src/components/QuestionManagement/QuestionManagement.js
import React, { useState, useEffect } from "react";
import styles from "./QuestionManagement.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../supabase";

const QuestionManagement = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [contests, setContests] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    round: 1,
    contestId: "",
  });
  const [selectedContestId, setSelectedContestId] = useState("");

  // For editing an existing question
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    round: 1,
    correctAnswer: "",
  });

  // 1) Fetch contests from Supabase on mount
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("id, name");
        if (error) throw error;
        setContests(data || []);
      } catch (err) {
        console.error("Error fetching contests:", err.message);
      }
    };
    fetchContests();
  }, []);

  // 2) Whenever selectedContestId changes, fetch that contest’s questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedContestId) {
        setQuestions([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("id, text, options, round, correctAnswer") // Adjust your column names
          .eq("contest_id", selectedContestId);
        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error("Error fetching questions:", err.message);
      }
    };
    fetchQuestions();
  }, [selectedContestId]);

  // 3) Handle adding a new question
  const handleAddQuestion = async () => {
    if (!newQuestion.contestId) {
      alert("Please select a contest before adding a question.");
      return;
    }
    if (!newQuestion.text.trim()) {
      alert("Question text cannot be empty.");
      return;
    }

    // Filter out empty options
    const filledOptions = newQuestion.options.filter((opt) => opt.trim() !== "");
    if (filledOptions.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    try {
      const { error } = await supabase.from("questions").insert({
        contest_id: newQuestion.contestId,
        text: newQuestion.text,
        options: filledOptions,
        round: newQuestion.round,
        correctAnswer: null,
      });
      if (error) throw error;

      // Reset the form
      setNewQuestion({
        text: "",
        options: ["", "", "", ""],
        round: 1,
        contestId: newQuestion.contestId,
      });

      // Re-fetch questions
      setSelectedContestId(newQuestion.contestId);
    } catch (err) {
      console.error("Error adding question:", err.message);
      alert("There was an error adding the question. Please try again.");
    }
  };

  // 4) Enter “edit mode” for an existing question
  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({
      text: question.text,
      options: question.options || ["", "", "", ""],
      round: question.round,
      correctAnswer: question.correctAnswer || "",
    });
  };

  // 5) Save changes to an existing question
  const handleSaveEditedQuestion = async () => {
    if (!editingQuestionId) return;

    if (!editedQuestion.text.trim()) {
      alert("Question text cannot be empty.");
      return;
    }
    const filledOptions = editedQuestion.options.filter((opt) => opt.trim() !== "");
    if (filledOptions.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    try {
      const { error } = await supabase
        .from("questions")
        .update({
          text: editedQuestion.text,
          options: filledOptions,
          round: editedQuestion.round,
          // If you want to store the correctAnswer here:
          correctAnswer: editedQuestion.correctAnswer || null,
        })
        .eq("id", editingQuestionId);

      if (error) throw error;

      // Re-fetch questions
      setSelectedContestId(newQuestion.contestId || selectedContestId);

      // Exit edit mode
      setEditingQuestionId(null);
      setEditedQuestion({
        text: "",
        options: ["", "", "", ""],
        round: 1,
        correctAnswer: "",
      });
    } catch (err) {
      console.error("Error saving edited question:", err.message);
      alert("There was an error saving the question. Please try again.");
    }
  };

  // 6) Delete a question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);
      if (error) throw error;

      // Re-fetch
      setSelectedContestId(newQuestion.contestId || selectedContestId);
    } catch (err) {
      console.error("Error deleting question:", err.message);
    }
  };

  // 7) Set correct answer for a question quickly (similar to your handleSetCorrectAnswer)
  const handleSetCorrectAnswer = async (questionId, correctAnswer) => {
    if (!correctAnswer) {
      alert("Please choose a correct answer.");
      return;
    }
    try {
      const { error } = await supabase
        .from("questions")
        .update({ correctAnswer })
        .eq("id", questionId);
      if (error) throw error;

      // Re-fetch
      setSelectedContestId(selectedContestId);
      alert("Correct answer set successfully.");
    } catch (err) {
      console.error("Error setting correct answer:", err.message);
      alert("Error setting correct answer. Try again.");
    }
  };

  // 8) Handle typing in the “new question” form or the “editing question” form
  const handleOptionChange = (e, index, isEditing = false) => {
    if (isEditing) {
      const copy = [...editedQuestion.options];
      copy[index] = e.target.value;
      setEditedQuestion((prev) => ({ ...prev, options: copy }));
    } else {
      const copy = [...newQuestion.options];
      copy[index] = e.target.value;
      setNewQuestion((prev) => ({ ...prev, options: copy }));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Question Management</h2>

      {/* Contest Selector */}
      <div className={styles.formGroup}>
        <label htmlFor="contestSelect" className={styles.label}>
          Select Contest:
        </label>
        <select
          id="contestSelect"
          value={selectedContestId}
          onChange={(e) => {
            setSelectedContestId(e.target.value);
            setNewQuestion((prev) => ({ ...prev, contestId: e.target.value }));
          }}
          className={styles.select}
        >
          <option value="">-- Choose a contest --</option>
          {contests.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add New Question Form */}
      <div className={styles.addQuestionContainer}>
        <label className={styles.label}>Question Text:</label>
        <input
          type="text"
          className={styles.input}
          value={newQuestion.text}
          onChange={(e) => setNewQuestion((prev) => ({ ...prev, text: e.target.value }))}
        />
        <label className={styles.label}>Round:</label>
        <input
          type="number"
          min="1"
          className={styles.input}
          value={newQuestion.round}
          onChange={(e) => setNewQuestion((prev) => ({ ...prev, round: parseInt(e.target.value, 10) }))}
        />

        <label className={styles.label}>Options:</label>
        {newQuestion.options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            className={styles.input}
            value={opt}
            onChange={(e) => handleOptionChange(e, idx, false)}
            placeholder={`Option ${idx + 1}`}
          />
        ))}

        <button onClick={handleAddQuestion} className={styles.addButton}>
          Add Question
        </button>
      </div>

      {/* Display the Existing Questions in a Table */}
      {questions.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Text</th>
              <th>Round</th>
              <th>Options</th>
              <th>Correct</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => {
              const isEditingRow = editingQuestionId === q.id;
              if (isEditingRow) {
                // Show editing row
                return (
                  <tr key={q.id}>
                    <td>
                      <input
                        type="text"
                        value={editedQuestion.text}
                        onChange={(e) =>
                          setEditedQuestion((prev) => ({ ...prev, text: e.target.value }))
                        }
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={editedQuestion.round}
                        onChange={(e) =>
                          setEditedQuestion((prev) => ({
                            ...prev,
                            round: parseInt(e.target.value, 10),
                          }))
                        }
                        className={styles.input}
                      />
                    </td>
                    <td>
                      {editedQuestion.options.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(e, idx, true)}
                          className={styles.input}
                        />
                      ))}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editedQuestion.correctAnswer}
                        onChange={(e) =>
                          setEditedQuestion((prev) => ({
                            ...prev,
                            correctAnswer: e.target.value,
                          }))
                        }
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <button className={styles.actionButton} onClick={handleSaveEditedQuestion}>
                        Save
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          setEditingQuestionId(null);
                          setEditedQuestion({
                            text: "",
                            options: ["", "", "", ""],
                            round: 1,
                            correctAnswer: "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              } else {
                // Show read-only row
                return (
                  <tr key={q.id}>
                    <td>{q.text}</td>
                    <td>{q.round}</td>
                    <td>{q.options?.join(", ")}</td>
                    <td>{q.correctAnswer || "Not Set"}</td>
                    <td>
                      <button className={styles.actionButton} onClick={() => handleEditQuestion(q)}>
                        Edit
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        Delete
                      </button>
                      {/* Quick set correct answer if you want a dropdown of the existing options */}
                      <select
                        onChange={(e) => handleSetCorrectAnswer(q.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Set Correct
                        </option>
                        {q.options?.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default QuestionManagement;
