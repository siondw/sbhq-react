// src/pages/SubmittedScreen/SubmittedScreen.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';  // Adjust the path as necessary
import MainText from '../../components/MainText/MainText';
import styles from './SubmittedScreen.module.css';  

import ballGif from '../../assets/ball.gif';  
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, onValue, off } from "firebase/database";
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'; // Assuming you have a LoadingSpinner component

function SubmittedScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { contestId, questionId, userId, userAnswer } = location.state || {};

    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [statusChecked, setStatusChecked] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!contestId || !questionId || !userId || !userAnswer) {
            // Invalid state, redirect to error page
            navigate('/error', { replace: true, state: { message: 'Invalid submission data.' } });
            return;
        }

        const db = getDatabase();
        const correctAnswerRef = ref(db, `questions/${contestId}/${questionId}/correctAnswer`);

        const handleCorrectAnswer = (snapshot) => {
            const correct = snapshot.val();
            if (correct !== null) { // If correctAnswer is set
                setCorrectAnswer(correct);
                setStatusChecked(true);
            }
        };

        onValue(correctAnswerRef, handleCorrectAnswer, (error) => {
            console.error('Error fetching correct answer:', error);
            setError("Error fetching correct answer.");
        });

        // Cleanup listener on unmount
        return () => {
            off(correctAnswerRef, 'value', handleCorrectAnswer);
        };
    }, [contestId, questionId, userId, userAnswer, navigate]);

    useEffect(() => {
        if (statusChecked) {
            if (userAnswer === correctAnswer) {
                navigate('/correct', { replace: true, state: { contestId, questionId } });
            } else {
                navigate('/eliminated', { replace: true, state: { contestId, questionId } });
            }
        }
    }, [statusChecked, userAnswer, correctAnswer, navigate, contestId, questionId]);

    return (
        <div className={styles.submittedScreen}>
            <div className={styles.headerContainer}>
                <Header />
            </div>
            <div className={styles.mainTextContainer}>
                <MainText 
                    header="Submitted!" 
                    subheader="Awaiting Results..."
                />
            </div>
            <div className={styles.gifContainer}>
                <img src={ballGif} alt="Awaiting results" className={styles.ballGif} style={{ width: 250, height: 250 }} /> 
            </div>

            {/* Display loading spinner and message while waiting */}
            {!statusChecked && !error && (
                <div className={styles.waitingContainer}>
                    <LoadingSpinner />
                    <p className={styles.message}>Your answer has been submitted. Please wait for the results...</p>
                </div>
            )}

            {/* Display error message if any */}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}

export default SubmittedScreen;
