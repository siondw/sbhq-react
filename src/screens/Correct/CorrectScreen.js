// src/pages/CorrectScreen/CorrectScreen.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../supabase";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import GameStatsSummary from "../../components/GameStatsSummary/GameStatsSummary";
import styles from "./CorrectScreen.module.css";

import { useAuth } from "../../contexts/AuthContext";
import useRequireState from "../../hooks/useRequireState";

function CorrectScreen() {
  const navigate = useNavigate();

  // Ensure we have `contest` in location.state, otherwise redirect
  const { contest } = useRequireState(["contest"], "/");
  const { user, loading: authLoading } = useAuth();

  // We'll display the round number if needed
  const [currentRound, setCurrentRound] = useState(contest?.current_round ?? 1);
  const [numberOfRemainingPlayers, setNumberOfRemainingPlayers] = useState(0);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // 1) On mount, fetch participants & see if user is still active
  useEffect(() => {
    if (!contest?.id || !user?.id) return;

    const fetchParticipants = async () => {
      try {
        const { data: participants, error } = await supabase
          .from("participants")
          .select("*")
          .eq("contest_id", contest.id);

        if (error) throw error;
        if (!participants) return;

        // Count how many are active
        const activePlayers = participants.filter((p) => p.active).length;
        setNumberOfRemainingPlayers(activePlayers);

        // Check if *this* user is still active
        const userParticipant = participants.find((p) => p.user_id === user.id);
        if (!userParticipant || !userParticipant.active) {
          navigate("/eliminated", { replace: true });
          return;
        }

        setLoadingPlayers(false);
      } catch (err) {
        console.error("Error fetching participants:", err);
        setLoadingPlayers(false);
      }
    };

    fetchParticipants();
  }, [contest?.id, user?.id, navigate]);

  // 2) Subscribe to real-time updates in `contests` and `participants`
  useEffect(() => {
    if (!contest?.id || !user?.id) return;

    // Listen for changes in the `contests` table for this contest
    const contestChannel = supabase
      .channel(`contest-${contest.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contests",
          filter: `id=eq.${contest.id}`,
        },
        (payload) => {
          const newRound = payload.new.current_round;
          const newSubmissionOpen = payload.new.submission_open;

          // Always keep our local round in sync, in case the admin changes it
          setCurrentRound(newRound);

          // If the admin opened submissions, we assume it's time for the next question
          if (newSubmissionOpen === true) {
            navigate("/question", {
              replace: true,
              state: {
                contest: {
                  ...contest,
                  current_round: newRound,
                  submission_open: true,
                },
              },
            });
          }
        }
      )
      .subscribe();

    // Listen for updates to participants in this contest
    const participantsChannel = supabase
      .channel(`participants-${contest.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `contest_id=eq.${contest.id}`,
        },
        async (payload) => {
          try {
            const { data: updatedParticipants, error } = await supabase
              .from("participants")
              .select("*")
              .eq("contest_id", contest.id);

            if (error || !updatedParticipants) return;

            // Recount how many are active
            const activeCount = updatedParticipants.filter((p) => p.active)
              .length;
            setNumberOfRemainingPlayers(activeCount);

            // If the user is now inactive, eliminate them
            const userParticipant = updatedParticipants.find(
              (p) => p.user_id === user.id
            );
            if (!userParticipant || !userParticipant.active) {
              navigate("/eliminated", { replace: true });
            }
          } catch (err) {
            console.error("Error refreshing participants:", err);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(contestChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [contest?.id, user?.id, navigate]);

  // 3) Prevent back navigation
  useEffect(() => {
    const blockBack = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener("popstate", blockBack);
    return () => window.removeEventListener("popstate", blockBack);
  }, []);

  // If still loading user info or the participant data
  if (authLoading || loadingPlayers) {
    return <div>Loading...</div>;
  }

  // Render the “Correct” screen
  return (
    <div className={styles.correctScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span className={styles.correctText}>Correct</span>
          <span className={styles.checkMarkIcon}>✔️</span>
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
