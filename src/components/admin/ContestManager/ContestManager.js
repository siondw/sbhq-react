import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, push } from 'firebase/database';
import styles from './ContestManager.module.css';

const ContestManager = () => {
  const [contests, setContests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedContestId, setSelectedContestId] = useState(null);
  const [contestData, setContestData] = useState({
    name: '',
    date: '',
    currentRound: 1,
    lobbyOpen: false,
    finished: false,
  });

  // Fetch contests from the database
  useEffect(() => {
    const db = getDatabase();
    const contestsRef = ref(db, 'contests');
    onValue(contestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contestsArray = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));
        setContests(contestsArray);
      }
    });
  }, []);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContestData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle creating a new contest
  const handleCreateContest = () => {
    const db = getDatabase();
    const contestsRef = ref(db, 'contests');
    const newContestRef = push(contestsRef);
    const newContest = { ...contestData, currentRound: 1, lobbyOpen: false, finished: false };
    update(newContestRef, newContest);
    setContestData({ name: '', date: '', currentRound: 1, lobbyOpen: false, finished: false });
  };

  // Handle editing an existing contest
  const handleEditContest = (contestId) => {
    const contestToEdit = contests.find((contest) => contest.id === contestId);
    setSelectedContestId(contestId);
    setContestData({ ...contestToEdit });
    setIsEditing(true);
  };

  // Handle saving changes to an existing contest
  const handleSaveChanges = () => {
    const db = getDatabase();
    const contestRef = ref(db, `contests/${selectedContestId}`);
    update(contestRef, contestData)
      .then(() => {
        console.log('Contest updated successfully!');
        setIsEditing(false);
        setContestData({ name: '', date: '', currentRound: 1, lobbyOpen: false, finished: false });
        setSelectedContestId(null);
      })
      .catch((error) => {
        console.error('Error updating contest:', error);
      });
  };

  // Handle form submission (either create or save changes)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleSaveChanges();
    } else {
      handleCreateContest();
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Contest Management</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Contest Title"
          value={contestData.name}
          onChange={handleInputChange}
          className={styles.input}
          required
        />
        <input
          type="datetime-local"
          name="date"
          value={contestData.date}
          onChange={handleInputChange}
          className={styles.input}
          required
        />
        
        {/* Show these fields only when editing a contest */}
        {isEditing && (
          <>
            <label className={styles.label}>
              <input
                type="checkbox"
                name="lobbyOpen"
                checked={contestData.lobbyOpen}
                onChange={handleInputChange}
              />
              Lobby Open
            </label>
            <label className={styles.label}>
              <input
                type="checkbox"
                name="finished"
                checked={contestData.finished}
                onChange={handleInputChange}
              />
              Finished
            </label>
            <label className={styles.label}>
              Current Round:
              <input
                type="number"
                name="currentRound"
                value={contestData.currentRound}
                onChange={handleInputChange}
                className={styles.input}
                min="1"
              />
            </label>
          </>
        )}

        <button type="submit" className={styles.createButton}>
          {isEditing ? 'Save Changes' : 'Create New Contest'}
        </button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((contest) => (
            <tr key={contest.id}>
              <td>{contest.name}</td>
              <td>{contest.date}</td>
              <td>{contest.finished ? 'Completed' : contest.lobbyOpen ? 'Active' : 'Scheduled'}</td>
              <td>
                <button className={styles.actionButton} onClick={() => handleEditContest(contest.id)}>
                  Edit
                </button>
                <button className={styles.actionButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContestManager;
