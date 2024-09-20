import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';  
import MainText from '../../components/MainText/MainText';
import styles from './SubmittedScreen.module.css';  
import ballGif from '../../assets/ball.gif';  
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, onValue, off } from "firebase/database";

function SubmittedScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the full contest object from state
    const { contest, questionId, userId, userAnswer } = location.state || {};
    const contestId = contest?.id;

    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [statusChecked, setStatusChecked] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!contestId || !questionId || !userId) {
            // Invalid state, redirect to login page
            navigate('/login', { replace: true, state: { message: 'Invalid submission data.' } });
            return;
        }
    }, [contestId, questionId, userId, navigate]);

    useEffect(() => {
        if (!userAnswer) {
            // Invalid state, redirect to eliminated page
            navigate('/eliminated', { replace: true, state: { message: 'Invalid submission data.' } });
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
                // Pass the full contest object when navigating to CorrectScreen
                navigate('/correct', { replace: true, state: { contest, questionId } });
            } else {
                // Similarly, pass necessary state when navigating to EliminatedScreen
                navigate('/eliminated', { replace: true, state: { contest, questionId } });
            }
        }
    }, [statusChecked, userAnswer, correctAnswer, navigate, contest, questionId]);

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


            {/* Display error message if any */}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}

export default SubmittedScreen;
