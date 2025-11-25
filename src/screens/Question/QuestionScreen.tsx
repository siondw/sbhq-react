import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import AnswersContainer from '../../components/AnswersContainer/AnswersContainer';
import styles from './QuestionScreen.module.css';
import { useAuth } from '../../contexts/AuthContext';
import useRequireState from '../../hooks/useRequireState';
import { supabase } from '../../supabase';
import type { ContestRow } from '../../types/sbhq';

type Question = {
  id: string;
  question: string;
  options: string[];
  round: number;
};

function QuestionScreen() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { contest } = useRequireState(['contest'], '/login') as { contest: ContestRow };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [errorFetchingQuestions, setErrorFetchingQuestions] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number | null>(null);

  // We'll store a local error message if an inactive user tries to submit
  const [inactiveError, setInactiveError] = useState("");

  // If submissions are closed, we do a blank submission and eliminate
  const handleBlankSubmission = useCallback(async () => {
    if (!user) return;
    try {
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id, active')
        .eq('user_id', user.id)
        .eq('contest_id', contest.id)
        .single();

      if (participantError || !participant) {
        console.error('Participant not found for blank submission.');
        return;
      }

      await supabase.from('answers').insert({
        contest_id: contest.id,
        participant_id: participant.id,
        round: currentRound,
        question_id: null,
        answer: null,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error submitting blank answer:', (err as Error).message);
    }
  }, [contest, currentRound, user]);

  // On mount, fetch the current contest data & questions
  useEffect(() => {
    if (!contest) {
      return;
    }

    const fetchContestData = async () => {
      try {
        const { data: contestData, error: contestError } = await supabase
          .from('contests')
          .select('submission_open, current_round')
          .eq('id', contest.id)
          .single();

        if (contestError) throw contestError;

        setCurrentRound(contestData.current_round);

        if (!contestData.submission_open) {
          await handleBlankSubmission();
          navigate('/eliminated', { state: { contest } });
          return;
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('id, question, options, round')
          .eq('contest_id', contest.id)
          .eq('round', contestData.current_round);

        if (questionsError) throw questionsError;

        if (!questionsData || questionsData.length === 0) {
          setQuestions([]);
          setErrorFetchingQuestions("No questions found for this round.");
        } else {
          setQuestions(questionsData as Question[]);
        }
      } catch (err) {
        console.error('Error fetching contest data:', (err as Error).message);
        setErrorFetchingQuestions('There was an error fetching contest data.');
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchContestData();

    // Real-time subscription to see if submissions get closed for this contest
    const contestChannel = supabase
      .channel(`contest-${contest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contests',
          filter: `id=eq.${contest.id}`,
        },
        async (payload) => {
          if (payload.new.submission_open === false) {
            await handleBlankSubmission();
            navigate('/eliminated', { state: { contest } });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contestChannel);
    };
  }, [contest, navigate, user?.id, handleBlankSubmission]);

  // 5) Handle Submit
  const handleSubmit = async (selectedAnswer: string, questionId: string) => {
    setInactiveError('');

    if (!user) {
      alert('You must be logged in to submit.');
      return;
    }
  
    if (!selectedAnswer) {
      alert('Please select an answer before submitting.');
      return;
    }
  
    try {
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id, active')
        .eq('user_id', user.id)
        .eq('contest_id', contest.id)
        .single();
  
      if (participantError || !participant) {
        throw new Error('Could not find participant information.');
      }
  
      if (!participant.active) {
        setInactiveError('You are no longer active in this contest.');
        return;
      }
  
      const { error: answerError } = await supabase.from('answers').insert({
        contest_id: contest.id,
        participant_id: participant.id,
        round: currentRound,
        question_id: questionId, 
        answer: selectedAnswer,
        timestamp: new Date().toISOString(),
      });
  
      if (answerError) {
        throw new Error('Failed to submit the answer.');
      }
  
      navigate('/submitted', {
        state: {
          contest,
          questionId,
          selectedAnswer,
          userId: user.id,
        },
      });
    } catch (err) {
      console.error('Error during submission:', (err as Error).message);
      alert('There was an error submitting your answer. Please try again.');
    }
  };

  // 6) Loading states
  if (isAuthLoading) return <div>Loading user information...</div>;
  if (loadingQuestions) return <div>Loading questions...</div>;
  if (errorFetchingQuestions) return <div>Error: {errorFetchingQuestions}</div>;

  // 7) UI display
  const currentQuestion = questions[currentQuestionIndex];
  const questionText = currentQuestion
    ? currentQuestion.question
    : 'No question available';
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
        {/* Show an error if user tries to submit while inactive */}
        {inactiveError && (
          <div className={styles.errorMessage}>{inactiveError}</div>
        )}
        <div className={styles.questionBlock}>
          <div className={styles.questionText}>{questionText}</div>
          {currentQuestion && (
            <AnswersContainer
              answers={questionAnswers}
              onSubmit={(selectedAnswer: string) =>
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
