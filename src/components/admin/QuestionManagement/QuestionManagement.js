import React, { useState, useEffect } from "react";
import { getDatabase, ref, set, onValue, push } from "firebase/database";
import styles from "./QuestionManagement.module.css";

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [contests, setContests] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    contestId: "",
  });
  const [selectedContestId, setSelectedContestId] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    const db = getDatabase();

    // Fetch contests from Firebase
    const contestsRef = ref(db, "contests");
    onValue(contestsRef, (snapshot) => {
      const contestsData = snapshot.val() || {};
      const contestsArray = Object.entries(contestsData).map(([id, data]) => ({
        id,
        ...data,
      }));
      setContests(contestsArray);
    });

    // Fetch questions based on selected contest (if any)
    if (selectedContestId) {
      const questionsRef = ref(db, `questions/${selectedContestId}`);
      onValue(questionsRef, (snapshot) => {
        const questionsData = snapshot.val() || {};
        const questionsArray = Object.entries(questionsData).map(
          ([id, data]) => ({
            id,
            ...data,
          })
        );
        setQuestions(questionsArray);
      });
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
      // Ensure at least 2 options are filled
      alert("Please fill at least 2 options.");
      return;
    }

    try {
      const db = getDatabase();
      const questionsRef = ref(db, `questions/${newQuestion.contestId}`);

      // Directly set the question data with push() 
      const newQuestionRef = push(questionsRef, {
        text: newQuestion.text,
        options: filledOptions,
        correctOption: null,
        round: 1,
      });

      // Get the generated key (if needed)
      const newQuestionKey = newQuestionRef.key;

      // Clear the form and reset selected contest if desired
      setNewQuestion({
        text: "",
        options: ["", "", "", ""],
        contestId: newQuestion.contestId,
      });
      // Optionally, keep the selected contest to add more questions
      // setSelectedContestId(newQuestion.contestId);
    } catch (error) {
      console.error("Error adding question:", error);
      alert("There was an error adding the question. Please try again.");
    }
  };

  const handleEditQuestion = (id) => {
    setEditingQuestionId(id);
  };

  const handleSetCorrectAnswer = async (id, answer) => {
    if (!answer) {
      alert("Please select a correct answer.");
      return;
    }

    try {
      const db = getDatabase();
      const correctAnswerRef = ref(
        db,
        `questions/${selectedContestId}/${id}/correctOption`
      );
      await set(correctAnswerRef, answer);

      // Update local state
      const updatedQuestions = questions.map((question) =>
        question.id === id ? { ...question, correctOption: answer } : question
      );
      setQuestions(updatedQuestions);
      setEditingQuestionId(null); // Close the editing mode
    } catch (error) {
      console.error("Error setting correct answer:", error);
      alert("There was an error setting the correct answer. Please try again.");
    }
  };

  const handleInputChange = (e, index) => {
    const options = [...newQuestion.options];
    options[index] = e.target.value;
    setNewQuestion({ ...newQuestion, options });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Question Management</h2>

      {/* Table to display current questions */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Question</th>
            <th>Options</th>
            <th>Correct Answer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question.id}>
              <td>{question.text}</td>
              <td>{question.options.join(", ")}</td>
              <td>
                {question.correctOption ? question.correctOption : "Not set"}
              </td>
              <td>
                {editingQuestionId === question.id ? (
                  <div className={styles.editContainer}>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className={styles.input}
                    >
                      <option value="">Select Correct Answer</option>
                      {question.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.actionButton}
                      onClick={() =>
                        handleSetCorrectAnswer(question.id, correctAnswer)
                      }
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEditQuestion(question.id)}
                  >
                    Set Correct Answer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form to add new question */}
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
        <input
          type="text"
          className={styles.input}
          placeholder="Question Text"
          value={newQuestion.text}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, text: e.target.value })
          }
        />

        {/* Options Inputs */}
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

        <button className={styles.addButton} onClick={handleAddQuestion}>
          Add Question
        </button>
      </div>
    </div>
  );
};

export default QuestionManagement;
