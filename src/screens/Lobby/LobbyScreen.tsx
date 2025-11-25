import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import PlayerList from '../../components/PlayersList/PlayersList';
import styles from './LobbyScreen.module.css';
import { supabase } from '../../supabase';
import type { ContestRow } from '../../types/sbhq';

type LocationState = {
  contest: ContestRow;
};

type ParticipantWithUser = {
  user_id: string;
  active: boolean;
  users?: { username: string | null } | { username: string | null }[] | null;
};

function LobbyScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const contest = state?.contest;
  const gradientStyle = 'linear-gradient(167deg, #54627B, #303845)';
  const [players, setPlayers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!contest?.id) return;

    const setupRealtimeListener = () => {
      // TODO: Replace any-cast once Supabase typings expose postgres_changes channel handler shape.
      const channel = (supabase.channel(`contest-updates-${contest.id}`) as any)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'contests',
            filter: `id=eq.${contest.id}`,
          },
          (payload: any) => {
            const updatedContest = payload.new as ContestRow;
            if (updatedContest?.submission_open) {
              navigate('/question', { state: { contest: updatedContest } });
            }
          }
        )
        .subscribe();

      return channel;
    };

    const checkSubmissionOpen = async () => {
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('submission_open')
          .eq('id', contest.id)
          .single();

        if (error) {
          console.error('Error fetching contest:', error);
          return;
        }

        if (data?.submission_open) {
          navigate('/question', { state: { contest } });
        } else {
          fetchParticipants();
        }
      } catch (err) {
        console.error('Failed to check submission_open:', (err as Error).message);
      }
    };

    const channel = setupRealtimeListener();
    checkSubmissionOpen();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [contest, navigate]);

  const fetchParticipants = async () => {
    if (!contest?.id) {
      console.error('Contest ID is missing');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('participants')
        .select('user_id, active, users(username)')
        .eq('contest_id', contest.id)
        .eq('active', true);

      if (error) throw error;

      const activePlayers =
        (data as ParticipantWithUser[] | null)
          ?.flatMap((participant) => {
            const userField = participant.users;
            if (Array.isArray(userField)) {
              return userField.map((u) => u?.username).filter(Boolean);
            }
            return userField?.username ? [userField.username] : [];
          })
          .filter((username): username is string => Boolean(username)) || [];
      setPlayers(activePlayers);
    } catch (err) {
      console.error('Failed to fetch participants:', (err as Error).message);
    }
  };

  useEffect(() => {
    if (!contest?.start_time) return;

    const contestStartTime = new Date(contest.start_time).getTime();

    const updateTimer = () => {
      const remaining = calculateTimeRemaining(contestStartTime);
      setTimeRemaining(remaining);

      if (remaining <= 0 && timerRef.current) {
        setTimeRemaining(0);
        clearInterval(timerRef.current);
      }
    };

    timerRef.current = setInterval(updateTimer, 1000);
    updateTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [contest?.start_time]);

  const calculateTimeRemaining = (startTime: number) => {
    const now = new Date().getTime();
    return Math.max(startTime - now, 0);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!contest) {
    return <div>Loading contest details...</div>;
  }

  return (
    <div className={styles.lobbyScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span
            className={styles.timer}
            style={{
              background: gradientStyle,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
        <MainText subheader="until the game starts..." gradient={gradientStyle} />
        <PlayerList players={players} />
      </div>
    </div>
  );
}

export default LobbyScreen;
