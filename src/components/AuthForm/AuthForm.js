import React, { useState } from "react";
import LargeButton from "../CustomButton/LargeButton";
import styles from "./AuthForm.module.css";
import { supabase } from "../../supabase";

function AuthForm() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    try {
      const redirectUrl = process.env.REACT_APP_REDIRECT_URL;
      console.log("Redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Magic link sent! Check your email to log in or register."
      );
    } catch (error) {
      setErrorMessage(error.message || "Failed to send magic link.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.REACT_APP_REDIRECT_URL,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to sign in with Google.");
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <button
        className={styles.googleButton}
        onClick={handleGoogleSignIn}
        type="button"
      >
        Continue with Google
      </button>
      <div className={styles.divider}>
        <span>or</span>
      </div>
      <form className={styles.form} onSubmit={handleEmailSubmit}>
        <input
          className={styles.inputField}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}
        <LargeButton text="Send Magic Link" type="submit" />
      </form>
    </div>
  );
}

export default AuthForm;
