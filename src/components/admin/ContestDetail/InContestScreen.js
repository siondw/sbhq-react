// src/components/admin/ContestDetail/InContestScreen.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import styles from "./InContestScreen.module.css";

// Fix relative paths to components
import SubheaderToggles from "../InContest/SubheaderToggles/SubheaderToggles";
import StatCard from "../InContest/StatCard/StatCard";
import CurrentQuestionView from "../InContest/CurrentQuestionView/CurrentQuestionView";
import QuestionsList from "../InContest/QuestionList/QuestionList"; // Fixed: QuestionList -> QuestionsList
import QuestionModal from "../InContest/QuestionModal/QuestionModal";

// Fix supabase import path
import { supabase } from "../../../supabase";

function InContestScreen() {
  const { id: contestId } = useParams();
  const navigate = useNavigate(); // Add this near other hooks

  // Contest data
  const [contest, setContest] = useState(null);
  const [loadingContest, setLoadingContest] = useState(true);
  const [error, setError] = useState(null);

  // Toggles
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  // Round
  const [currentRound, setCurrentRound] = useState(0);

  // Participants count (only active participants)
  const [activeParticipants, setActiveParticipants] = useState(0);

  // State for question modal (open/close) + "editing question" data
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null); // or null if "new question"

  // We'll fetch the "questions" in a separate state
  const [questions, setQuestions] = useState([]);

  // 1) Fetch the contest and participants on mount
  useEffect(() => {
    async function fetchContestData() {
      try {
        // fetch the contest
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
        console.error("Error fetching contest data:", err);
        setError(err.message);
      } finally {
        setLoadingContest(false);
      }
    }
    fetchContestData();
  }, [contestId]);

  // Add real-time listener for contest updates
  useEffect(() => {
    if (!contestId) return;

    const channel = supabase
      .channel(`contest-updates-${contestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contests",
          filter: `id=eq.${contestId}`,
        },
        (payload) => {
          const updatedContest = payload.new;
          setContest(updatedContest);
          setLobbyOpen(updatedContest.lobby_open);
          setSubmissionOpen(updatedContest.submission_open);
          setFinished(updatedContest.finished);
          setCurrentRound(updatedContest.current_round || 0);
        }
      )
      .subscribe();

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
  async function incrementRound(delta) {
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
  function openEditQuestionModal(q) {
    setQuestionToEdit(q);
    setShowQuestionModal(true);
  }
  function closeQuestionModal() {
    setShowQuestionModal(false);
    setQuestionToEdit(null);
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
      setQuestions(qData || []);
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
          <StatCard
            value={currentRound}
            label="ROUND"
          />
          <div className={styles.leftColumnSpacer}></div>
          <button 
            className={styles.backLink}
            onClick={() => navigate('/admin')}
          >
            ← Back to Contests
          </button>
        </div>

        {/* Center area: Current question view */}
        <div className={styles.centerColumn}>
          <CurrentQuestionView
            contest={contest}
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
    </div>
  );
}

export default InContestScreen;
