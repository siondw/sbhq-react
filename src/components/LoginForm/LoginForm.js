import React, { useState } from "react";
import styles from "../RegistrationForm/RegistrationForm.module.css"; // Reusing the same styles
import LargeButton from "../CustomButton/LargeButton";

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    // Login logic here
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.inputField}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      {errors.username && <div className={styles.error}>{errors.username}</div>}

      <input
        className={styles.inputField}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {errors.password && <div className={styles.error}>{errors.password}</div>}

      <LargeButton text="Login" type="submit" />
    </form>
  );
}

export default LoginScreen;
