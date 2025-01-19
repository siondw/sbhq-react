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

  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [statusChecked, setStatusChecked] = useState(false);
  const [error, setError] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Validate required state and redirect if missing
  useEffect(() => {
    if (!contest?.id || !questionId || selectedAnswer === undefined) {
      console.error("Missing required data in location.state. Redirecting to /...");
      navigate("/", {
        replace: true,
        state: { message: "Invalid submission data." },
      });
    }
  }, [contest, questionId, selectedAnswer, navigate]);

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
  const setupRealtimeListener = () => {
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
  };

  useEffect(() => {
    setupRealtimeListener();
  }, [questionId]);

  // Handle visibility changes to re-establish connection
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("Browser tab is active again. Checking for updates...");

        // Perform a manual poll to fetch the latest correct_option
        try {
          const { data, error } = await supabase
            .from("questions")
            .select("correct_option")
            .eq("id", questionId)
            .single();

          if (error) {
            console.error("Error during manual poll:", error);
            return;
          }

          if (data?.correct_option !== null) {
            setCorrectAnswer(data.correct_option);
            setStatusChecked(true);
          }

          // Re-establish the real-time listener
          console.log("Re-establishing real-time listener");
          setupRealtimeListener();
        } catch (err) {
          console.error("Error fetching correct answer during visibility check:", err.message);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
