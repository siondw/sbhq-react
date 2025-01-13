// src/components/SubmissionManagement/SubmissionManagement.js
import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./SubmissionManagement.module.css";

const ITEMS_PER_PAGE = 10;

const SubmissionManagement = () => {
  const { user, loading: authLoading } = useAuth();

  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState("");

  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");

  const [submissions, setSubmissions] = useState([]); // array of { participant_id, answer, timestamp }
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 1) Fetch all contests
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data, error } = await supabase.from("contests").select("id, name");
        if (error) throw error;
        setContests(data || []);
      } catch (err) {
        console.error("Error fetching contests:", err);
      }
    };
    fetchContests();
  }, []);

  // 2) Whenever selectedContestId changes, fetch all distinct rounds from questions
  useEffect(() => {
    const fetchRounds = async () => {
      if (!selectedContestId) {
        setRounds([]);
        setSelectedRound(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("round")
          .eq("contest_id", selectedContestId);
        if (error) throw error;
        const distinctRounds = new Set((data || []).map((q) => q.round));
        const sorted = Array.from(distinctRounds).sort((a, b) => a - b);
        setRounds(sorted);
        // if you want to auto-pick the first round
        if (sorted.length > 0) {
          setSelectedRound(sorted[0]);
        }
      } catch (err) {
        console.error("Error fetching rounds:", err);
      }
    };
    fetchRounds();
  }, [selectedContestId]);

  // 3) Whenever selectedContestId or selectedRound changes, fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedContestId || !selectedRound) {
        setQuestions([]);
        setSelectedQuestionId("");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("id, text, round")
          .eq("contest_id", selectedContestId)
          .eq("round", selectedRound);
        if (error) throw error;
        setQuestions(data || []);
        // optionally pick the first question
        if (data && data.length > 0) {
          setSelectedQuestionId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, [selectedContestId, selectedRound]);

  // 4) Whenever selectedQuestionId changes, fetch answers from the "answers" table
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedQuestionId) {
        setSubmissions([]);
        return;
      }
      setIsLoading(true);
      try {
        // We assume "answers" table has columns: participant_id, answer, timestamp
        // If you store them differently, adapt the query
        const { data, error } = await supabase
          .from("answers")
          .select("participant_id, answer, timestamp")
          .eq("question_id", selectedQuestionId);
        if (error) throw error;
        setSubmissions(data || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, [selectedQuestionId]);

  // 5) Pagination logic
  const totalSubmissions = submissions.length;
  const totalPages = Math.ceil(totalSubmissions / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubmissions = submissions.slice(startIndex, endIndex);

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  // 6) Optionally fetch participant’s user info from your "profiles" or "users" table
  // For now, let’s do it inline, or you can create a separate component

  const [usersCache, setUsersCache] = useState({}); // { participant_id: { username, ... } }

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (paginatedSubmissions.length === 0) return;
      // Get unique participant_ids
      const uniqueIds = [...new Set(paginatedSubmissions.map((sub) => sub.participant_id))];

      // If you have a "participants" table that references user_id, you might do a join
      // For simplicity, let's assume we have a "profiles" table with primary key = participant_id
      // Or you might do a second step: get participant->userId, then user info from "users"

      // Example direct approach:
      const { data, error } = await supabase
        .from("participants")
        .select("id, user_id") // or username if you store it here
        .in("id", uniqueIds);

      if (error || !data) {
        console.error("Error fetching participant -> user_id:", error);
        return;
      }

      // Now fetch from "users" or "profiles" if you need the username
      // E.g., if you store the username in "profiles" keyed by "id" = user_id
      const userIds = data.map((p) => p.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      if (profileError || !profiles) {
        console.error("Error fetching profiles:", profileError);
        return;
      }

      // Build a quick map of participant_id -> username
      const newCache = {};
      data.forEach((part) => {
        const matchingProfile = profiles.find((pr) => pr.id === part.user_id);
        newCache[part.id] = {
          username: matchingProfile ? matchingProfile.username : "Unknown",
        };
      });
      setUsersCache(newCache);
    };

    fetchAllUsers();
  }, [paginatedSubmissions]);

  if (authLoading) {
    return <div className={styles.loading}>Loading user information...</div>;
  }

  if (!user) {
    return <div className={styles.error}>You must be logged in to view submissions.</div>;
  }

  return (
    <div className={styles.submissionManagement}>
      <h1 className={styles.title}>Submission Management</h1>

      {/* Contest Selection */}
      <div className={styles.selection}>
        <label className={styles.label}>Select Contest:</label>
        <select
          value={selectedContestId}
          onChange={(e) => {
            setSelectedContestId(e.target.value);
            setSelectedRound(null);
            setSelectedQuestionId("");
            setSubmissions([]);
            setCurrentPage(1);
          }}
          className={styles.select}
        >
          <option value="">-- Choose a contest --</option>
          {contests.map((contest) => (
            <option key={contest.id} value={contest.id}>
              {contest.name}
            </option>
          ))}
        </select>
      </div>

      {/* Round Selection */}
      {rounds.length > 0 && (
        <div className={styles.selection}>
          <label className={styles.label}>Select Round:</label>
          <select
            value={selectedRound || ""}
            onChange={(e) => {
              const r = parseInt(e.target.value, 10);
              setSelectedRound(r);
              setSelectedQuestionId("");
              setSubmissions([]);
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            {rounds.map((r) => (
              <option key={r} value={r}>
                Round {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Question Selection */}
      {questions.length > 0 && (
        <div className={styles.selection}>
          <label className={styles.label}>Select Question:</label>
          <select
            value={selectedQuestionId}
            onChange={(e) => {
              setSelectedQuestionId(e.target.value);
              setSubmissions([]);
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.text}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submissions Table */}
      {selectedQuestionId && (
        <div className={styles.submissionsSection}>
          <h2 className={styles.submissionsTitle}>User Submissions</h2>
          {isLoading ? (
            <div className={styles.loading}>Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className={styles.noSubmissions}>No submissions found for this question.</div>
          ) : (
            <div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Answer</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubmissions.map((sub, idx) => {
                    const userInfo = usersCache[sub.participant_id];
                    const username = userInfo ? userInfo.username : "Loading...";
                    return (
                      <tr key={idx}>
                        <td>{username}</td>
                        <td>{sub.answer || "No answer"}</td>
                        <td>{new Date(sub.timestamp).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage <= 1}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage >= totalPages}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubmissionManagement;
