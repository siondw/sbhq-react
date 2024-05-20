import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import ContestCard from '../../components/ContestCard/ContestCard';
import styles from './JoinContestsScreen.module.css';
import { useAuth } from '../../contexts/AuthContext';

function JoinContestsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contests, setContests] = useState({});

  useEffect(() => {
    const fetchContests = async () => {
      const db = getDatabase();
      const contestsRef = ref(db, 'contests');
      const snapshot = await get(contestsRef);
      const contestsData = snapshot.val() || {};
      console.log('Fetched contests:', contestsData); // Log the raw data
      setContests(contestsData);
    };

    fetchContests();
  }, []);

  const handleJoinContest = async (contestId) => {
    const db = getDatabase();
    const contestRef = ref(db, `contests/${contestId}/participants/${user.uid}`);
    await update(contestRef, { username: user.displayName, active: true });
    navigate('/lobby', { state: { contestId } });
  };

  const isUserRegistered = (contest) => {
    return contest.participants && contest.participants.hasOwnProperty(user.uid);
  };

  return (
    <div className={styles.joinContestsScreen}>
      <div className={styles.pregameHeader}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <h1 className={styles.contestHeader}>Contests</h1>
        <div className={styles.contestList}>
          {Object.keys(contests).map(contestId => {
            const contest = { id: contestId, ...contests[contestId] };
            console.log(`Contest ${contestId} startTime:`, contest.startTime); // Log each contest's startTime
            return (
              <ContestCard
                key={contestId}
                contest={contest}
                onJoin={handleJoinContest}
                isRegistered={isUserRegistered(contests[contestId])}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default JoinContestsScreen;
