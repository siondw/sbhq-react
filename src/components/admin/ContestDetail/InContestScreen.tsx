import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./InContestScreen.module.css";

import SubheaderToggles from "../InContest/SubheaderToggles/SubheaderToggles";
import StatCard from "../InContest/StatCard/StatCard";
import CurrentQuestionView from "../InContest/CurrentQuestionView/CurrentQuestionView";
import QuestionsList from "../InContest/QuestionList/QuestionList";
import QuestionModal from "../InContest/QuestionModal/QuestionModal";

import { supabase } from "../../../supabase";
import type { ContestRow, QuestionRow } from "../../../types/sbhq";

type AdminQuestion = QuestionRow & { options?: string[] | Record<string, string>; correct_option?: string | null };

function InContestScreen() {
  const { id: contestId } = useParams<{ id: string }>();
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

  useEffect(() => {
    async function fetchContestData() {
      try {
        const { data: cData, error: cErr } = await supabase
          .from("contests")
          .select("*")
          .eq("id", contestId)
          .single();
        if (cErr || !cData) throw cErr || new Error("Contest not found");

        setContest(cData);
        setLobbyOpen(cData.lobby_open);
        setSubmissionOpen(cData.submission_open);
        setFinished(cData.finished);
        setCurrentRound(cData.current_round || 0);

        const { count, error: pErr } = await supabase
          .from("participants")
          .select("id", { count: "exact", head: true })
          .eq("contest_id", contestId)
          .eq("active", true);

        if (!pErr) setActiveParticipants(count || 0);
      } catch (err) {
        console.error("Error fetching contest data:", err);
        setError((err as Error).message);
      } finally {
        setLoadingContest(false);
      }
    }
    if (contestId) fetchContestData();
  }, [contestId]);

  useEffect(() => {
    if (!contestId) return;
    const channel = supabase
      .channel(`participants-changes-${contestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `contest_id=eq.${contestId}`,
        },
        async () => {
          const { count, error } = await supabase
            .from("participants")
            .select("id", { count: "exact", head: true })
            .eq("contest_id", contestId)
            .eq("active", true);
          if (!error) setActiveParticipants(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contestId]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .select("*")
          .eq("contest_id", contestId)
          .order("round", { ascending: true });
        if (qErr) throw qErr;
        setQuestions((qData as AdminQuestion[]) || []);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    }
    if (contestId) {
      fetchQuestions();
    }
  }, [contestId]);

  async function handleToggleLobby() {
    const updated = !lobbyOpen;
    setLobbyOpen(updated);
    await supabase.from("contests").update({ lobby_open: updated }).eq("id", contestId);
  }

  async function handleToggleSubmissions() {
    const updated = !submissionOpen;
    setSubmissionOpen(updated);
    await supabase.from("contests").update({ submission_open: updated }).eq("id", contestId);
  }

  async function handleToggleFinished() {
    const updated = !finished;
    setFinished(updated);
    await supabase.from("contests").update({ finished: updated }).eq("id", contestId);
  }

  async function incrementRound(delta: number) {
    const newRound = currentRound + delta;
    if (newRound < 0) return;
    setCurrentRound(newRound);
    await supabase.from("contests").update({ current_round: newRound }).eq("id", contestId);
  }

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

  async function handleReinstateParticipants() {
    if (!reinstateRound) {
      alert("Please enter a valid round number.");
      return;
    }
    if (!window.confirm(`Reinstate participants from round ${reinstateRound}?`)) {
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
        alert(`Participants from round ${reinstateRound} reinstated successfully!`);
      }
    } catch (err) {
      console.error("Error:", (err as Error).message);
    }
  }

  async function handleQuestionSavedOrDeleted() {
    closeQuestionModal();
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
      <header className={styles.header}>
        <div className={styles.left}>Admin</div>
        <div className={styles.center}>{contest.name}</div>
        <div className={styles.right}>SBHQ</div>
      </header>

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

      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <StatCard value={activeParticipants} label="PARTICIPANTS" />
          <StatCard value={currentRound} label="ROUND" />

          <div className={styles.reinstateCard}>
            <input
              type="number"
              placeholder="Enter Round Number"
              value={reinstateRound}
              onChange={(e) => setReinstateRound(e.target.value)}
              className={styles.roundInput}
            />
            <button className={styles.reinstateButton} onClick={handleReinstateParticipants}>
              Reinstate Players
            </button>
          </div>
        </div>

        <div className={styles.centerColumn}>
          <CurrentQuestionView
            roundNumber={currentRound}
            submissionOpen={submissionOpen}
            questions={questions}
            onCreateQuestion={openCreateQuestionModal}
          />
        </div>

        <div className={styles.rightColumn}>
          <QuestionsList questions={questions} onEditQuestion={openEditQuestionModal} />
        </div>
      </div>

      {showQuestionModal && (
        <QuestionModal
          contestId={contestId || ""}
          question={questionToEdit}
          onClose={closeQuestionModal}
          onSavedOrDeleted={handleQuestionSavedOrDeleted}
        />
      )}

      <button className={styles.fab} onClick={openCreateQuestionModal}>
        +
      </button>

      <button className={styles.backButton} onClick={() => navigate("/admin")}>
        ← Back to Contests
      </button>
    </div>
  );
}

export default InContestScreen;
