import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import PlayerList from "../../components/PlayersList/PlayersList";
import styles from "./LobbyScreen.module.css";
import { supabase } from "../../supabase";
import type { ContestRow } from "../../types/sbhq";

function LobbyScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { contest } = (location.state || {}) as { contest?: ContestRow }; // Access contest object directly from location state
  const gradientStyle = "linear-gradient(167deg, #54627B, #303845)";
  const [players, setPlayers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const fetchParticipants = useCallback(async () => {
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

      type ParticipantWithUser = { users?: { username?: string | null } | null };
      const participantRows = ((data as ParticipantWithUser[]) || []) as ParticipantWithUser[];
      const activePlayers =
        participantRows
          .map((participant) => participant.users?.username || "")
          .filter((name): name is string => Boolean(name)) || [];
      setPlayers(activePlayers);
    } catch (err) {
      console.error("Failed to fetch participants:", (err as Error).message);
    }
  }, [contest?.id]);

  const setupRealtimeListener = useCallback(() => {
    if (!contest?.id) return null;
    return supabase
      .channel(`contest-updates-${contest.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "contests",
          filter: `id=eq.${contest.id}`,
        },
        (payload: { new: ContestRow }) => {
          const updatedContest = payload.new;
          if (updatedContest?.submission_open) {
            navigate("/question", { state: { contest: updatedContest } });
          }
        }
      )
      .subscribe();
  }, [contest, navigate]);

  // Listen for updates to 'submission_open' in the current contest
  useEffect(() => {
    if (!contest?.id) return;

    let subscription: ReturnType<typeof setupRealtimeListener> | null = null;

    const checkSubmissionOpen = async () => {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("submission_open")
          .eq("id", contest.id)
          .single();

        if (error) {
          console.error("Error fetching contest:", error);
          return;
        }

        if (data?.submission_open) {
          navigate("/question", { state: { contest } });
        } else {
          subscription = setupRealtimeListener();
          fetchParticipants();
        }
      } catch (err) {
        console.error("Failed to check submission_open:", (err as Error).message);
      }
    };

    checkSubmissionOpen();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [contest, contest?.id, fetchParticipants, navigate, setupRealtimeListener]);

  // Update countdown timer
  useEffect(() => {
    if (!contest?.start_time) return;

    const contestStartTime = new Date(contest.start_time).getTime();

    const updateTimer = () => {
      const remaining = calculateTimeRemaining(contestStartTime);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setTimeRemaining(0); // Prevent negative values
        if (timerRef) clearInterval(timerRef);
      }
    };

    const timerRef = setInterval(updateTimer, 1000);

    updateTimer(); // Set initial timer value

    return () => clearInterval(timerRef);
  }, [contest?.start_time]);

  // Helper functions
  function calculateTimeRemaining(startTime: number) {
    const now = new Date().getTime();
    return Math.max(startTime - now, 0); // Ensure no negative values
  }

  function formatTime(ms: number) {
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
        <MainText header=" " subheader="until the game starts..." gradient={gradientStyle} />
        <PlayerList players={players} />
      </div>
    </div>
  );
}

export default LobbyScreen;
