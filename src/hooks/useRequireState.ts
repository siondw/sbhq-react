// src/hooks/useRequireState.js

import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Custom hook to ensure required state is present.
 * @param {Array} requiredKeys - Array of keys that must be present in location.state
 * @param {string} redirectPath - Path to redirect to if required state is missing
 * @returns {Object} - The state object
 */
function useRequireState<T extends Record<string, unknown> = Record<string, unknown>>(
  requiredKeys: Array<keyof T> = [],
  redirectPath = "/"
) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = useMemo(
    () => (location.state as Record<string, unknown> | null) ?? {},
    [location.state]
  ) as T;

  const hasAllKeys = requiredKeys.every((key) => key in state);

  useEffect(() => {
    if (!hasAllKeys) {
      console.warn(
        `Missing required state keys: ${requiredKeys
          .filter((key) => !(key in state))
          .join(", ")}. Redirecting to ${redirectPath}.`
      );
      navigate(redirectPath, { replace: true });
    }
  }, [hasAllKeys, navigate, redirectPath, requiredKeys, state]);

  return state;
}

export default useRequireState;
