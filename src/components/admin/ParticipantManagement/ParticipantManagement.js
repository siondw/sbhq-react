import React, { useState } from 'react';
import styles from './ParticipantManagement.module.css';

const ParticipantManagement = () => {
  const [participants, setParticipants] = useState([
    { id: 1, username: 'JohnDoe123', status: 'active' },
    { id: 2, username: 'JaneSmith456', status: 'inactive' },
    { id: 3, username: 'MikeTyson789', status: 'active' },
  ]);

  const toggleStatus = (id) => {
    const updatedParticipants = participants.map((participant) =>
      participant.id === id
        ? { ...participant, status: participant.status === 'active' ? 'inactive' : 'active' }
        : participant
    );
    setParticipants(updatedParticipants);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Participant Management</h2>

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
                    participant.status === 'active' ? styles.active : styles.inactive
                  }`}
                >
                  {participant.status}
                </span>
              </td>
              <td>
                <button
                  className={styles.toggleButton}
                  onClick={() => toggleStatus(participant.id)}
                >
                  {participant.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParticipantManagement;
