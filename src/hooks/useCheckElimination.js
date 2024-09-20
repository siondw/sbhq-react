// src/hooks/useCheckElimination.js

import { useEffect } from "react";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const useCheckElimination = (contestId, userId) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!contestId || !userId) return;

    const db = getDatabase();
    const participantRef = ref(db, `contests/${contestId}/participants/${userId}/active`);

    const handleParticipantStatus = (snapshot) => {
      const isActive = snapshot.val();
      if (isActive === false) {
        navigate("/eliminated"); // Redirect to EliminatedScreen
      }
    };

    onValue(participantRef, handleParticipantStatus, (error) => {
      console.error("Error checking participant status:", error);
    });

    // Cleanup listener on unmount
    return () => {
      off(participantRef, "value", handleParticipantStatus);
    };
  }, [contestId, userId, navigate, user]);

  return null; // This hook doesn't render anything
};

export default useCheckElimination;
