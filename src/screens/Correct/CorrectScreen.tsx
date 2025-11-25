import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../supabase';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import GameStatsSummary from '../../components/GameStatsSummary/GameStatsSummary';
import styles from './CorrectScreen.module.css';

import { useAuth } from '../../contexts/AuthContext';
import useRequireState from '../../hooks/useRequireState';
import type { ContestRow } from '../../types/sbhq';

function CorrectScreen() {
  const navigate = useNavigate();

  const { contest } = useRequireState(['contest'], '/') as { contest: ContestRow };
  const { user, isLoading: authLoading } = useAuth();

  const [currentRound, setCurrentRound] = useState(contest?.current_round ?? 1);
  const [numberOfRemainingPlayers, setNumberOfRemainingPlayers] = useState(0);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    if (!contest?.id) return;

    const fetchOnMount = async () => {
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('submission_open, current_round')
          .eq('id', contest.id)
          .single();

        if (error) {
          console.error('Error fetching contest state on refresh:', error);
          return;
        }

        if (data?.submission_open) {
          navigate('/question', {
            replace: true,
            state: {
              contest: { ...contest, ...data },
            },
          });
        } else {
          setCurrentRound(data?.current_round || currentRound);
        }
      } catch (err) {
        console.error('Failed to fetch contest state on refresh:', (err as Error).message);
      }
    };

    fetchOnMount();
  }, [contest?.id, navigate, currentRound]);

  useEffect(() => {
    if (!contest?.id || !user?.id) return;

    const fetchParticipants = async () => {
      type Participant = {
        id: string;
        user_id: string;
        active: boolean;
        contest_id: string;
        elimination_round: number | null;
      };

      try {
        const { data: participants, error } = await supabase
          .from('participants')
          .select('*')
          .eq('contest_id', contest.id);

        if (error) throw error;
        if (!participants) return;

        const activePlayers = (participants as Participant[]).filter((p) => p.active).length;
        setNumberOfRemainingPlayers(activePlayers);

        const userParticipant = (participants as Participant[]).find((p) => p.user_id === user.id);
        if (!userParticipant || !userParticipant.active) {
          navigate('/eliminated', { replace: true });
          return;
        }

        setLoadingPlayers(false);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setLoadingPlayers(false);
      }
    };

    fetchParticipants();
  }, [contest?.id, user?.id, navigate]);

  useEffect(() => {
    if (!contest?.id || !user?.id) return;

    const contestChannel = supabase
      .channel(`contest-${contest.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contests',
          filter: `id=eq.${contest.id}`,
        },
        async (payload: any) => {
          const newSubmissionOpen = payload.new.submission_open;

          if (newSubmissionOpen === true) {
            navigate('/question', {
              replace: true,
              state: {
                contest: { ...contest, ...payload.new },
              },
            });
          } else {
            setCurrentRound(payload.new.current_round);
          }
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel(`participants-${contest.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `contest_id=eq.${contest.id}`,
        },
        async () => {
          try {
            type Participant = {
              id: string;
              user_id: string;
              active: boolean;
              contest_id: string;
              elimination_round: number | null;
            };

            const { data: updatedParticipants, error } = await supabase
              .from('participants')
              .select('*')
              .eq('contest_id', contest.id);

            if (error || !updatedParticipants) return;

            const activeCount = (updatedParticipants as Participant[]).filter((p) => p.active)
              .length;
            setNumberOfRemainingPlayers(activeCount);

            const userParticipant = (updatedParticipants as Participant[]).find(
              (p) => p.user_id === user.id
            );
            if (!userParticipant || !userParticipant.active) {
              navigate('/eliminated', { replace: true });
            }
          } catch (err) {
            console.error('Error refreshing participants:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contestChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [contest?.id, user?.id, navigate]);

  useEffect(() => {
    const blockBack = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener('popstate', blockBack);
    return () => window.removeEventListener('popstate', blockBack);
  }, []);

  if (authLoading || loadingPlayers) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.correctScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span className={styles.correctText}>Correct</span>
          <span className={styles.checkMarkIcon}>✓</span>
        </div>
        <MainText
          header=""
          subheader="Stay Tuned for the Next Question..."
          gradient="linear-gradient(180deg, #01710C 0%, #54627B 100%)"
        />
      </div>
      <GameStatsSummary
        numberOfRemainingPlayers={numberOfRemainingPlayers}
        roundNumber={currentRound || 1}
        className={styles.gameStatsSummary}
      />
    </div>
  );
}

export default CorrectScreen;
