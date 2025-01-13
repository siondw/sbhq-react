import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import AnswersContainer from "../../components/AnswersContainer/AnswersContainer";
import styles from "./QuestionScreen.module.css";
import { useAuth } from "../../contexts/AuthContext";
import useRequireState from "../../hooks/useRequireState";
import { supabase } from "../../supabase";

function QuestionScreen() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { contest } = useRequireState(["contest"], "/login");

  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [errorFetchingQuestions, setErrorFetchingQuestions] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);

  useEffect(() => {
    if (!contest) {
      console.error("Contest data is missing.");
      return;
    }

    const fetchContestData = async () => {
      console.log("Fetching contest data...");
      try {
        const { data: contestData, error: contestError } = await supabase
          .from("contests")
          .select("submission_open, current_round")
          .eq("id", contest.id)
          .single();

        console.log("Contest data fetched:", contestData);

        if (contestError) throw contestError;

        setSubmissionsOpen(contestData.submission_open);
        setCurrentRound(contestData.current_round);

        if (!contestData.submission_open) {
          console.log("Submissions are closed, handling blank submission...");
          await handleBlankSubmission();
          navigate("/eliminated", { state: { contest } });
          return;
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("id, question, options")
          .eq("contest_id", contest.id)
          .eq("round", contestData.current_round);

        console.log("Questions data fetched:", questionsData);

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

    const channel = supabase
      .channel(`contest-${contest.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "contests",
          filter: `id=eq.${contest.id}`,
        },
        async (payload) => {
          console.log("Real-time update received:", payload);

          if (payload.new.submission_open === false) {
            console.log("Submissions closed via real-time update.");
            await handleBlankSubmission();
            navigate("/eliminated", { state: { contest } });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contest, navigate]);

  const handleSubmit = async (selectedAnswer, questionId) => {
    console.log("Submit initiated with answer:", selectedAnswer);
    if (!selectedAnswer) {
      alert("Please select an answer before submitting.");
      return;
    }

    try {
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .eq("contest_id", contest.id)
        .single();

      console.log("Participant fetched:", participant);

      if (participantError || !participant) {
        throw new Error("Could not find participant information.");
      }

      const participantId = participant.id;

      const { error: answerError } = await supabase.from("answers").insert({
        contest_id: contest.id,
        participant_id: participantId,
        round: currentRound,
        answer: selectedAnswer,
        timestamp: new Date().toISOString(),
      });

      if (answerError) {
        throw new Error("Failed to submit the answer.");
      }

      console.log("Answer submitted successfully.");
      console.log("Navigating to /submitted with state:", { contest, questionId, selectedAnswer });
      navigate("/submitted", {
        state: {
          contest,
          questionId: currentQuestion.id,
          userAnswer: selectedAnswer,
          userId: user.id, // Pass userId explicitly
        },
      });      
    } catch (err) {
      console.error("Error during submission:", err.message);
      alert("There was an error submitting your answer. Please try again.");
    }
  };

  const handleBlankSubmission = async () => {
    console.log("Submitting blank answer...");
    try {
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .eq("contest_id", contest.id)
        .single();

      if (participantError || !participant) {
        console.error("Participant not found for blank submission.");
        return;
      }

      const participantId = participant.id;

      const { error } = await supabase.from("answers").insert({
        contest_id: contest.id,
        participant_id: participantId,
        round: currentRound,
        answer: null,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        throw new Error("Failed to submit blank answer.");
      }

      console.log("Blank answer submitted successfully.");
    } catch (err) {
      console.error("Error submitting blank answer:", err.message);
    }
  };

  if (authLoading) return <div>Loading user information...</div>;
  if (loadingQuestions) return <div>Loading questions...</div>;
  if (errorFetchingQuestions) return <div>Error: {errorFetchingQuestions}</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const questionText = currentQuestion
    ? currentQuestion.question
    : "No question available";
  const questionAnswers = currentQuestion ? currentQuestion.options : [];

  return (
    <div className={styles.questionScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <MainText
          header={`Round ${currentRound || "..."}`}
          subheader="Choose Wisely!"
        />
        <div className={styles.questionBlock}>
          <div className={styles.questionText}>{questionText}</div>
          {currentQuestion && (
            <AnswersContainer
              answers={questionAnswers}
              onSubmit={(selectedAnswer) =>
                handleSubmit(selectedAnswer, currentQuestion.id)
              }
            />
          )}
          {questions.length > 1 && (
            <div className={styles.navigationButtons}>
              <button
                className={styles.actionButton}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className={styles.actionButton}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
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
