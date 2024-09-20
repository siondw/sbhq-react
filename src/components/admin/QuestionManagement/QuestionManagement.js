// src/pages/QuestionManagement/QuestionManagement.js

import React, { useState, useEffect } from "react";
import { getDatabase, ref, set, onValue, push, update, get, off } from "firebase/database";
import styles from "./QuestionManagement.module.css";
import { useAuth } from "../../../contexts/AuthContext"; // Import AuthContext

const QuestionManagement = () => {
  const { user } = useAuth(); // Get current user
  const [questions, setQuestions] = useState([]);
  const [contests, setContests] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    round: 1,
    contestId: "",
  });
  const [selectedContestId, setSelectedContestId] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    round: 1,
    correctAnswer: "",
  });

  useEffect(() => {
    const db = getDatabase();

    // Fetch contests from Firebase
    const contestsRef = ref(db, "contests");
    const handleContests = (snapshot) => {
      const contestsData = snapshot.val() || {};
      const contestsArray = Object.entries(contestsData).map(([id, data]) => ({
        id,
        ...data,
      }));
      setContests(contestsArray);
    };
    onValue(contestsRef, handleContests);

    // Cleanup listener on unmount
    return () => {
      off(contestsRef, "value", handleContests);
    };
  }, []);

  useEffect(() => {
    const db = getDatabase();

    // Fetch questions based on selected contest (if any)
    if (selectedContestId) {
      const questionsRef = ref(db, `questions/${selectedContestId}`);
      const handleQuestions = (snapshot) => {
        const questionsData = snapshot.val() || {};
        const questionsArray = Object.entries(questionsData).map(([id, data]) => ({
          id,
          ...data,
        }));
        setQuestions(questionsArray);
      };
      onValue(questionsRef, handleQuestions);

      // Cleanup listener on unmount or when contest changes
      return () => {
        off(questionsRef, "value", handleQuestions);
      };
    } else {
      setQuestions([]); // Clear questions if no contest is selected
    }
  }, [selectedContestId]);

  const handleContestChange = (e) => {
    const contestId = e.target.value;
    setSelectedContestId(contestId);
    setNewQuestion({ ...newQuestion, contestId });
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.contestId) {
      alert("Please select a contest before adding a question.");
      return;
    }

    if (!newQuestion.text.trim()) {
      alert("Question text cannot be empty.");
      return;
    }

    // Ensure all options are filled
    const filledOptions = newQuestion.options.filter(
      (option) => option.trim() !== ""
    );

    if (filledOptions.length < 2) {
      alert("Please fill at least 2 options.");
      return;
    }

    if (newQuestion.round < 1) {
      alert("Round number must be at least 1.");
      return;
    }

    try {
      const db = getDatabase();
      const questionsRef = ref(db, `questions/${newQuestion.contestId}`);

      // Add the new question
      const newQuestionRef = push(questionsRef, {
        text: newQuestion.text,
        options: filledOptions,
        correctAnswer: null, // Initially, correct answer is not set
        round: newQuestion.round, // Set the round number
      });

      // Clear the form after adding
      setNewQuestion({
        text: "",
        options: ["", "", "", ""],
        round: 1,
        contestId: newQuestion.contestId,
      });
    } catch (error) {
      console.error("Error adding question:", error);
      alert("There was an error adding the question. Please try again.");
    }
  };

  const handleEditTableQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({
      text: question.text,
      options: [...question.options],
      round: question.round,
      correctAnswer: question.correctAnswer || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditedQuestion({
      text: "",
      options: ["", "", "", ""],
      round: 1,
      correctAnswer: "",
    });
  };

  const handleSaveEditedTableQuestion = async (questionId) => {
    if (!selectedContestId || !questionId) {
      alert("Missing contest or question information.");
      return;
    }

    if (!editedQuestion.text.trim()) {
      alert("Question text cannot be empty.");
      return;
    }

    // Ensure all options are filled
    const filledOptions = editedQuestion.options.filter(
      (option) => option.trim() !== ""
    );

    if (filledOptions.length < 2) {
      alert("Please fill at least 2 options.");
      return;
    }

    if (editedQuestion.round < 1) {
      alert("Round number must be at least 1.");
      return;
    }

    try {
      const db = getDatabase();
      const questionRef = ref(db, `questions/${selectedContestId}/${questionId}`);

      await set(questionRef, {
        text: editedQuestion.text,
        options: filledOptions,
        correctAnswer: editedQuestion.correctAnswer || null, // Keep correctAnswer as null if not set
        round: editedQuestion.round, // Save the updated round
      });

      // Update local state
      const updatedQuestions = questions.map((question) =>
        question.id === questionId
          ? {
              id: question.id,
              text: editedQuestion.text,
              options: filledOptions,
              correctAnswer: editedQuestion.correctAnswer || null,
              round: editedQuestion.round,
            }
          : question
      );
      setQuestions(updatedQuestions);

      // Exit editing mode
      setEditingQuestionId(null);
      setEditedQuestion({
        text: "",
        options: ["", "", "", ""],
        round: 1,
        correctAnswer: "",
      });
    } catch (error) {
      console.error("Error saving edited question:", error);
      alert("There was an error saving the question. Please try again.");
    }
  };

  const handleSetCorrectAnswer = async (questionId, answer) => {
    if (!answer) {
      alert("Please select a correct answer.");
      return;
    }

    try {
      const db = getDatabase();
      const correctAnswerRef = ref(
        db,
        `questions/${selectedContestId}/${questionId}/correctAnswer`
      );

      // Set the correct answer in the database
      await set(correctAnswerRef, answer);

      // Fetch all submissions for this question
      const submissionsSnapshot = await get(ref(db, `submissions/${selectedContestId}/${questionId}`));
      const submissionsData = submissionsSnapshot.val();

      // Fetch all participants
      const participantsSnapshot = await get(ref(db, `contests/${selectedContestId}/participants`));
      const participantsData = participantsSnapshot.val();

      // Identify users who submitted incorrect answers
      const updates = {};

      if (submissionsData && participantsData) {
        Object.entries(submissionsData).forEach(([userId, submission]) => {
          if (submission.answer !== answer) {
            // Only eliminate if the user is still active
            if (participantsData[userId] && participantsData[userId].active) {
              updates[`contests/${selectedContestId}/participants/${userId}/active`] = false;
              console.log(`Eliminating user: ${userId} for incorrect answer.`);
            }
          }
        });
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        alert("Correct answer set. Users with incorrect answers have been eliminated.");
      } else {
        alert("Correct answer set. No users to eliminate.");
      }

      // Update local state
      const updatedQuestions = questions.map((question) =>
        question.id === questionId
          ? { ...question, correctAnswer: answer }
          : question
      );
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error("Error setting correct answer and eliminating users:", error);
      alert("There was an error setting the correct answer. Please try again.");
    }
  };

  const handleInputChange = (e, index, isEditing = false) => {
    const options = isEditing
      ? [...editedQuestion.options]
      : [...newQuestion.options];
    options[index] = e.target.value;

    if (isEditing) {
      setEditedQuestion({ ...editedQuestion, options });
    } else {
      setNewQuestion({ ...newQuestion, options });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Question Management</h2>

      {/* Table to display current questions */}
      {selectedContestId && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Question</th>
              <th>Options</th>
              <th>Round</th>
              <th>Correct Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>
                  {editingQuestionId === question.id ? (
                    <input
                      type="text"
                      className={styles.input}
                      value={editedQuestion.text}
                      onChange={(e) =>
                        setEditedQuestion({ ...editedQuestion, text: e.target.value })
                      }
                    />
                  ) : (
                    question.text
                  )}
                </td>
                <td>
                  {editingQuestionId === question.id ? (
                    <div className={styles.options}>
                      {editedQuestion.options.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          className={styles.input}
                          value={option}
                          onChange={(e) =>
                            handleInputChange(e, index, true)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    question.options.join(", ")
                  )}
                </td>
                <td>
                  {editingQuestionId === question.id ? (
                    <input
                      type="number"
                      className={styles.input}
                      value={editedQuestion.round}
                      min="1"
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          round: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  ) : (
                    question.round
                  )}
                </td>
                <td>
                  {editingQuestionId === question.id ? (
                    <select
                      className={styles.select}
                      value={editedQuestion.correctAnswer || ""}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Select Correct Answer --</option>
                      {question.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : question.correctAnswer ? (
                    question.correctAnswer
                  ) : (
                    "Not set"
                  )}
                </td>
                <td>
                  {editingQuestionId === question.id ? (
                    <>
                      <button
                        className={styles.actionButton}
                        onClick={() =>
                          handleSaveEditedTableQuestion(question.id)
                        }
                      >
                        Save
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleEditTableQuestion(question)}
                      >
                        Edit
                      </button>
                      {/* Button to set correct answer and eliminate incorrect submitters */}
                      {question.correctAnswer === null && (
                        <button
                          className={styles.actionButton}
                          onClick={() => {
                            const answer = prompt("Enter the correct answer:");
                            if (answer) {
                              handleSetCorrectAnswer(question.id, answer);
                            }
                          }}
                        >
                          Set Correct Answer
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Form to add a new question */}
      <div className={styles.newQuestionContainer}>
        <h3>Add New Question</h3>

        {/* Contest Selection Dropdown */}
        <div className={styles.formGroup}>
          <label htmlFor="contestSelect" className={styles.label}>
            Select Contest:
          </label>
          <select
            id="contestSelect"
            value={newQuestion.contestId}
            onChange={handleContestChange}
            className={styles.select}
          >
            <option value="">-- Select Contest --</option>
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))}
          </select>
        </div>

        {/* Question Text Input */}
        <div className={styles.formGroup}>
          <label htmlFor="questionText" className={styles.label}>
            Question Text:
          </label>
          <input
            type="text"
            id="questionText"
            className={styles.input}
            placeholder="Question Text"
            value={newQuestion.text}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, text: e.target.value })
            }
          />
        </div>

        {/* Options Inputs */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Options:</label>
          <div className={styles.options}>
            {newQuestion.options.map((option, index) => (
              <input
                key={index}
                type="text"
                className={styles.input}
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleInputChange(e, index)}
              />
            ))}
          </div>
        </div>

        {/* Round Input */}
        <div className={styles.formGroup}>
          <label htmlFor="roundInput" className={styles.label}>
            Round Number:
          </label>
          <input
            type="number"
            id="roundInput"
            className={styles.input}
            value={newQuestion.round}
            min="1"
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, round: parseInt(e.target.value, 10) })
            }
          />
        </div>

        <button className={styles.addButton} onClick={handleAddQuestion}>
          Add Question
        </button>
      </div>
    </div>
  );
};

export default QuestionManagement;
