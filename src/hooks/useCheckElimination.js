import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";

const useCheckElimination = (contestId, userId) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!contestId || !userId) return;

    let subscription;

    const checkElimination = async () => {
      try {
        // Fetch participant's active status initially
        const { data, error } = await supabase
          .from("participants")
          .select("active")
          .eq("contest_id", contestId)
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        if (data?.active === false) {
          navigate("/eliminated"); // Redirect to EliminatedScreen
        }

        // Subscribe to changes in the participant's active status
        subscription = supabase
          .from(`participants:contest_id=eq.${contestId}`)
          .on("UPDATE", (payload) => {
            if (payload.new.user_id === userId && payload.new.active === false) {
              navigate("/eliminated"); // Redirect to EliminatedScreen
            }
          })
          .subscribe();
      } catch (err) {
        console.error("Error checking participant status:", err.message);
      }
    };

    checkElimination();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeSubscription(subscription);
      }
    };
  }, [contestId, userId, navigate, user]);

  return null; // This hook doesn't render anything
};

export default useCheckElimination;
