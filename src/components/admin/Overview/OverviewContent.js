// src/components/OverviewContent/OverviewContent.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase'; // your Supabase client
import styles from './OverviewContent.module.css';

import { UserGroupIcon, RefreshIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline'; 
import { useAuth } from "../../../contexts/AuthContext";

const OverviewContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [activeParticipants, setActiveParticipants] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // 1) Check admin role from user (depending on your Supabase Auth setup)
  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // 2) Fetch “open” contest, participants, and question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 2a) Fetch all contests where lobby_open = true
        const { data: contestsData, error: contestsError } = await supabase
          .from('contests')
          .select('*')
          .eq('lobby_open', true); // or whatever your field is named

        if (contestsError) throw contestsError;

        if (!contestsData || contestsData.length === 0) {
          // No open-lobby contests found
          setContest(null);
          setIsLoading(false);
          return;
        }

        // Assuming only one “open-lobby” contest at a time
        const currentContest = contestsData[0];
        setContest(currentContest);
        setCurrentRound(currentContest.current_round);

        // 2b) Count active participants for this contest
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('id, active')
          .eq('contest_id', currentContest.id);

        if (participantError) throw participantError;

        const activeCount = participantData.filter(p => p.active).length;
        setActiveParticipants(activeCount);

        // 2c) Fetch the question for current_round
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('question, round')
          .eq('contest_id', currentContest.id)
          .eq('round', currentContest.current_round)
          .single(); 
          // .single() if you expect exactly 1 question per round

        if (questionError && questionError.code !== 'PGRST116') {
          // PGRST116 means no rows returned for 'single'
          throw questionError;
        }

        if (!questionData) {
          // Maybe no question for this round
          setCurrentQuestion("No question found for current round.");
        } else {
          setCurrentQuestion(questionData.question_text);
        }
      } catch (err) {
        console.error("Error loading overview:", err);
        setError("Error loading overview data. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3) Toggle submissions logic
  //    In Firebase, you used 'contests/${contest.id}/submissionsOpen'.
  //    In Supabase, we likely have 'submission_open' column in 'contests'.
  const handleToggleSubmissions = async () => {
    if (!contest) return;

    try {
      // fetch updated row first to see if submissions are open
      const { data: freshContest, error: fetchError } = await supabase
        .from('contests')
        .select('submission_open')
        .eq('id', contest.id)
        .single();

      if (fetchError) throw fetchError;
      if (!freshContest) return;

      const currentlyOpen = freshContest.submission_open;
      const newValue = !currentlyOpen;

      // 3a) Update contest submission_open
      const { error: updateError } = await supabase
        .from('contests')
        .update({ submission_open: newValue })
        .eq('id', contest.id);

      if (updateError) throw updateError;
      
      // For “closing submissions” logic, you might want to do elimination
      // of participants who did not submit. That’s more complex with Supabase,
      // since you have to compare answers vs. participants, etc.
      // For now, we’ll just show how to flip submission_open:
      
      // Re-fetch the contest to update UI
      const { data: updatedContest, error: refreshErr } = await supabase
        .from('contests')
        .select('*')
        .eq('id', contest.id)
        .single();

      if (!refreshErr && updatedContest) {
        setContest(updatedContest);
      }

      console.log("Submissions toggled:", newValue);
    } catch (error) {
      console.error("Error toggling submissions:", error);
      alert("There was an error toggling submissions. Please try again.");
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading overview...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!contest) {
    return <div>No open-lobby contests found.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Dashboard Overview</h2>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <UserGroupIcon className={styles.icon} />
          </div>
          <h3 className={styles.cardTitle}>Total Active Participants</h3>
          <p className={styles.cardValue}>{activeParticipants}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <RefreshIcon className={styles.icon} />
          </div>
          <h3 className={styles.cardTitle}>Current Round</h3>
          <p className={styles.cardValue}>{currentRound}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <QuestionMarkCircleIcon className={styles.icon} />
          </div>
          <h3 className={styles.cardTitle}>Current Question</h3>
          <p className={styles.cardValue}>{currentQuestion}</p>
        </div>
      </div>

      {isAdmin && (
        <div className={styles.adminControls}>
          <button
            className={`${styles.toggleButton} ${
              contest.submission_open ? styles.close : styles.open
            }`}
            onClick={handleToggleSubmissions}
          >
            {contest.submission_open ? "Close Submissions" : "Open Submissions"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OverviewContent;
