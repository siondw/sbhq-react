import React, { useCallback, useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import styles from './SubmittedScreen.module.css';
import ballGif from '../../assets/ball.gif';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import type { ContestRow } from '../../types/sbhq';

type SubmittedState = {
  contest?: ContestRow;
  questionId?: string;
  selectedAnswer?: string;
  userId?: string;
};

function SubmittedScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const { contest, questionId, selectedAnswer } = (location.state as SubmittedState) || {};

  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [statusChecked, setStatusChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Validate required state and redirect if missing
  useEffect(() => {
    if (!contest?.id || !questionId || selectedAnswer === undefined) {
      console.error('Missing required data in location.state. Redirecting to /...');
      navigate('/', {
        replace: true,
        state: { message: 'Invalid submission data.' },
      });
    }
  }, [contest, questionId, selectedAnswer, navigate]);

  // Initial fetch for the correct answer
  useEffect(() => {
    if (!questionId) return;

    const fetchCorrectAnswer = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('correct_option')
          .eq('id', questionId)
          .single();

        if (error) throw error;

        if (data?.correct_option !== null) {
          setCorrectAnswer(data.correct_option);
          setStatusChecked(true);
        }
      } catch (err) {
        console.error('Error fetching correct answer:', (err as Error).message);
        setError('Error fetching correct answer.');
      }
    };

    fetchCorrectAnswer();
  }, [questionId]);

  // Real-time listener for the correct_option field
  const setupRealtimeListener = useCallback(() => {
    if (!questionId) return () => {};

    const channel = supabase
      .channel(`question-${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `id=eq.${questionId}`,
        },
        (payload) => {
          const updatedCorrectOption = payload.new.correct_option;

          if (updatedCorrectOption !== null) {
            setCorrectAnswer(updatedCorrectOption);
            setStatusChecked(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId]);

  useEffect(() => {
    const cleanup = setupRealtimeListener();
    return () => {
      cleanup && cleanup();
    };
  }, [setupRealtimeListener]);

  // Handle visibility changes to re-establish connection
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Perform a manual poll to fetch the latest correct_option
        try {
          const { data, error } = await supabase
            .from('questions')
            .select('correct_option')
            .eq('id', questionId)
            .single();

          if (error) {
            console.error('Error during manual poll:', error);
            return;
          }

          if (data?.correct_option !== null) {
            setCorrectAnswer(data.correct_option);
            setStatusChecked(true);
          }

          setupRealtimeListener();
        } catch (err) {
          console.error('Error fetching correct answer during visibility check:', (err as Error).message);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [questionId, setupRealtimeListener]);

  // Evaluate the user's answer when the correct answer is set
  useEffect(() => {
    if (statusChecked && !hasNavigated) {
      if (selectedAnswer === correctAnswer) {
        setHasNavigated(true);
        navigate('/correct', { replace: true, state: { contest, questionId } });
      } else {
        setHasNavigated(true);
        navigate('/eliminated', {
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
