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
    price: '', // Added price field
    currentRound: 1,
    lobbyOpen: false,
    finished: false,
  });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContestData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateContest = () => {
    const db = getDatabase();
    const contestsRef = ref(db, 'contests');
    const newContestRef = push(contestsRef);
    const newContest = {
      ...contestData,
      currentRound: 1,
      lobbyOpen: false,
      finished: false,
    };
    update(newContestRef, newContest);
    setContestData({
      name: '',
      date: '',
      price: '', // Clear price field
      currentRound: 1,
      lobbyOpen: false,
      finished: false,
    });
  };

  const handleEditContest = (contestId) => {
    const contestToEdit = contests.find((contest) => contest.id === contestId);
    setSelectedContestId(contestId);
    setContestData({ ...contestToEdit });
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    const db = getDatabase();
    const contestRef = ref(db, `contests/${selectedContestId}`);
    update(contestRef, contestData)
      .then(() => {
        console.log('Contest updated successfully!');
        setIsEditing(false);
        setContestData({
          name: '',
          date: '',
          price: '', // Clear price field
          currentRound: 1,
          lobbyOpen: false,
          finished: false,
        });
        setSelectedContestId(null);
      })
      .catch((error) => {
        console.error('Error updating contest:', error);
      });
  };

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
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Contest Title:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Contest Title"
            value={contestData.name}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.label}>
            Date and Time:
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={contestData.date}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price" className={styles.label}>
            Price:
          </label>
          <input
            type="text"
            id="price"
            name="price"
            placeholder="Enter contest price"
            value={contestData.price}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>

        {/* Show these fields only when editing a contest */}
        {isEditing && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="lobbyOpen" className={styles.label}>
                <input
                  type="checkbox"
                  id="lobbyOpen"
                  name="lobbyOpen"
                  checked={contestData.lobbyOpen}
                  onChange={handleInputChange}
                />
                Lobby Open
              </label>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="finished" className={styles.label}>
                <input
                  type="checkbox"
                  id="finished"
                  name="finished"
                  checked={contestData.finished}
                  onChange={handleInputChange}
                />
                Finished
              </label>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="currentRound" className={styles.label}>
                Current Round:
              </label>
              <input
                type="number"
                id="currentRound"
                name="currentRound"
                value={contestData.currentRound}
                onChange={handleInputChange}
                className={styles.input}
                min="1"
              />
            </div>
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
            <th>Price</th> {/* Added Price column */}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((contest) => (
            <tr key={contest.id}>
              <td>{contest.name}</td>
              <td>{contest.date}</td>
              <td>{contest.price}</td> {/* Display the contest price */}
              <td>
                {contest.finished
                  ? 'Completed'
                  : contest.lobbyOpen
                  ? 'Active'
                  : 'Scheduled'}
              </td>
              <td>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEditContest(contest.id)}
                >
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