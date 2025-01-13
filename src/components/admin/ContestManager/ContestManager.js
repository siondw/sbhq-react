// src/components/ContestManager/ContestManager.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase'; // your Supabase client
import styles from './ContestManager.module.css';

const ContestManager = () => {
  const [contests, setContests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedContestId, setSelectedContestId] = useState(null);

  // Our local form data
  const [contestData, setContestData] = useState({
    name: '',
    date: '',
    price: '',
    current_round: 1,
    lobby_open: false,
    finished: false,
  });

  // 1) On mount, fetch all contests
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('*');

        if (error) throw error;
        if (data) {
          setContests(data);
        }
      } catch (err) {
        console.error("Error fetching contests:", err);
      }
    };

    fetchContests();
  }, []);

  // 2) Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContestData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 3) Create a new contest
  const handleCreateContest = async () => {
    try {
      const newContest = {
        ...contestData,
        current_round: 1,
        lobby_open: false,
        finished: false,
      };

      const { error } = await supabase
        .from('contests')
        .insert(newContest);

      if (error) throw error;

      // Refresh the list
      const { data: refreshedData } = await supabase
        .from('contests')
        .select('*');

      setContests(refreshedData || []);
      // Reset form
      setContestData({
        name: '',
        date: '',
        price: '',
        current_round: 1,
        lobby_open: false,
        finished: false,
      });
    } catch (err) {
      console.error("Error creating contest:", err);
    }
  };

  // 4) Click “Edit” - load existing data into the form
  const handleEditContest = (contestId) => {
    const contestToEdit = contests.find((c) => c.id === contestId);
    if (!contestToEdit) return;

    setSelectedContestId(contestId);

    // Ensure our local state matches the DB column names
    setContestData({
      name: contestToEdit.name || '',
      date: contestToEdit.date || '',
      price: contestToEdit.price || '',
      current_round: contestToEdit.current_round || 1,
      lobby_open: contestToEdit.lobby_open || false,
      finished: contestToEdit.finished || false,
    });

    setIsEditing(true);
  };

  // 5) Save changes to existing contest
  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('contests')
        .update(contestData)
        .eq('id', selectedContestId);

      if (error) throw error;

      // Refresh the list
      const { data: refreshedData } = await supabase
        .from('contests')
        .select('*');

      setContests(refreshedData || []);

      // Reset
      setIsEditing(false);
      setContestData({
        name: '',
        date: '',
        price: '',
        current_round: 1,
        lobby_open: false,
        finished: false,
      });
      setSelectedContestId(null);
    } catch (err) {
      console.error("Error updating contest:", err);
    }
  };

  // 6) Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleSaveChanges();
    } else {
      handleCreateContest();
    }
  };

  // 7) Optionally handle “Delete”
  const handleDeleteContest = async (contestId) => {
    try {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', contestId);

      if (error) throw error;

      // Refresh
      const { data: refreshedData } = await supabase
        .from('contests')
        .select('*');

      setContests(refreshedData || []);
    } catch (err) {
      console.error("Error deleting contest:", err);
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

        {/* Show these fields only when editing */}
        {isEditing && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="lobby_open" className={styles.label}>
                <input
                  type="checkbox"
                  id="lobby_open"
                  name="lobby_open"
                  checked={contestData.lobby_open}
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
              <label htmlFor="current_round" className={styles.label}>
                Current Round:
              </label>
              <input
                type="number"
                id="current_round"
                name="current_round"
                value={contestData.current_round}
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
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.date}</td>
              <td>{c.price}</td>
              <td>
                {c.finished
                  ? 'Completed'
                  : c.lobby_open
                  ? 'Active'
                  : 'Scheduled'}
              </td>
              <td>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEditContest(c.id)}
                >
                  Edit
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleDeleteContest(c.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContestManager;
