import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import PinInput from "../../components/PinInput/PinInput";
import styles from "./VerificationScreen.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import * as UserService from "../../services/UserServices";
import { checkOpenLobbies } from "../../services/LobbyService"; // Import the service function

function VerificationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phoneNumber, isNewUser, username } = location.state; // Destructure state
  const { confirmationResult, setUser } = useAuth();
  const [error, setError] = useState("");
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is authenticated:", user);
        setIsUserAuthenticated(true);
        setCurrentUser(user);
      } else {
        console.log("User is not authenticated");
        setIsUserAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const onSubmitVerificationCode = async (pin) => {
    if (confirmationResult) {
      try {
        const result = await confirmationResult.confirm(pin);
        console.log("Verification result:", result);
        const user = result.user;
        console.log("User verified with UID:", user.uid);

        // Set the authenticated user in AuthContext
        setUser(user);

        // Update the user's profile in Firebase Authentication to include the username as displayName
        if (user && !user.displayName) {
          await updateProfile(user, { displayName: username });
          console.log("Display name set to:", username);
          setUser({ ...user, displayName: username });
        }

        const userExists = await UserService.checkUserExists(user.uid);
        console.log("User exists:", userExists);

        if (!userExists) {
          await UserService.addUserToDB(user.uid, username, user.phoneNumber);
          console.log("New user added to database.");
        } else {
          console.log("User already exists, retrieving details.");
          const userDetails = await UserService.getUserDetails(user.uid);
          console.log("Retrieved user details:", userDetails);
        }

        // Check for open lobbies
        const openLobbyContest = await checkOpenLobbies();
        if (openLobbyContest) {
          const isUserRegistered =
            openLobbyContest.participants &&
            openLobbyContest.participants.hasOwnProperty(user.uid);
          if (isUserRegistered) {
            console.log("Navigating to lobby with contest:", openLobbyContest); // Debugging statement
            navigate("/lobby", { state: { contest: openLobbyContest } });
          } else {
            console.log(
              "User is not registered for any open lobbies. Redirecting to Join Contests screen."
            );
            navigate("/join-contests");
          }
        } else {
          console.log(
            "No open lobbies found. Redirecting to Join Contests screen."
          );
          navigate("/join-contests");
        }
      } catch (error) {
        console.error(
          "Failed during user verification or database operations:",
          error
        );
        setError(
          "Failed to verify code or handle user data. Please try again."
        );
      }
    }
  };

  return (
    <div className={styles.verificationScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.content}>
        <MainText
          header="Enter PIN"
          subheader="Please enter the 6-digit code we sent to your phone."
        />
        <PinInput onPinComplete={onSubmitVerificationCode} />
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default VerificationScreen;
