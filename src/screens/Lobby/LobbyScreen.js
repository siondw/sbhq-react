import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import PlayerList from "../../components/PlayersList/PlayersList";
import styles from "./LobbyScreen.module.css";
import { supabase } from "../../supabase";

function LobbyScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { contest } = location.state; // Access contest object directly from location state
  const gradientStyle = "linear-gradient(167deg, #54627B, #303845)";
  const [players, setPlayers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Fetch participants from Supabase
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!contest?.id) {
        console.error("Contest ID is missing");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("participants")
          .select("user_id, active, users(username)")
          .eq("contest_id", contest.id)
          .eq("active", true);

        if (error) throw error;

        const activePlayers = data?.map((participant) => participant.users.username) || [];
        setPlayers(activePlayers);
      } catch (err) {
        console.error("Failed to fetch participants:", err.message);
      }
    };

    fetchParticipants();
  }, [contest?.id]);

  // Calculate and update time remaining
  useEffect(() => {
    if (contest?.start_time) {
      const contestStartTime = new Date(contest.start_time).getTime();
      setTimeRemaining(calculateTimeRemaining(contestStartTime));
    }

    const timer = setInterval(() => {
      if (contest?.start_time) {
        const newTimeRemaining = calculateTimeRemaining(new Date(contest.start_time).getTime());
        if (newTimeRemaining <= 0) {
          clearInterval(timer);
          navigate("/question", { state: { contest } });
        }
        setTimeRemaining(newTimeRemaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest, navigate]);

  // Helper functions
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
