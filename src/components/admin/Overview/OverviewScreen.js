import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase";
import styles from "./OverviewScreen.module.css";
import CreateContestModal from "../CreateContestModal/CreateContestModal";
import { formatInTimeZone } from "date-fns-tz";

function OverviewScreen() {
  const navigate = useNavigate();

  // State management
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countsMap, setCountsMap] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Tabs for filtering
  const TABS = ["All", "Upcoming", "Past", "Active"];
  const [activeTab, setActiveTab] = useState("All");

  // 1) Fetch contests on mount
  useEffect(() => {
    async function fetchContests() {
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, []);

  // 2) Filter contests based on active tab
  useEffect(() => {
    if (!contests.length) return;

    const now = new Date();
    let filtered = contests;

    if (activeTab === "Upcoming") {
      filtered = contests.filter((c) => {
        const startTime = new Date(c.start_time);
        return startTime > now && !c.finished;
      });
    } else if (activeTab === "Past") {
      filtered = contests.filter((c) => c.finished);
    } else if (activeTab === "Active") {
      filtered = contests.filter((c) => c.lobby_open || c.submission_open);
    }

    setFilteredContests(filtered);
  }, [activeTab, contests]);

  // 3) Delete a contest
  async function handleDeleteContest(contestId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contest?"
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("contests")
        .delete()
        .eq("id", contestId);

      if (error) throw error;

      setContests((prev) => prev.filter((c) => c.id !== contestId));
    } catch (err) {
      alert("Error deleting contest: " + err.message);
    }
  }

  // 4) Navigate to contest details
  function handleCardClick(contestId) {
    navigate(`/admin/${contestId}`);
  }

  // 5) Fetch participant counts
  async function getParticipantCount(contestId) {
    try {
      const { count, error } = await supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("contest_id", contestId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error fetching participant count:", error);
      return 0;
    }
  }

  useEffect(() => {
    async function fetchAllCounts() {
      const map = {};
      for (let contest of contests) {
        const count = await getParticipantCount(contest.id);
        map[contest.id] = count;
      }
      setCountsMap(map);
    }
    if (contests.length) fetchAllCounts();
  }, [contests]);

  // 6) Format start time
  function formatStartTime(timeString) {
    if (!timeString) return "No time";

    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return formatInTimeZone(new Date(timeString), userTimeZone, "MM/dd/yyyy h:mm a");
    } catch (error) {
      console.error("Error formatting date:", timeString, error);
      return "Invalid date";
    }
  }

  // 7) Refresh contests after creation
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

  // 8) Handle modal visibility
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
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.left}>SBHQ</div>
        <div className={styles.center}>All Contests</div>
        <div className={styles.right}>Admin</div>
      </header>

      {/* Tabs */}
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

      {/* Contest Grid */}
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
              <div className={styles.dateBadge}>{dateFormatted}</div>
              <h3 className={styles.cardTitle}>{c.name}</h3>
              <p className={styles.cardInfo}>{participantCount} Registered</p>
              <div className={styles.booleansWrapper}>
                <div>Lobby: {c.lobby_open ? "Open" : "Closed"}</div>
                <div>Submissions: {c.submission_open ? "Open" : "Closed"}</div>
                <div>Finished: {c.finished ? "Yes" : "No"}</div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContest(c.id);
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Contest Modal */}
      <button className={styles.fab} onClick={openCreateModal}>
        +
      </button>
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
