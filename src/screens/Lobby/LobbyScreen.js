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
  const { contest } = location.state; // Access contest object directly from location state
  const gradientStyle = "linear-gradient(167deg, #54627B, #303845)";
  const [players, setPlayers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const db = getDatabase();

    // Fetch participants from the new structure
    console.log("contest.id", contest.id);
    const participantsRef = ref(db, `contests/${contest.id}/participants`);
    console.log("participantsRef", participantsRef);
    onValue(participantsRef, (snapshot) => {
      const participantsData = snapshot.val();
      const activePlayers = participantsData
        ? Object.values(participantsData)
            .filter((participant) => participant.active)
            .map((participant) => participant.username)
        : [];
      setPlayers(activePlayers);
    });

    // Calculate time remaining for the contest
    if (contest && contest.date) {
      const contestStartTime = new Date(contest.date).getTime();
      setTimeRemaining(calculateTimeRemaining(contestStartTime));
    }
  }, [contest]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (contest && contest.date) {
        const newTimeRemaining = calculateTimeRemaining(
          new Date(contest.date).getTime()
        );
        if (newTimeRemaining <= 0) {
          clearInterval(timer);
          navigate("/question", { state: { contest } });
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
