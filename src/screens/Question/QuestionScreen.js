import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import AnswersContainer from "../../components/AnswersContainer/AnswersContainer";
import styles from "./QuestionScreen.module.css";
import { useAuth } from "../../contexts/AuthContext";
import useRequireState from "../../hooks/useRequireState";
import useCheckElimination from "../../hooks/useCheckElimination";
import { supabase } from "../../supabase";

function QuestionScreen() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { contest } = useRequireState(["contest"], "/login");

  useCheckElimination(contest?.id, user?.id);

  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [errorFetchingQuestions, setErrorFetchingQuestions] = useState(null);

  useEffect(() => {
    if (!contest) {
      console.error("Contest data is missing.");
      return;
    }

    // Fetch submissionsOpen and questions from Supabase
    const fetchContestData = async () => {
      try {
        // Fetch submissionsOpen
        const { data: contestData, error: contestError } = await supabase
          .from("contests")
          .select("submissions_open")
          .eq("id", contest.id)
          .single();

        if (contestError) throw contestError;

        setSubmissionsOpen(contestData.submissions_open);

        // Redirect if submissions are closed
        if (!contestData.submissions_open) {
          navigate("/submitted", { state: { contest } });
        }

        // Fetch questions for the current contest and round
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("id, text, options, round")
          .eq("contest_id", contest.id)
          .eq("round", contest.currentRound);

        if (questionsError) throw questionsError;

        if (!questionsData || questionsData.length === 0) {
          setQuestions([]);
          setErrorFetchingQuestions("No questions found for this round.");
        } else {
          setQuestions(questionsData);
        }
      } catch (err) {
        console.error("Error fetching contest data:", err.message);
        setErrorFetchingQuestions("There was an error fetching contest data.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchContestData();
  }, [contest, navigate]);

  useEffect(() => {
    // Prevent back navigation after submitting
    const preventBackNavigation = () => {
      window.history.pushState(null, document.title, window.location.href);
    };

    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  const handleSubmit = async (selectedAnswer, contestId, questionId, userId) => {
    if (!selectedAnswer) {
      alert("Please select an answer before submitting.");
      return;
    }

    if (!user) {
      alert("You must be logged in to submit an answer.");
      navigate("/login");
      return;
    }

    try {
      // Check for existing submission
      const { data: existingSubmission, error: submissionError } = await supabase
        .from("answers")
        .select("*")
        .eq("contest_id", contestId)
        .eq("question_id", questionId)
        .eq("user_id", userId)
        .single();

      if (submissionError && submissionError.code !== "PGRST116") throw submissionError;

      if (existingSubmission) {
        alert("You have already submitted an answer for this question.");
        return;
      }

      // Submit answer
      const { error } = await supabase.from("answers").insert({
        contest_id: contestId,
        question_id: questionId,
        user_id: userId,
        answer: selectedAnswer,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      // Navigate to submission confirmation screen
      navigate("/submitted", {
        state: {
          contest,
          questionId,
          userId,
          userAnswer: selectedAnswer,
        },
      });
    } catch (err) {
      console.error("Error submitting answer:", err.message);
      alert("There was an error submitting your answer. Please try again.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (authLoading) return <div>Loading user information...</div>;
  if (loadingQuestions) return <div>Loading questions...</div>;
  if (errorFetchingQuestions) return <div>Error: {errorFetchingQuestions}</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const questionText = currentQuestion ? currentQuestion.text : "No question available";
  const questionAnswers = currentQuestion ? currentQuestion.options : [];

  return (
    <div className={styles.questionScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <MainText header={`Round ${contest.currentRound}`} subheader="Choose Wisely!" />
        <div className={styles.questionBlock}>
          <div className={styles.questionText}>{questionText}</div>
          {currentQuestion && (
            <AnswersContainer
              answers={questionAnswers}
              onSubmit={(selectedAnswer) =>
                handleSubmit(selectedAnswer, contest.id, currentQuestion.id, user.id)
              }
            />
          )}
          {questions.length > 1 && (
            <div className={styles.navigationButtons}>
              <button
                className={styles.actionButton}
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className={styles.actionButton}
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionScreen;
