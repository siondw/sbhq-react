import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update, onValue } from "firebase/database";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import ContestCard from "../../components/ContestCard/ContestCard";
import styles from "./JoinContestsScreen.module.css";
import { useAuth } from "../../contexts/AuthContext";

function JoinContestsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contests, setContests] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      const db = getDatabase();
      const contestsRef = ref(db, "contests");
      const snapshot = await get(contestsRef);
      const contestsData = snapshot.val() || {};
      console.log("Fetched contests:", contestsData); // Log the raw data
      setContests(contestsData);
    };

    fetchContests();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    let intervalId;

    /**
     * Polls for open lobbies and navigates the user to the lobby if they are registered.
     *
     * This function listens for changes in the "contests" reference in the database.
     * If any contest has an open lobby and the user is registered in that contest,
     * it navigates the user to the lobby.
     *
     * @async
     * @function pollForOpenLobbies
     * @returns {Promise<void>} A promise that resolves when the function completes.
     * @throws Will throw an error if it fails to check for open lobbies.
     */
    const pollForOpenLobbies = async () => {
      try {
        const contestsRef = ref(db, "contests");
        onValue(contestsRef, (snapshot) => {
          const contests = snapshot.val();
          if (contests) {
            for (let contestId in contests) {
              const contest = contests[contestId];
              if (contest.lobbyOpen) {
                const isUserRegistered =
                  contest.participants &&
                  contest.participants.hasOwnProperty(user.uid);
                if (isUserRegistered) {
                  console.log("Navigating to lobby with contest:", contest); // Debugging statement
                  navigate("/lobby", { state: { contest } });
                  break;
                }
              }
            }
          }
        });
      } catch (error) {
        console.error("Failed to check for open lobbies:", error);
        setError("Failed to check for open lobbies. Please try again.");
      }
    };

    // Poll every 30 seconds (or any interval you prefer)
    intervalId = setInterval(pollForOpenLobbies, 30000);

    // Initial check when the component mounts
    pollForOpenLobbies();

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [user, navigate]);

  /**
   * Handles the process of joining a contest.
   *
   * @param {string} contestId - The unique identifier of the contest to join.
   * @returns {Promise<void>} - A promise that resolves when the contest is successfully joined. Also updates the state of the component
   */
  const handleJoinContest = async (contestId) => {
    try {
      const db = getDatabase();
      const contestRef = ref(
        db,
        `contests/${contestId}/participants/${user.uid}`
      );
      await update(contestRef, { username: user.displayName, active: true });

      // Trigger a re-render of the ContestCard
      setContests(prevContests => ({ 
        ...prevContests, 
        [contestId]: {
          ...prevContests[contestId],
          participants: {
            ...prevContests[contestId].participants,
            [user.uid]: { username: user.displayName, active: true }
          }
        }
      }));

    } catch (error) {
      console.error("Failed to join contest:", error);
      // Set a specific error message for joining contest 
      setError("Failed to join contest. Please try again later.");
    }
  };

  /**
   * Checks if the user is registered in the given contest.
   *
   * @param {Object} contest - The contest object.
   * @param {Object} contest.participants - The participants of the contest.
   * @param {string} user.uid - The unique identifier of the user.
   * @returns {boolean} - Returns true if the user is registered in the contest, otherwise false.
   */
  const isUserRegistered = (contest) => {
    return (
      contest.participants && contest.participants.hasOwnProperty(user.uid)
    );
  };

  return (
    <div className={styles.joinContestsScreen}>
      <div className={styles.pregameHeader}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <h1 className={styles.contestHeader}>Contests</h1>
        <div className={styles.contestList}>
          {Object.keys(contests).map((contestId) => {
            const contest = { id: contestId, ...contests[contestId] };
            console.log(`Contest ${contestId} startTime:`, contest.date); // Log each contest's startTime
            return (
              <ContestCard
                key={contestId}
                contest={contest}
                onJoin={handleJoinContest}
                isRegistered={isUserRegistered(contests[contestId])}
              />
            );
          })}
        </div>
      </div>
      {error && <p>{error}</p>}
    </div>
  );
}

export default JoinContestsScreen;
