import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import ContestCard from "../../components/ContestCard/ContestCard";
import styles from "./JoinContestsScreen.module.css";
import { supabase } from "../../supabase";
import { useAuth } from "../../contexts/AuthContext";

function JoinContestsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the user from the updated AuthContext
  const [contests, setContests] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Fetch contests initially
  useEffect(() => {
    const fetchContests = async () => {
      if (!user) {
        setError("User is not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("contests")
          .select(`
            id,
            name,
            start_time,
            lobby_open,
            participants:participants(user_id, active)
          `)
          .order("start_time", { ascending: true });

        if (error) throw error;

        setContests(data || []);
      } catch (err) {
        console.error("Failed to fetch contests:", err.message);
        setError("Failed to load contests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, [user]);

  useEffect(() => {
    const checkOpenLobbies = async () => {
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("*") // Fetch all contest details for open lobbies
          .eq("lobby_open", true);
  
        if (error) throw error;
  
        if (data && data.length > 0) {
          // Navigate to /lobby with the first open contest
          navigate("/lobby", { state: { contest: data[0] } });
        }
      } catch (err) {
        console.error("Failed to check open lobbies:", err.message);
      }
    };
  
    // Check immediately on mount
    checkOpenLobbies();
  
    // Then set up polling
    const interval = setInterval(checkOpenLobbies, 60000);
  
    return () => clearInterval(interval);
  }, [navigate]);
  

  // Handle joining a contest
  const handleJoinContest = async (contestId) => {
    if (!user) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    try {
      const { error } = await supabase
        .from("participants")
        .insert({
          contest_id: contestId,
          user_id: user.id, // Supabase user ID from AuthContext
          active: true,
        });

      if (error) throw error;

      // Update local state
      setContests((prevContests) =>
        prevContests.map((contest) =>
          contest.id === contestId
            ? {
                ...contest,
                participants: [
                  ...(contest.participants || []),
                  { user_id: user.id, active: true },
                ],
              }
            : contest
        )
      );
    } catch (err) {
      console.error("Failed to join contest:", err.message);
      setError("Failed to join contest. Please try again later.");
    }
  };

  // Check if the user is registered
  const isUserRegistered = (contest) => {
    return (
      Array.isArray(contest.participants) &&
      contest.participants.some((participant) => participant?.user_id === user?.id)
    );
  };

  if (isLoading) {
    return <div>Loading contests...</div>;
  }

  return (
    <div className={styles.joinContestsScreen}>
      <div className={styles.pregameHeader}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <h1 className={styles.contestHeader}>Contests</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.contestList}>
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onJoin={handleJoinContest}
              isRegistered={isUserRegistered(contest)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default JoinContestsScreen;
