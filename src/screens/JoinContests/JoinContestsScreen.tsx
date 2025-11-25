import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import ContestCard from '../../components/ContestCard/ContestCard';
import styles from './JoinContestsScreen.module.css';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { ContestRow } from '../../types/sbhq';

type ContestWithParticipants = ContestRow & {
  participants?: { user_id: string; active: boolean }[];
};

function JoinContestsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contests, setContests] = useState<ContestWithParticipants[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch contests initially
  useEffect(() => {
    const fetchContests = async () => {
      if (!user) {
        setError('User is not authenticated.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('contests')
          .select(`
            id,
            name,
            start_time,
            lobby_open,
            participants:participants(user_id, active)
          `)
          .order('start_time', { ascending: true });

        if (error) throw error;

        setContests((data as ContestWithParticipants[]) || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load contests. Please try again later.';
        console.error('Failed to fetch contests:', message);
        setError('Failed to load contests. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, [user]);

  useEffect(() => {
    let isRedirected = false;

    const checkOpenLobbies = async () => {
      if (isRedirected) return;

      try {
        const { data: userContests, error: participantsError } = await supabase
          .from('participants')
          .select('contest_id')
          .eq('user_id', user?.id);

        if (participantsError) throw participantsError;

        if (userContests.length === 0) {
          return;
        }

        const contestIds = userContests.map((p: { contest_id: string }) => p.contest_id);

        const { data: openContests, error: contestsError } = await supabase
          .from('contests')
          .select('*')
          .in('id', contestIds)
          .eq('lobby_open', true);

        if (contestsError) throw contestsError;

        if (openContests && openContests.length > 0) {
          isRedirected = true;
          navigate('/lobby', { state: { contest: openContests[0] } });
        }
      } catch (err) {
        console.error('Failed to check open lobbies:', (err as Error).message);
      }
    };

    checkOpenLobbies();

    const interval = setInterval(checkOpenLobbies, 10000);

    return () => clearInterval(interval);
  }, [navigate, user]);

  const handleJoinContest = async (contestId: string) => {
    if (!user) {
      setError('User is not authenticated. Please log in again.');
      return;
    }

    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          contest_id: contestId,
          user_id: user.id,
          active: true,
        });

      if (error) throw error;

      // Update local state
      setContests((prevContests) =>
        prevContests.map((contest) =>
          contest.id === contestId
            ? {
                ...contest,
                participants: [
                  ...(contest.participants || []),
                  { user_id: user.id, active: true },
                ],
              }
            : contest
        )
      );
    } catch (err) {
      console.error('Failed to join contest:', (err as Error).message);
      setError('Failed to join contest. Please try again later.');
    }
  };

  const isUserRegistered = (contest: ContestWithParticipants) => {
    return (
      Array.isArray(contest.participants) &&
      contest.participants.some((participant) => participant?.user_id === user?.id)
    );
  };

  if (isLoading) {
    return <div>Loading contests...</div>;
  }

  return (
    <div className={styles.joinContestsScreen}>
      <div className={styles.pregameHeader}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <h1 className={styles.contestHeader}>Contests</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.contestList}>
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onJoin={handleJoinContest}
              isRegistered={isUserRegistered(contest)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default JoinContestsScreen;
