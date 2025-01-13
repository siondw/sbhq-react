// src/components/ParticipantManagement/ParticipantManagement.js
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase"; // Your Supabase client
import styles from "./ParticipantManagement.module.css";

const PARTICIPANTS_PER_PAGE = 10;

const ParticipantManagement = () => {
  const [participants, setParticipants] = useState([]);
  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // We'll track the "last username" for pagination
  const [lastUsername, setLastUsername] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 1) On mount, fetch all contests from Supabase
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) throw error;
        setContests(data || []);

        // Restore selected contest from localStorage if possible
        const storedContestId = localStorage.getItem("selectedContestId");
        const storedLastUsername = localStorage.getItem("lastUsername");

        if (storedContestId && data?.some((c) => c.id === storedContestId)) {
          setSelectedContestId(storedContestId);
          setLastUsername(storedLastUsername);
        } else if (data && data.length > 0) {
          // Default to the first contest if none stored
          setSelectedContestId(data[0].id);
          setLastUsername(null);
          localStorage.setItem("selectedContestId", data[0].id);
          localStorage.removeItem("lastUsername");
        }
      } catch (err) {
        console.error("Error fetching contests:", err);
      }
    };
    fetchContests();
  }, []);

  // 2) Whenever selectedContestId changes, reset participants and fetch fresh
  useEffect(() => {
    if (!selectedContestId) {
      setParticipants([]);
      return;
    }

    // Reset local state
    setParticipants([]);
    setHasMore(true);
    setIsLoading(false);

    // Try to restore lastUsername from localStorage
    const storedLastUsername = localStorage.getItem("lastUsername");
    setLastUsername(storedLastUsername || null);

    // Immediately fetch participants from the beginning
    fetchParticipants(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContestId]);

  // 3) Keyset-based pagination: fetch participants from Supabase
  // If startUsername is null, fetch from the beginning
  // Otherwise, do `username >= startUsername`
  const fetchParticipants = async (startUsername = null, isLoadMore = true) => {
    if (!selectedContestId) return;
    if (!hasMore && isLoadMore) return; // No more to load
    if (isLoading) return; // Already loading

    setIsLoading(true);

    try {
      let queryBuilder = supabase
        .from("participants")
        .select("*")
        .eq("contest_id", selectedContestId)
        .order("username", { ascending: true })
        .limit(PARTICIPANTS_PER_PAGE + 1);

      if (startUsername) {
        // If we have a last username, we only want rows where username > lastUsername
        // or >=, depending on how you want to handle duplicates
        queryBuilder = queryBuilder.gte("username", startUsername);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      if (!data) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      let newData = data;
      // If `startUsername` is not null, it means a "Load More" call
      // But we must skip the first item if it exactly matches the lastUsername
      // Or if you want inclusive logic, adapt as needed
      if (startUsername) {
        // Filter out duplicates (where username is exactly the last username)
        newData = data.filter((p) => p.username !== startUsername);
      }

      // If we got fewer than (PARTICIPANTS_PER_PAGE + 1) items after filtering,
      // that means we have no more pages
      if (newData.length <= PARTICIPANTS_PER_PAGE) {
        setHasMore(false);
      }

      // If we do have an extra item, that item is the first of the "next" page
      let lastParticipantUsername = null;
      if (newData.length > PARTICIPANTS_PER_PAGE) {
        const extra = newData[PARTICIPANTS_PER_PAGE];
        lastParticipantUsername = extra.username;
        // Limit to first N
        newData = newData.slice(0, PARTICIPANTS_PER_PAGE);
      }

      // Merge with existing participants
      setParticipants((prev) => [...prev, ...newData]);

      // Update lastUsername
      if (lastParticipantUsername) {
        setLastUsername(lastParticipantUsername);
        localStorage.setItem("lastUsername", lastParticipantUsername);
      } else if (newData.length > 0) {
        // If we exactly matched the page size but no extra, we might store the last item’s username
        const lastItem = newData[newData.length - 1];
        setLastUsername(lastItem.username);
        localStorage.setItem("lastUsername", lastItem.username);
      } else {
        // No data at all
        setLastUsername(null);
        localStorage.removeItem("lastUsername");
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    }

    setIsLoading(false);
  };

  // 4) Toggle participant's active status
  const toggleStatus = async (participantId) => {
    try {
      const participant = participants.find((p) => p.id === participantId);
      if (!participant) {
        alert("Participant not found.");
        return;
      }
      const currentStatus = participant.active;

      const { error } = await supabase
        .from("participants")
        .update({ active: !currentStatus })
        .eq("id", participantId);

      if (error) throw error;

      // Update local state
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, active: !currentStatus } : p
        )
      );
    } catch (error) {
      console.error("Error toggling participant status:", error);
      alert("Failed to update participant status. Please try again.");
    }
  };

  // 5) Dropdown logic
  const handleContestChange = (contestId) => {
    setSelectedContestId(contestId);
    setDropdownOpen(false);
    localStorage.setItem("selectedContestId", contestId);
    localStorage.removeItem("lastUsername");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // 6) Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className={styles.container}>
      {/* Contest Selection with Dropdown */}
      <div
        className={styles.contestHeader}
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        <h2 className={styles.heading}>
          {selectedContestId
            ? contests.find((c) => c.id === selectedContestId)?.name || "Contest"
            : "Select a Contest"}
          <span
            className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ""}`}
          >
            ▼
          </span>
        </h2>
        {dropdownOpen && (
          <ul className={styles.dropdownList}>
            {contests.length > 0 ? (
              contests.map((contest) => (
                <li
                  key={contest.id}
                  className={`${styles.dropdownItem} ${
                    selectedContestId === contest.id ? styles.selected : ""
                  }`}
                  onClick={() => handleContestChange(contest.id)}
                >
                  {contest.name}
                </li>
              ))
            ) : (
              <li className={styles.dropdownItem}>No Contests Available</li>
            )}
          </ul>
        )}
      </div>

      {/* Table of Participants */}
      {selectedContestId && (
        <div className={styles.tableContainer}>
          {participants.length > 0 ? (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td>{participant.username}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            participant.active ? styles.active : styles.inactive
                          }`}
                        >
                          {participant.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.toggleButton}
                          onClick={() => toggleStatus(participant.id)}
                        >
                          {participant.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination: "Load More" button */}
              {isLoading && <p>Loading...</p>}
              {!isLoading && hasMore && (
                <button
                  onClick={() => fetchParticipants(lastUsername, true)}
                  className={styles.loadMoreButton}
                >
                  Load More
                </button>
              )}
              {!hasMore && !isLoading && <p>No more participants to display.</p>}
            </>
          ) : (
            <p className={styles.noParticipants}>
              No participants found for this contest.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantManagement;
