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

        const activePlayers =
          data?.map((participant) => participant.users.username) || [];
        setPlayers(activePlayers);
      } catch (err) {
        console.error("Failed to fetch participants:", err.message);
      }
    };

    fetchParticipants();
  }, [contest?.id]);

  // Listen for updates to 'submission_open' in the current contest
  useEffect(() => {
    if (!contest?.id) return;

    const channel = supabase
      .channel(`contest-updates-${contest.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Listen for UPDATEs
          schema: "public", // Schema name
          table: "contests", // Table name
          filter: `id=eq.${contest.id}`, // Filter for the specific contest
        },
        (payload) => {
          const updatedContest = payload.new;
          if (updatedContest.submission_open) {
            navigate("/question", { state: { contest: updatedContest } });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [contest?.id, navigate]);

  // Update countdown timer
  useEffect(() => {
    if (!contest?.start_time) return;

    const contestStartTime = new Date(contest.start_time).getTime();

    const updateTimer = () => {
      const remaining = calculateTimeRemaining(contestStartTime);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setTimeRemaining(0); // Prevent negative values
        clearInterval(timer);
      }
    };

    updateTimer(); // Set initial timer value
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [contest?.start_time]);

  // Helper functions
  function calculateTimeRemaining(startTime) {
    const now = new Date().getTime();
    return Math.max(startTime - now, 0); // Ensure no negative values
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
        <MainText subheader="until the game starts..." gradient={gradientStyle} />
        <PlayerList players={players} />
      </div>
    </div>
  );
}

export default LobbyScreen;
