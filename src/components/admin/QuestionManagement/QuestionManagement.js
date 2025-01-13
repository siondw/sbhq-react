import React, { useState, useEffect } from "react";
import styles from "./QuestionManagement.module.css";
import { useAuth } from "../../../contexts/AuthContext"; // Import AuthContext
import { supabase } from "../../../supabase"; // Import your Supabase client

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

  // Fetch contests from Supabase
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data, error } = await supabase.from("contests").select("id, name");

        if (error) throw error;

        setContests(data || []);
      } catch (err) {
        console.error("Error fetching contests:", err.message);
      }
    };

    fetchContests();
  }, []);

  // Fetch questions for the selected contest
  useEffect(() => {
    if (!selectedContestId) {
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("id, text, options, round, correctAnswer")
          .eq("contest_id", selectedContestId);

        if (error) throw error;

        setQuestions(data || []);
      } catch (err) {
        console.error("Error fetching questions:", err.message);
      }
    };

    fetchQuestions();
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

    const filledOptions = newQuestion.options.filter((option) => option.trim() !== "");

    if (filledOptions.length < 2) {
      alert("Please fill at least 2 options.");
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

      // Clear the form after adding
      setNewQuestion({
        text: "",
        options: ["", "", "", ""],
        round: 1,
        contestId: newQuestion.contestId,
      });

      // Refresh questions
      setSelectedContestId(newQuestion.contestId);
    } catch (err) {
      console.error("Error adding question:", err.message);
      alert("There was an error adding the question. Please try again.");
    }
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

    const filledOptions = editedQuestion.options.filter((option) => option.trim() !== "");

    if (filledOptions.length < 2) {
      alert("Please fill at least 2 options.");
      return;
    }

    try {
      const { error } = await supabase.from("questions").update({
        text: editedQuestion.text,
        options: filledOptions,
        round: editedQuestion.round,
        correctAnswer: editedQuestion.correctAnswer || null,
      }).eq("id", questionId);

      if (error) throw error;

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
    } catch (err) {
      console.error("Error saving edited question:", err.message);
      alert("There was an error saving the question. Please try again.");
    }
  };

  const handleSetCorrectAnswer = async (questionId, answer) => {
    if (!answer) {
      alert("Please select a correct answer.");
      return;
    }

    try {
      const { error } = await supabase
        .from("questions")
        .update({ correctAnswer: answer })
        .eq("id", questionId);

      if (error) throw error;

      // Update local state
      const updatedQuestions = questions.map((question) =>
        question.id === questionId
          ? { ...question, correctAnswer: answer }
          : question
      );
      setQuestions(updatedQuestions);

      alert("Correct answer set.");
    } catch (err) {
      console.error("Error setting correct answer:", err.message);
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

      {/* Remaining UI code for rendering and editing questions */}
    </div>
  );
};

export default QuestionManagement;
