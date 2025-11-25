// src/components/admin/ContestDetail/InContestScreen.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./InContestScreen.module.css";

import SubheaderToggles from "../InContest/SubheaderToggles/SubheaderToggles";
import StatCard from "../InContest/StatCard/StatCard";
import CurrentQuestionView, {
  AdminQuestion,
} from "../InContest/CurrentQuestionView/CurrentQuestionView";
import QuestionsList from "../InContest/QuestionList/QuestionList";
import QuestionModal from "../InContest/QuestionModal/QuestionModal";

import { supabase } from "../../../supabase";
import { ContestRow } from "../../../types/sbhq";

function InContestScreen() {
  const { id } = useParams<{ id: string }>();
  const contestId = id ?? "";
  const navigate = useNavigate();

  const [contest, setContest] = useState<ContestRow | null>(null);
  const [loadingContest, setLoadingContest] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [reinstateRound, setReinstateRound] = useState("");
  const [activeParticipants, setActiveParticipants] = useState(0);

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<AdminQuestion | null>(null);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);

  // 1) Fetch the contest and participants on mount
  useEffect(() => {
    async function fetchContestData() {
      if (!contestId) {
        setError("Contest ID missing");
        setLoadingContest(false);
        return;
      }
      try {
        // fetch the contest
        const { data: cData, error: cErr } = await supabase
          .from("contests")
          .select("*")
          .eq("id", contestId)
          .single();
        if (cErr || !cData) throw cErr || new Error("Contest not found");

        const typedContest = cData as ContestRow;
        setContest(typedContest);
        setLobbyOpen(typedContest.lobby_open);
        setSubmissionOpen(typedContest.submission_open);
        setFinished(typedContest.finished);
        setCurrentRound(typedContest.current_round || 0);

        // fetch active participants count
        const { count, error: pErr } = await supabase
          .from("participants")
          .select("id", { count: "exact", head: true })
          .eq("contest_id", contestId)
          .eq("active", true);

        if (pErr) {
          console.error("Error fetching participants:", pErr);
        } else {
          setActiveParticipants(count || 0);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching contest data:", err);
        setError(message);
      } finally {
        setLoadingContest(false);
      }
    }
    fetchContestData();
  }, [contestId]);

  // 1) Real-time subscription for participants
  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel(`participants-changes-${contestId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // or 'UPDATE' if you only want updates
          schema: "public",
          table: "participants",
          filter: `contest_id=eq.${contestId}`,
        },
        async () => {
          // You can inspect payload.old / payload.new if you want to be more specific
          // about changes to the 'active' field.
          // For instance:
          //   if (payload.new.active !== payload.old.active) {...}

          // For simplicity, just re-fetch the active participants count:
          const { count, error } = await supabase
            .from("participants")
            .select("id", { count: "exact", head: true })
            .eq("contest_id", contestId)
            .eq("active", true);

          if (error) {
            console.error("Error fetching updated participant count", error);
            return;
          }

          setActiveParticipants(count || 0);
        }
      )
      .subscribe();

    // Cleanup: unsubscribe from the channel when component unmounts or contestId changes
    return () => {
      supabase.removeChannel(channel);
    };
  }, [contestId]);

  // 2) Fetch all questions for this contest
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .select("*")
          .eq("contest_id", contestId)
          .order("round", { ascending: true });
        if (qErr) throw qErr;
        setQuestions(qData || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  }
    if (contestId) {
      fetchQuestions();
    }
  }, [contestId]);

  // 3) Handle toggles (lobby, submissions, finished)
  async function handleToggleLobby() {
    const updated = !lobbyOpen;
    setLobbyOpen(updated);
    await supabase
      .from("contests")
      .update({ lobby_open: updated })
      .eq("id", contestId);
  }

  async function handleToggleSubmissions() {
    const updated = !submissionOpen;
    setSubmissionOpen(updated);
    await supabase
      .from("contests")
      .update({ submission_open: updated })
      .eq("id", contestId);
  }

  async function handleToggleFinished() {
    const updated = !finished;
    setFinished(updated);
    await supabase
      .from("contests")
      .update({ finished: updated })
      .eq("id", contestId);
  }

  // 4) Handle round change (manual up/down)
  async function incrementRound(delta: number) {
    const newRound = currentRound + delta;
    if (newRound < 0) return;
    setCurrentRound(newRound);
    await supabase
      .from("contests")
      .update({ current_round: newRound })
      .eq("id", contestId);
  }

  // 5) Create / Edit question
  function openCreateQuestionModal() {
    setQuestionToEdit(null);
    setShowQuestionModal(true);
  }
  function openEditQuestionModal(q: AdminQuestion) {
    setQuestionToEdit(q);
    setShowQuestionModal(true);
  }
  function closeQuestionModal() {
    setShowQuestionModal(false);
    setQuestionToEdit(null);
  }

  // 6) Reinstate participants from a round
  async function handleReinstateParticipants() {
    if (!reinstateRound) {
      alert("Please enter a valid round number.");
      return;
    }
    if (
      !window.confirm(`Reinstate participants from round ${reinstateRound}?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("participants")
        .update({ active: true, elimination_round: null })
        .eq("contest_id", contestId)
        .eq("elimination_round", parseInt(reinstateRound, 10));

      if (error) {
        console.error("Error reinstating participants:", error.message);
        alert("Failed to reinstate participants.");
      } else {
        alert(
          `Participants from round ${reinstateRound} reinstated successfully!`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error:", message);
    }
  }

  // After we add or edit a question, re-fetch questions
  async function handleQuestionSavedOrDeleted() {
    closeQuestionModal();
    // refetch questions
    try {
      const { data: qData, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .eq("contest_id", contestId)
        .order("round", { ascending: true });
      if (qErr) throw qErr;
      setQuestions((qData as AdminQuestion[]) || []);
    } catch (err) {
      console.error("Error refreshing questions:", err);
    }
  }

  if (loadingContest) return <div>Loading contest...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!contest) return <div>Contest not found.</div>;

  return (
    <div className={styles.inContestWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.left}>Admin</div>
        <div className={styles.center}>{contest.name}</div>
        <div className={styles.right}>SBHQ</div>
      </header>

      {/* Subheader row with toggles + round */}
      <SubheaderToggles
        lobbyOpen={lobbyOpen}
        submissionOpen={submissionOpen}
        finished={finished}
        onToggleLobby={handleToggleLobby}
        onToggleSubmission={handleToggleSubmissions}
        onToggleFinished={handleToggleFinished}
        roundNumber={currentRound}
        onIncrementRound={incrementRound}
      />

      {/* Main Content Layout */}
      <div className={styles.mainContent}>
        {/* Left column: stat cards */}
        <div className={styles.leftColumn}>
          <StatCard value={activeParticipants} label="PARTICIPANTS" />
          <StatCard value={currentRound} label="ROUND" />

          {/* Reinstate Participants Card */}
          <div className={styles.reinstateCard}>
            <input
              type="number"
              placeholder="Enter Round Number"
              value={reinstateRound}
              onChange={(e) => setReinstateRound(e.target.value)}
              className={styles.roundInput}
            />
            <button
              className={styles.reinstateButton}
              onClick={handleReinstateParticipants}
            >
              Reinstate Players
            </button>
          </div>
        </div>

        {/* Center area: Current question view */}
        <div className={styles.centerColumn}>
          <CurrentQuestionView
            roundNumber={currentRound}
            submissionOpen={submissionOpen}
            questions={questions}
            // Possibly pass more props about the game flow
            onCreateQuestion={openCreateQuestionModal}
          />
        </div>

        {/* Right column: list of all questions */}
        <div className={styles.rightColumn}>
          <QuestionsList
            questions={questions}
            onEditQuestion={openEditQuestionModal}
          />
        </div>
      </div>

      {/* The Question modal (for create/edit) */}
      {showQuestionModal && (
        <QuestionModal
          contestId={contestId}
          question={questionToEdit}
          onClose={closeQuestionModal}
          onSavedOrDeleted={handleQuestionSavedOrDeleted}
        />
      )}

      {/* Possibly a floating + button if you prefer */}
      <button className={styles.fab} onClick={openCreateQuestionModal}>
        +
      </button>

      {/* Add back button before closing wrapper div */}
      <button className={styles.backButton} onClick={() => navigate("/admin")}>
        &larr; Back to Contests
      </button>
    </div>
  );
}

export default InContestScreen;





