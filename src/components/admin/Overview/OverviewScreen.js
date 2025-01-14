// src/components/admin/Overview/OverviewScreen.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase"; // Adjust to your actual path
import styles from "./OverviewScreen.module.css";

// Import the new CreateContestModal
import CreateContestModal from "../CreateContestModal/CreateContestModal";

function OverviewScreen() {
  const navigate = useNavigate();

  // We’ll store all contests in `contests`. We'll only load last 20 from DB.
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab logic
  const TABS = ["All", "Upcoming", "Past", "Active"];
  const [activeTab, setActiveTab] = useState("All");

  // For participant counts
  const [countsMap, setCountsMap] = useState({}); // { [contestId]: number }

  // Show/hide our "Create Contest" modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 1) Fetch contests on mount
  useEffect(() => {
    async function fetchContests() {
      try {
        // Query last 20 contests, ordered by created_at desc
        const { data, error } = await supabase
          .from("contests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        setContests(data || []);
        setFilteredContests(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, []);

  // 2) Filter based on the active tab
  useEffect(() => {
    if (!contests.length) return;

    const now = new Date();
    let filtered = contests;

    if (activeTab === "Upcoming") {
      // start_time > now AND not finished
      filtered = contests.filter((c) => {
        const start = new Date(c.start_time);
        return start > now && !c.finished;
      });
    } else if (activeTab === "Past") {
      // finished === true (or you can do start_time < now)
      filtered = contests.filter((c) => c.finished);
    } else if (activeTab === "Active") {
      // lobby_open = true OR submission_open = true
      filtered = contests.filter((c) => c.lobby_open || c.submission_open);
    }
    // If "All," keep the full list

    setFilteredContests(filtered);
  }, [activeTab, contests]);

  // 3) Delete a contest
  async function handleDeleteContest(contestId) {
    const confirmed = window.confirm("Are you sure you want to delete this contest?");
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from("contests")
        .delete()
        .eq("id", contestId);
      if (error) throw error;

      // Remove from local state
      setContests((prev) => prev.filter((c) => c.id !== contestId));
    } catch (err) {
      alert("Error deleting contest: " + err.message);
    }
  }

  // 4) Navigate on card click
  function handleCardClick(contestId) {
    navigate(`/admin/${contestId}`);
  }

  // 5) Participant counts
  async function getParticipantCount(contestId) {
    const { count, error } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("contest_id", contestId);

    if (error) {
      console.error("Error fetching participant count:", error);
      return 0;
    }
    return count || 0;
  }

  useEffect(() => {
    async function fetchAllCounts() {
      const map = {};
      for (let c of contests) {
        const count = await getParticipantCount(c.id);
        map[c.id] = count;
      }
      setCountsMap(map);
    }
    if (contests.length) {
      fetchAllCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contests]);

  // 6) Format date
  function formatStartTime(timeString) {
    if (!timeString) return "No time";
    const date = new Date(timeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // 7) After creating a new contest in the modal, we refresh this list
  async function handleContestCreated() {
    try {
      const { data, error } = await supabase
        .from("contests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setContests(data || []);
      setFilteredContests(data || []);
    } catch (err) {
      console.error("Error refreshing contests after creation:", err);
    }
  }

  // 8) Show/hide the create modal
  function openCreateModal() {
    setShowCreateModal(true);
  }
  function closeCreateModal() {
    setShowCreateModal(false);
  }

  if (loading) {
    return <div className={styles.loading}>Loading contests...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.overviewWrapper}>
      {/* Header Row */}
      <header className={styles.header}>
        <div className={styles.left}>SBHQ</div>
        <div className={styles.center}>All Contests</div>
        <div className={styles.right}>Admin</div>
      </header>

      {/* Tabs Row */}
      <div className={styles.tabsRow}>
        {TABS.map((tab) => (
          <div
            key={tab}
            className={tab === activeTab ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* 3-column Grid */}
      <div className={styles.grid}>
        {filteredContests.map((c) => {
          const participantCount = countsMap[c.id] || 0;
          const dateFormatted = formatStartTime(c.start_time);

          return (
            <div
              key={c.id}
              className={styles.card}
              onClick={() => handleCardClick(c.id)}
            >
              {/* Date at top-left */}
              <div className={styles.dateBadge}>{dateFormatted}</div>

              {/* Contest Name */}
              <h3 className={styles.cardTitle}>{c.name}</h3>

              {/* Participant count */}
              <p className={styles.cardInfo}>{participantCount} Registered</p>

              {/* Booleans */}
              <div className={styles.booleansWrapper}>
                <div>Lobby: {c.lobby_open ? "Open" : "Closed"}</div>
                <div>Submissions: {c.submission_open ? "Open" : "Closed"}</div>
                <div>Finished: {c.finished ? "Yes" : "No"}</div>
              </div>

              {/* Delete button on hover (bottom-right) */}
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click
                  handleDeleteContest(c.id);
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button => open modal */}
      <button className={styles.fab} onClick={openCreateModal}>
        +
      </button>

      {/* Conditionally render the "Create Contest" modal */}
      {showCreateModal && (
        <CreateContestModal
          onClose={closeCreateModal}
          onCreated={handleContestCreated}
        />
      )}
    </div>
  );
}

export default OverviewScreen;
