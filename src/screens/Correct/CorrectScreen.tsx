import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { supabase } from "../../supabase";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import GameStatsSummary from "../../components/GameStatsSummary/GameStatsSummary";
import styles from "./CorrectScreen.module.css";

import { useAuth } from "../../contexts/AuthContext";
import useRequireState from "../../hooks/useRequireState";
import type { ContestRow } from "../../types/sbhq";

type Participant = {
  id: string;
  user_id: string;
  active: boolean;
  contest_id: string;
  elimination_round: number | null;
};

function CorrectScreen() {
  const navigate = useNavigate();

  const { contest } = useRequireState<{ contest: ContestRow }>(["contest"], "/");
  const { user, isLoading: authLoading } = useAuth();

  const [currentRound, setCurrentRound] = useState<number>(contest?.current_round ?? 1);
  const [numberOfRemainingPlayers, setNumberOfRemainingPlayers] = useState(0);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    if (!contest?.id) return;

    const fetchOnMount = async () => {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("submission_open, current_round")
          .eq("id", contest.id)
          .single();

        if (error) {
          console.error("Error fetching contest state on refresh:", error);
          return;
        }

        if (data?.submission_open) {
          navigate("/question", {
            replace: true,
            state: {
              contest: { ...contest, ...data },
            },
          });
        } else {
          setCurrentRound(data?.current_round || currentRound);
        }
      } catch (err) {
        console.error("Failed to fetch contest state on refresh:", (err as Error).message);
      }
    };

    fetchOnMount();
  }, [contest, contest?.id, navigate, currentRound]);

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

        const participantRows = participants as Participant[];
        const activePlayers = participantRows.filter((p) => p.active).length;
        setNumberOfRemainingPlayers(activePlayers);

        const userParticipant = participantRows.find((p) => p.user_id === user.id);
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
  }, [contest, contest?.id, user?.id, navigate]);

  useEffect(() => {
    if (!contest?.id || !user?.id) return;

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
        async (payload: RealtimePostgresChangesPayload<ContestRow>) => {
          const newRow = payload.new as ContestRow | undefined;
          const newSubmissionOpen = newRow?.submission_open;

          if (newSubmissionOpen === true) {
            navigate("/question", {
              replace: true,
              state: {
                contest: { ...contest, ...newRow },
              },
            });
          } else if (newRow?.current_round) {
            setCurrentRound(newRow.current_round);
          }
        }
      )
      .subscribe();

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
        async () => {
          try {
            const { data: updatedParticipants, error } = await supabase
              .from("participants")
              .select("*")
              .eq("contest_id", contest.id);

            if (error || !updatedParticipants) return;

            const participantRows = updatedParticipants as Participant[];
            const activeCount = participantRows.filter((p) => p.active).length;
            setNumberOfRemainingPlayers(activeCount);

            const userParticipant = participantRows.find((p) => p.user_id === user.id);
            if (!userParticipant || !userParticipant.active) {
              navigate("/eliminated", { replace: true });
            }
          } catch (err) {
            console.error("Error refreshing participants:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contestChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [contest, contest?.id, user?.id, navigate]);

  useEffect(() => {
    const blockBack = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener("popstate", blockBack);
    return () => window.removeEventListener("popstate", blockBack);
  }, []);

  if (authLoading || loadingPlayers) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.correctScreen}>
      <Header />
      <div className={styles.content}>
        <div className={styles.textWithIcon}>
          <span className={styles.correctText}>Correct</span>
          <span className={styles.checkMarkIcon}>✓</span>
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
