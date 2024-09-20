// src/pages/QuestionScreen/QuestionScreen.js

import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, set, off, get } from "firebase/database";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import AnswersContainer from "../../components/AnswersContainer/AnswersContainer";
import styles from "./QuestionScreen.module.css";
import { useAuth } from "../../contexts/AuthContext"; // Assuming there's an AuthContext to get user info
import useRequireState from "../../hooks/useRequireState";
import useCheckElimination from "../../hooks/useCheckElimination"; // Import the custom hook

function QuestionScreen() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // Get current user information

    // Use the custom hook to require 'contest' in location.state
    const { contest } = useRequireState(["contest"], "/login"); // Redirect to '/login' if 'contest' is missing

    // Use the custom hook to monitor elimination
    useCheckElimination(contest?.id, user?.uid);

    const [submissionsOpen, setSubmissionsOpen] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loadingQuestions, setLoadingQuestions] = useState(true); // To manage loading state
    const [errorFetchingQuestions, setErrorFetchingQuestions] = useState(null); // To handle errors

    useEffect(() => {
        if (!contest) {
            console.error("Contest data is missing.");
            return; // Early exit if contest data isn't available
        }

        // Debug: Log contest details
        console.log("Contest Details:", contest);

        // Convert currentRound to a number if it's a string
        const currentRound = typeof contest.currentRound === 'string' ? parseInt(contest.currentRound, 10) : contest.currentRound;

        if (isNaN(currentRound)) {
            console.error("currentRound is not a valid number:", contest.currentRound);
            setErrorFetchingQuestions("Current round information is invalid.");
            setLoadingQuestions(false);
            return;
        }

        // Firebase references
        const db = getDatabase();
        const submissionsOpenRef = ref(db, `contests/${contest.id}/submissionsOpen`);
        const questionsRef = ref(db, `questions/${contest.id}`);

        // Listener for submissionsOpen
        const handleSubmissionsOpen = (snapshot) => {
            const val = snapshot.val();
            setSubmissionsOpen(val !== null ? val : true);
            console.log("Submissions Open:", val);
            if (!val) {
                // Redirect to submission screen if submissions are closed
                navigate("/submitted", { state: { contest } });
            }
        };

        onValue(submissionsOpenRef, handleSubmissionsOpen, (error) => {
            console.error("Error fetching submissionsOpen:", error);
        });

        // Fetch questions
        const fetchQuestions = async () => {
            try {
                const snapshot = await get(questionsRef);
                const questionsData = snapshot.val();

                console.log("Fetched questions data from Firebase:", questionsData);

                if (!questionsData) {
                    console.error("No questions found for contest:", contest.id);
                    setQuestions([]);
                    setLoadingQuestions(false);
                    return;
                }

                // Filter questions based on the current round
                const filteredQuestions = Object.entries(questionsData)
                    .filter(([id, question]) => {
                        const isCurrentRound = question.round === currentRound;
                        if (!isCurrentRound) {
                            console.log(`Question ID ${id} is not in the current round (${currentRound}).`);
                        }
                        return isCurrentRound;
                    })
                    .map(([id, question]) => ({
                        id,
                        text: question.text,
                        options: question.options,
                    }));

                console.log(`Filtered questions for round ${currentRound}:`, filteredQuestions);

                setQuestions(filteredQuestions);
                setCurrentQuestionIndex(0); // Reset to first question when questions data changes
                setLoadingQuestions(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
                setErrorFetchingQuestions("There was an error fetching the questions.");
                setLoadingQuestions(false);
            }
        };

        fetchQuestions();

        // Cleanup listener on unmount
        return () => {
            off(submissionsOpenRef, "value", handleSubmissionsOpen);
        };
    }, [contest, navigate]);

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
        const submissionRef = ref(db, `submissions/${contestId}/${questionId}/${userId}`);

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

                console.log(`User ${userId} submitted answer "${selectedAnswer}" for question ${questionId} in contest ${contestId}.`);

                // Pass the entire contest object when navigating to SubmittedScreen
                navigate("/submitted", { 
                    state: { 
                        contest, // Pass the full contest object
                        questionId, 
                        userId, 
                        userAnswer: selectedAnswer 
                    }
                });
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

    // Debug: Log current state before rendering
    useEffect(() => {
        console.log("Current Question Index:", currentQuestionIndex);
        console.log("Total Questions:", questions.length);
        console.log("Current Question:", questions[currentQuestionIndex]);
    }, [currentQuestionIndex, questions]);

    if (authLoading) {
        console.log("Auth is loading...");
        return <div>Loading user information...</div>;
    }

    if (loadingQuestions) {
        console.log("Loading questions...");
        return <div>Loading questions...</div>;
    }

    if (errorFetchingQuestions) {
        console.error("Error fetching questions:", errorFetchingQuestions);
        return <div>Error: {errorFetchingQuestions}</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const questionText = currentQuestion ? currentQuestion.text : "No question available";
    const questionAnswers = currentQuestion ? currentQuestion.options : [];

    // Debug: Log rendering information
    console.log("Rendering QuestionScreen with question:", questionText);

    return (
        <div className={styles.questionScreen}>
            <div className={styles.header}>
                <Header />
            </div>
            <div className={styles.screenContent}>
                <MainText header={`Round ${contest.currentRound}`} subheader="Choose Wisely!" />
                <div className={styles.questionBlock}>
                    <div className={styles.questionText}>{questionText}</div>
                    {currentQuestion ? (
                        <AnswersContainer
                            answers={questionAnswers}
                            onSubmit={(selectedAnswer) => handleSubmit(
                                selectedAnswer,
                                contest.id,
                                currentQuestion.id,
                                user.uid
                            )} // Pass all necessary parameters
                        />
                    ) : null}
                    {/* Navigation Buttons for Multiple Questions */}
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
