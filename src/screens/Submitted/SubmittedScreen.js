import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import styles from "./SubmittedScreen.module.css";
import ballGif from "../../assets/ball.gif";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";

function SubmittedScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("SubmittedScreen mounted with raw state:", location.state);

  const { contest, questionId, selectedAnswer, userId } = location.state || {};

  console.log("Destructured state values:", {
    contest,
    questionId,
    selectedAnswer,
    userId,
    hasState: !!location.state,
  });

  useEffect(() => {
    if (!location.state) {
      console.error("No state provided to SubmittedScreen");
      navigate("/");
      return;
    }

    if (!contest?.id || !questionId || !selectedAnswer) {
      console.error("Missing required state:", {
        contestId: contest?.id,
        questionId,
        selectedAnswer,
      });
      navigate("/");
      return;
    }
  }, [location.state, contest, questionId, selectedAnswer, navigate]);

  const contestId = contest?.id;

  console.log("SubmittedScreen state:", {
    contestId,
    questionId,
    selectedAnswer,
    locationState: location.state,
  });

  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [statusChecked, setStatusChecked] = useState(false);
  const [error, setError] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Validate required state and redirect if missing
  useEffect(() => {
    console.log("First useEffect running - validation check");
    if (!contestId || !questionId || selectedAnswer === undefined) {
      console.log(
        "Missing required data in location.state. Redirecting to /..."
      );
      navigate("/", {
        replace: true,
        state: { message: "Invalid submission data." },
      });
    }
  }, [contestId, questionId, selectedAnswer, navigate]);

  // Initial fetch for the correct answer
  useEffect(() => {
    if (!questionId) return;

    const fetchCorrectAnswer = async () => {
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("correct_option")
          .eq("id", questionId)
          .single();

        if (error) throw error;

        if (data?.correct_option !== null) {
          setCorrectAnswer(data.correct_option);
          setStatusChecked(true);
        }
      } catch (err) {
        console.error("Error fetching correct answer:", err.message);
        setError("Error fetching correct answer.");
      }
    };

    fetchCorrectAnswer();
  }, [questionId]);

  // Real-time listener for the correct_option field
  useEffect(() => {
    if (!questionId) return;

    const channel = supabase
      .channel(`question-${questionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "questions",
          filter: `id=eq.${questionId}`,
        },
        (payload) => {
          const updatedCorrectOption = payload.new.correct_option;
          console.log(
            "Real-time update received. New correct_option:",
            updatedCorrectOption
          );

          if (updatedCorrectOption !== null) {
            setCorrectAnswer(updatedCorrectOption);
            setStatusChecked(true);
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from real-time updates");
      supabase.removeChannel(channel);
    };
  }, [questionId]);

  // Evaluate the user's answer when the correct answer is set
  useEffect(() => {
    if (statusChecked && !hasNavigated) {
      console.log("Evaluating answer...");
      console.log(
        "User answer:",
        selectedAnswer,
        "Correct answer:",
        correctAnswer
      );

      if (selectedAnswer === correctAnswer) {
        console.log("Answer is correct. Navigating to /correct...");
        setHasNavigated(true);
        navigate("/correct", { replace: true, state: { contest, questionId } });
      } else {
        console.log("Answer is incorrect. Navigating to /eliminated...");
        setHasNavigated(true);
        navigate("/eliminated", {
          replace: true,
          state: { contest, questionId },
        });
      }
    }
  }, [
    statusChecked,
    selectedAnswer,
    correctAnswer,
    navigate,
    contest,
    questionId,
    hasNavigated,
  ]);

  return (
    <div className={styles.submittedScreen}>
      <div className={styles.headerContainer}>
        <Header />
      </div>
      <div className={styles.mainTextContainer}>
        <MainText header="Submitted!" subheader="Awaiting Results..." />
      </div>
      <div className={styles.gifContainer}>
        <img
          src={ballGif}
          alt="Awaiting results"
          className={styles.ballGif}
          style={{ width: 250, height: 250 }}
        />
      </div>

      {/* Display error message if any */}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default SubmittedScreen;
