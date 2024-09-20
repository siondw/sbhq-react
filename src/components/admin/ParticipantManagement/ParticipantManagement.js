import React, { useState, useEffect, useRef } from "react";
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  off, 
  query, 
  orderByChild, 
  startAt, 
  limitToFirst 
} from "firebase/database";
import styles from "./ParticipantManagement.module.css";

const PARTICIPANTS_PER_PAGE = 10;

const ParticipantManagement = () => {
  const [participants, setParticipants] = useState([]);
  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastUsername, setLastUsername] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Function to load state from localStorage
  const loadStateFromLocalStorage = () => {
    const storedContestId = localStorage.getItem("selectedContestId");
    const storedLastUsername = localStorage.getItem("lastUsername");
    return { storedContestId, storedLastUsername };
  };

  // Function to save state to localStorage
  const saveStateToLocalStorage = (contestId, lastUsername) => {
    if (contestId) {
      localStorage.setItem("selectedContestId", contestId);
    }
    if (lastUsername) {
      localStorage.setItem("lastUsername", lastUsername);
    }
  };

  useEffect(() => {
    const db = getDatabase();

    // Fetch contests from Firebase
    const contestsRef = ref(db, "contests");
    const handleContests = (snapshot) => {
      const contestsData = snapshot.val() || {};
      const contestsArray = Object.entries(contestsData).map(([id, data]) => ({
        id,
        ...data,
      }));
      setContests(contestsArray);

      // After fetching contests, set the selected contest
      const { storedContestId, storedLastUsername } = loadStateFromLocalStorage();

      if (storedContestId && contestsArray.some(contest => contest.id === storedContestId)) {
        setSelectedContestId(storedContestId);
        setLastUsername(storedLastUsername);
      } else if (contestsArray.length > 0) {
        setSelectedContestId(contestsArray[0].id);
        setLastUsername(null);
        saveStateToLocalStorage(contestsArray[0].id, null);
      } else {
        setSelectedContestId("");
        setLastUsername(null);
        localStorage.removeItem("selectedContestId");
        localStorage.removeItem("lastUsername");
      }
    };
    onValue(contestsRef, handleContests);

    // Cleanup listener on unmount
    return () => {
      off(contestsRef, "value", handleContests);
    };
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      // Reset participants and pagination state
      setParticipants([]);
      setLastUsername(null);
      setHasMore(true);

      // Fetch participants based on stored lastUsername
      const { storedLastUsername } = loadStateFromLocalStorage();
      if (storedLastUsername) {
        fetchParticipants(storedLastUsername, false);
      } else {
        fetchParticipants(null, false);
      }
    } else {
      setParticipants([]); // Clear participants if no contest is selected
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContestId]);

  const fetchParticipants = (startUsername = null, isLoadMore = true) => {
    if (!hasMore && isLoadMore) return;
    if (isLoading) return;

    setIsLoading(true);
    const db = getDatabase();
    const participantsRef = ref(db, `contests/${selectedContestId}/participants`);

    let participantsQuery;

    if (startUsername) {
      // Fetch next set starting after the last username
      participantsQuery = query(
        participantsRef,
        orderByChild("username"),
        startAt(startUsername),
        limitToFirst(PARTICIPANTS_PER_PAGE + 1) // Fetch one extra to check for more data
      );
    } else {
      // Fetch initial set
      participantsQuery = query(
        participantsRef,
        orderByChild("username"),
        limitToFirst(PARTICIPANTS_PER_PAGE + 1)
      );
    }

    onValue(participantsQuery, (snapshot) => {
      const participantsData = snapshot.val() || {};
      const participantsArray = Object.entries(participantsData).map(
        ([id, data]) => ({
          id,
          ...data,
        })
      );

      let newParticipants = [];
      if (startUsername) {
        // Remove the first participant as it was the last from previous fetch
        newParticipants = participantsArray.slice(1, PARTICIPANTS_PER_PAGE + 1);
      } else {
        newParticipants = participantsArray.slice(0, PARTICIPANTS_PER_PAGE);
      }

      if (participantsArray.length <= PARTICIPANTS_PER_PAGE) {
        setHasMore(false);
      }

      if (participantsArray.length > PARTICIPANTS_PER_PAGE) {
        const lastFetched = participantsArray[PARTICIPANTS_PER_PAGE];
        setLastUsername(lastFetched.username);
        saveStateToLocalStorage(selectedContestId, lastFetched.username);
      } else {
        setLastUsername(null);
        saveStateToLocalStorage(selectedContestId, null);
      }

      setParticipants((prev) => [...prev, ...newParticipants]);
      setIsLoading(false);
    }, {
      onlyOnce: true, // Fetch data once per request
    });

    // Cleanup the listener
    return () => {
      off(participantsRef, "value");
    };
  };

  const handleContestChange = (contestId) => {
    setSelectedContestId(contestId);
    setDropdownOpen(false);
    saveStateToLocalStorage(contestId, null);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleStatus = async (participantId) => {
    try {
      const db = getDatabase();
      const participantRef = ref(
        db,
        `contests/${selectedContestId}/participants/${participantId}/active`
      );
      const participant = participants.find((p) => p.id === participantId);
      if (!participant) {
        alert("Participant not found.");
        return;
      }
      const currentStatus = participant.active;
      await set(participantRef, !currentStatus); // Use 'set' instead of 'update'
  
      // Update participant status in the state
      setParticipants((prevParticipants) =>
        prevParticipants.map((p) =>
          p.id === participantId
            ? { ...p, active: !currentStatus }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling participant status:", error);
      alert("Failed to update participant status. Please try again.");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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
            className={`${styles.dropdownArrow} ${
              dropdownOpen ? styles.open : ""
            }`}
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

      {/* Table to display participants */}
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
              {isLoading && <p>Loading...</p>}
              {!isLoading && hasMore && (
                <button onClick={() => fetchParticipants(lastUsername)} className={styles.loadMoreButton}>
                  Load More
                </button>
              )}
              {!hasMore && <p>No more participants to display.</p>}
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
