import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'; // Using Heroicons
import styles from './SubmissionManagement.module.css';

const mockQuestions = [
  {
    id: 1,
    text: "What will be the result of the first drive?",
    options: ["Touchdown", "Field Goal", "Punt", "Turnover"],
    submissions: {
      Touchdown: ["JohnDoe123", "JaneSmith456"],
      "Field Goal": ["MikeTyson789"],
      Punt: [],
      Turnover: ["AnotherUser", "RandomUser", "ExtraUser"],
    },
  },
  {
    id: 2,
    text: "Which team will score first?",
    options: ["Home Team", "Away Team"],
    submissions: {
      "Home Team": ["JohnDoe123", "AnotherUser"],
      "Away Team": ["JaneSmith456", "MikeTyson789"],
    },
  },
];

const participantsCount = (submissions) => {
  return Object.values(submissions).reduce((total, list) => total + list.length, 0);
};

const SubmissionManagement = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const totalParticipants = participantsCount(currentQuestion.submissions);

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentPage(1); // Reset pagination on question change
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentPage(1); // Reset pagination on question change
    }
  };

  const handlePageChange = (option, newPage) => {
    setCurrentPage(newPage);
  };

  const getPercentage = (submissions) => {
    return ((submissions.length / totalParticipants) * 100).toFixed(1);
  };

  const getColor = (percentage) => {
    if (percentage >= 25) return '#2ecc71'; // Green
    if (percentage >= 10) return '#f1c40f'; // Yellow
    return '#e74c3c'; // Red
  };

  const paginatedParticipants = (participants) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return participants.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Submission Management</h2>

      {/* Navigation Arrows for Questions */}
      <div className={styles.questionNavigation}>
        <button
          className={styles.arrowButton}
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeftIcon className={`${styles.icon} ${styles.blueArrow}`} />
        </button>
        <span className={styles.questionText}>{currentQuestion.text}</span>
        <button
          className={styles.arrowButton}
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === mockQuestions.length - 1}
        >
          <ChevronRightIcon className={`${styles.icon} ${styles.blueArrow}`} />
        </button>
      </div>

      {/* Display answer options and user submissions in a 2x2 grid */}
      <div className={styles.grid}>
        {currentQuestion.options.map((option) => (
          <div key={option} className={styles.answer}>
            <div className={styles.answerHeader}>
              <span>{option}</span>
              <span
                style={{
                  color: getColor(getPercentage(currentQuestion.submissions[option])),
                }}
              >
                {getPercentage(currentQuestion.submissions[option])}%
              </span>
              <span>({currentQuestion.submissions[option].length} participants)</span>
            </div>
            <div className={styles.participantList}>
              {paginatedParticipants(currentQuestion.submissions[option]).map((username, index) => (
                <span key={index} className={styles.participant}>
                  {username}
                </span>
              ))}
              {currentQuestion.submissions[option].length > itemsPerPage && (
                <div className={styles.pagination}>
                  <button
                    onClick={() =>
                      handlePageChange(
                        option,
                        Math.max(1, currentPage - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                  >
                    &lt;
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(
                        option,
                        Math.min(
                          Math.ceil(
                            currentQuestion.submissions[option].length /
                              itemsPerPage
                          ),
                          currentPage + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(
                        currentQuestion.submissions[option].length /
                          itemsPerPage
                      )
                    }
                    className={styles.pageButton}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionManagement;
