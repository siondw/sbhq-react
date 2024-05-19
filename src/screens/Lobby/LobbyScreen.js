import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import PlayerList from '../../components/PlayersList/PlayersList';
import styles from './LobbyScreen.module.css';

function LobbyScreen() {
  const location = useLocation();
  const { contest } = location.state; // Get contest details from state
  const gradientStyle = "linear-gradient(167deg, #54627B, #303845)";
  const players = contest.participants || []; // Example player names
  
  const contestStartTime = new Date(contest.startTime).getTime(); // Example start time
  
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(contestStartTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(contestStartTime);
      if (newTimeRemaining <= 0) {
        clearInterval(timer);
      }
      setTimeRemaining(newTimeRemaining);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [contestStartTime]);

  function calculateTimeRemaining(startTime) {
    const now = new Date().getTime();
    const difference = startTime - now;
    return Math.max(difference, 0);
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className={styles.lobbyScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span className={styles.timer} style={{ background: gradientStyle, WebkitBackgroundClip: 'text', color: 'transparent' }}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        <MainText
          header=""
          subheader="until the game starts..."
          gradient={gradientStyle}
        />
        <PlayerList players={players} />
      </div>
    </div>
  );
}

export default LobbyScreen;
