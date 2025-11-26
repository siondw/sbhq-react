import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../supabase";

type ParticipantPayload = RealtimePostgresChangesPayload<{
  user_id?: string;
  active?: boolean;
}>;

const useCheckElimination = (contestId?: string, userId?: string) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!contestId || !userId) return;

    let unsubscribe: (() => void) | undefined;

    const checkElimination = async () => {
      try {
        const { data, error } = await supabase
          .from("participants")
          .select("active")
          .eq("contest_id", contestId)
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        if (data?.active === false) {
          navigate("/eliminated");
        }

        const channel = supabase
          .channel(`participants-elimination-${contestId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "participants",
              filter: `contest_id=eq.${contestId}`,
            },
            (payload: ParticipantPayload) => {
              const newRow = payload.new as { user_id?: string; active?: boolean } | null;
              if (newRow?.user_id === userId && newRow?.active === false) {
                navigate("/eliminated");
              }
            }
          )
          .subscribe();

        unsubscribe = () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error("Error checking participant status:", (err as Error).message);
      }
    };

    checkElimination();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [contestId, userId, navigate]);

  return null;
};

export default useCheckElimination;
