import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, set } from "firebase/database";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import AnswersContainer from "../../components/AnswersContainer/AnswersContainer";
import styles from "./QuestionScreen.module.css";
import { useAuth } from "../../contexts/AuthContext"; // Assuming there's an AuthContext to get user info

function QuestionScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { contest } = location.state; // Get contest details from state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const roundNumber = contest ? contest.currentRound : 0; // Safeguard for roundNumber
  const { user } = useAuth(); // Get current user information

  useEffect(() => {
    if (!contest) return; // Early exit if contest data isn't available

    const db = getDatabase();
    const questionsRef = ref(db, `questions/${contest.id}`);

    // Fetch the questions for the contest
    onValue(questionsRef, (snapshot) => {
      const questionsData = snapshot.val();

      // Safeguard for questionsData
      if (!questionsData) {
        console.error("No questions found for contest:", contest.id);
        return;
      }

      // Find the current question based on the current round number
      const question = Object.values(questionsData).find(
        (question) => question.round === roundNumber
      );

      setCurrentQuestion(question || null); // Set null if no question found
    });
  }, [contest, roundNumber]);

  useEffect(() => {
    // Prevent the user from going back after submitting
    const preventBackNavigation = () => {
      window.history.pushState(null, document.title, window.location.href);
    };

    // Add an event listener to prevent the back button from working
    window.addEventListener('popstate', preventBackNavigation);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
    };
  }, []);

  const handleSubmit = async (selectedAnswer) => {
    if (!selectedAnswer) {
      alert("Please select an answer before submitting.");
      return;
    }

    const db = getDatabase();
    const userAnswerRef = ref(db, `answers/${contest.id}/${user.uid}`);

    // Check if the user has already submitted an answer for the current round
    onValue(userAnswerRef, (snapshot) => {
      if (snapshot.exists()) {
        alert("You have already submitted an answer for this round.");
        return;
      } else {
        // Proceed to submit the answer since it hasn't been submitted yet
        set(userAnswerRef, {
          round: roundNumber,
          answer: selectedAnswer,
          userId: user.uid, // Add user ID to the answer data
          timestamp: new Date().toISOString(),
        }).then(() => {
          navigate("/submitted"); // Navigate to the submitted screen
        }).catch((error) => {
          console.error("Error submitting answer:", error);
          alert("There was an error submitting your answer. Please try again.");
        });
      }
    }, { onlyOnce: true }); // Only check once to avoid race conditions
  };

  const questionText = currentQuestion
    ? currentQuestion.question
    : "No question available";
  const questionAnswers = currentQuestion ? currentQuestion.options : [];

  if (!contest) {
    return <div>Loading contest details...</div>;
  }

  return (
    <div className={styles.questionScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <MainText header={`Round ${roundNumber}`} subheader="Choose Wisely!" />
        <div className={styles.questionBlock}>
          <div className={styles.questionText}>{questionText}</div>
          <AnswersContainer 
            answers={questionAnswers} 
            onSubmit={handleSubmit} // Pass the handleSubmit function
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionScreen;
