// src/pages/QuestionScreen/QuestionScreen.js
import React, { useState, useEffect } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, set, off, get } from "firebase/database";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import AnswersContainer from "../../components/AnswersContainer/AnswersContainer";
import styles from "./QuestionScreen.module.css";
import { useAuth } from "../../contexts/AuthContext"; // Assuming there's an AuthContext to get user info

function QuestionScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { contest } = location.state || {}; // Get contest details from state
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { user, loading: authLoading } = useAuth(); // Get current user information

    useEffect(() => {
        if (!contest) return; // Early exit if contest data isn't available

        const db = getDatabase();
        const questionsRef = ref(db, `questions/${contest.id}`);

        // Fetch the questions for the contest
        const handleQuestions = (snapshot) => {
            const questionsData = snapshot.val();

            // Safeguard for questionsData
            if (!questionsData) {
                console.error("No questions found for contest:", contest.id);
                setQuestions([]);
                return;
            }

            // Filter questions based on the current round
            const filteredQuestions = Object.entries(questionsData)
                .filter(([id, question]) => question.round === contest.currentRound)
                .map(([id, question]) => ({
                    id,
                    text: question.text,
                    options: question.options,
                }));

            setQuestions(filteredQuestions);
            setCurrentQuestionIndex(0); // Reset to first question when questions data changes
        };

        onValue(questionsRef, handleQuestions);

        // Cleanup listener on unmount
        return () => {
            off(questionsRef, "value", handleQuestions);
        };
    }, [contest]);

    useEffect(() => {
        // Prevent the user from going back after submitting
        const preventBackNavigation = () => {
            window.history.pushState(null, document.title, window.location.href);
        };

        // Add an event listener to prevent the back button from working
        window.addEventListener("popstate", preventBackNavigation);

        // Clean up the event listener on component unmount
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
            navigate("/login"); // Redirect to login if user is not authenticated
            return;
        }

        if (!contest || !questionId) {
            alert("Invalid contest or question.");
            return;
        }

        const db = getDatabase();
        const submissionRef = ref(
            db,
            `submissions/${contestId}/${questionId}/${userId}`
        );

        try {
            const snapshot = await get(submissionRef);
            if (snapshot.exists()) {
                alert("You have already submitted an answer for this question.");
                return;
            } else {
                await set(submissionRef, {
                    answer: selectedAnswer,
                    timestamp: new Date().toISOString(),
                });
                navigate("/submitted", { state: { contestId, questionId, userId, userAnswer: selectedAnswer } }); // Navigate to the submitted screen with state
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
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

    if (!contest) {
        return <div>Loading contest details...</div>;
    }

    if (authLoading) {
        return <div>Loading user information...</div>;
    }

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
                    <AnswersContainer
                        answers={questionAnswers}
                        onSubmit={(selectedAnswer) => handleSubmit(
                            selectedAnswer,
                            contest.id,
                            currentQuestion.id,
                            user.uid
                        )} // Pass all necessary parameters
                    />
                    {/* Navigation Buttons for Multiple Questions */}
                    {questions.length > 1 && (
                        <div className={styles.navigationButtons}>
                            <button
                                onClick={handlePrevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className={styles.navButton}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextQuestion}
                                disabled={currentQuestionIndex >= questions.length - 1}
                                className={styles.navButton}
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
