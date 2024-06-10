import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import PlayerList from "../../components/PlayersList/PlayersList";
import styles from "./LobbyScreen.module.css";

function LobbyScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { contestId } = location.state; // Get contestId from state
  const gradientStyle = "linear-gradient(167deg, #54627B, #303845)";
  const [contest, setContest] = useState(null);
  const [players, setPlayers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const db = getDatabase();
    const contestRef = ref(db, `contests/${contestId}`);

    // Fetch contest details
    onValue(contestRef, (snapshot) => {
      const contestData = snapshot.val();
      setContest(contestData);

      // Calculate time remaining
      if (contestData && contestData.startTime) {
        const contestStartTime = new Date(contestData.startTime).getTime();
        setTimeRemaining(calculateTimeRemaining(contestStartTime));
      }
    });

    // Fetch participants
    const participantsRef = ref(db, `contests/${contestId}/participants`);
    onValue(participantsRef, (snapshot) => {
      const participantsData = snapshot.val();
      const activePlayers = participantsData
        ? Object.values(participantsData)
            .filter((participant) => participant.active)
            .map((participant) => participant.username)
        : [];
      setPlayers(activePlayers);
    });
  }, [contestId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (contest && contest.startTime) {
        const newTimeRemaining = calculateTimeRemaining(
          new Date(contest.startTime).getTime()
        );
        if (newTimeRemaining <= 0) {
          clearInterval(timer);
          navigate("/question", { state: { contest } }); // Redirect to question screen
        }
        setTimeRemaining(newTimeRemaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest, navigate]);

  function calculateTimeRemaining(startTime) {
    const now = new Date().getTime();
    const difference = startTime - now;
    return Math.max(difference, 0);
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

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
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
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
