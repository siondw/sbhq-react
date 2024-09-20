// SubmissionManagement.js
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, off } from "firebase/database";
import styles from "./SubmissionManagement.module.css";
import { useAuth } from "../../../contexts/AuthContext"; // Adjust the path as necessary

const ITEMS_PER_PAGE = 10; // Number of submissions per page

const SubmissionManagement = () => {
  const { user, loading: authLoading } = useAuth(); // Get authenticated user
  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [submissions, setSubmissions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const storedContestId = localStorage.getItem("selectedContestId");
    const storedRound = localStorage.getItem("selectedRound");
    const storedQuestionId = localStorage.getItem("selectedQuestionId");
    const storedPage = localStorage.getItem("currentPage");

    if (storedContestId) setSelectedContestId(storedContestId);
    if (storedRound) setSelectedRound(storedRound);
    if (storedQuestionId) setSelectedQuestionId(storedQuestionId);
    if (storedPage) setCurrentPage(parseInt(storedPage, 10));
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("selectedContestId", selectedContestId);
    localStorage.setItem("selectedRound", selectedRound);
    localStorage.setItem("selectedQuestionId", selectedQuestionId);
    localStorage.setItem("currentPage", currentPage);
  }, [selectedContestId, selectedRound, selectedQuestionId, currentPage]);

  // Fetch all contests
  useEffect(() => {
    const db = getDatabase();
    const contestsRef = ref(db, "contests");

    const handleContests = (snapshot) => {
      const data = snapshot.val() || {};
      const contestsList = Object.values(data);
      setContests(contestsList);

      // If no contest is selected, select the first one
      if (contestsList.length > 0 && !selectedContestId) {
        setSelectedContestId(contestsList[0].id);
      }
    };

    onValue(contestsRef, handleContests);

    return () => {
      off(contestsRef, "value", handleContests);
    };
  }, [selectedContestId]);

  // Fetch rounds based on selected contest
  useEffect(() => {
    if (!selectedContestId) {
      setRounds([]);
      setSelectedRound("");
      return;
    }

    const db = getDatabase();
    const questionsRef = ref(db, `questions/${selectedContestId}`);

    const handleQuestions = (snapshot) => {
      const data = snapshot.val() || {};
      const uniqueRounds = new Set();

      Object.values(data).forEach((question) => {
        if (question.round) uniqueRounds.add(question.round);
      });

      const roundsList = Array.from(uniqueRounds).sort((a, b) => a - b);
      setRounds(roundsList);

      // If no round is selected, select the first one
      if (roundsList.length > 0 && !selectedRound) {
        setSelectedRound(roundsList[0]);
      }
    };

    onValue(questionsRef, handleQuestions);

    return () => {
      off(questionsRef, "value", handleQuestions);
    };
  }, [selectedContestId, selectedRound]);

  // Fetch questions based on selected contest and round
  useEffect(() => {
    if (!selectedContestId || !selectedRound) {
      setQuestions([]);
      setSelectedQuestionId("");
      return;
    }

    const db = getDatabase();
    const questionsRef = ref(db, `questions/${selectedContestId}`);

    const handleQuestions = (snapshot) => {
      const data = snapshot.val() || {};
      const filteredQuestions = Object.entries(data)
        .filter(([id, question]) => question.round === selectedRound)
        .map(([id, question]) => ({
          id,
          text: question.text,
          options: question.options,
        }));

      setQuestions(filteredQuestions);

      // If no question is selected, select the first one
      if (filteredQuestions.length > 0 && !selectedQuestionId) {
        setSelectedQuestionId(filteredQuestions[0].id);
      }
    };

    onValue(questionsRef, handleQuestions);

    return () => {
      off(questionsRef, "value", handleQuestions);
    };
  }, [selectedContestId, selectedRound, selectedQuestionId]);

  // Fetch submissions based on selected contest and question
  useEffect(() => {
    if (!selectedContestId || !selectedQuestionId) {
      setSubmissions({});
      return;
    }

    const db = getDatabase();
    const submissionsRef = ref(
      db,
      `submissions/${selectedContestId}/${selectedQuestionId}`
    );

    const handleSubmissions = (snapshot) => {
      const data = snapshot.val() || {};
      setSubmissions(data);
      setCurrentPage(1); // Reset to first page when submissions change
    };

    setIsLoading(true);
    onValue(submissionsRef, handleSubmissions, (error) => {
      console.error("Error fetching submissions:", error);
      setIsLoading(false);
    });

    // Assuming data is fetched instantly; set isLoading to false
    // Alternatively, use 'once' instead of 'on' if you don't need real-time updates
    setIsLoading(false);

    return () => {
      off(submissionsRef, "value", handleSubmissions);
    };
  }, [selectedContestId, selectedQuestionId]);

  // Pagination Logic
  const totalSubmissions = Object.keys(submissions).length;
  const totalPages = Math.ceil(totalSubmissions / ITEMS_PER_PAGE);
  const paginatedSubmissions = Object.entries(submissions)
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Render Loading State
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
        <label htmlFor="contestSelect" className={styles.label}>Select Contest:</label>
        <select
          id="contestSelect"
          value={selectedContestId}
          onChange={(e) => setSelectedContestId(e.target.value)}
          className={styles.select}
        >
          {contests.length > 0 ? (
            contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))
          ) : (
            <option disabled>No Contests Available</option>
          )}
        </select>
      </div>

      {/* Round Selection */}
      {rounds.length > 0 && (
        <div className={styles.selection}>
          <label htmlFor="roundSelect" className={styles.label}>Select Round:</label>
          <select
            id="roundSelect"
            value={selectedRound}
            onChange={(e) => setSelectedRound(parseInt(e.target.value, 10))}
            className={styles.select}
          >
            {rounds.map((round) => (
              <option key={round} value={round}>
                Round {round}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Question Selection */}
      {questions.length > 0 && (
        <div className={styles.selection}>
          <label htmlFor="questionSelect" className={styles.label}>Select Question:</label>
          <select
            id="questionSelect"
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className={styles.select}
          >
            {questions.map((question) => (
              <option key={question.id} value={question.id}>
                {question.text}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submissions Display */}
      {selectedQuestionId && (
        <div className={styles.submissionsSection}>
          <h2 className={styles.submissionsTitle}>User Submissions</h2>
          {isLoading ? (
            <div className={styles.loading}>Loading submissions...</div>
          ) : totalSubmissions > 0 ? (
            <div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Answer</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubmissions.map(([userId, submission]) => (
                    <tr key={userId}>
                      <td>{/* Fetch username from users node */}
                        <UserName userId={userId} />
                      </td>
                      <td>{submission.answer}</td>
                      <td>{new Date(submission.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 1}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === totalPages}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noSubmissions}>No submissions found for this question.</div>
          )}
        </div>
      )}
    </div>
  );
};

// Component to fetch and display username based on userId
const UserName = ({ userId }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);

    const handleUser = (snapshot) => {
      const data = snapshot.val();
      if (data && data.username) {
        setUsername(data.username);
      } else {
        setUsername("Unknown User");
      }
    };

    onValue(userRef, handleUser, { onlyOnce: true });

    return () => {
      off(userRef, "value", handleUser);
    };
  }, [userId]);

  return <span>{username}</span>;
};

export default SubmissionManagement;
