import React, { useState } from 'react';
import LargeButton from '../CustomButton/LargeButton';
import styles from './UsernameInput.module.css';

interface UsernameInputProps {
  onSubmit: (username: string) => void;
}

function UsernameInput({ onSubmit }: UsernameInputProps) {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    setError('');
    onSubmit(username.trim());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.inputField}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
      />
      {error && <div className={styles.error}>{error}</div>}
      <LargeButton 
        text="Save Username"
        type="submit"
      />
    </form>
  );
}

export default UsernameInput;
