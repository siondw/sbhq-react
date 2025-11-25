// src/hooks/useRequireState.js

import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Custom hook to ensure required state is present.
 * @param {Array} requiredKeys - Array of keys that must be present in location.state
 * @param {string} redirectPath - Path to redirect to if required state is missing
 * @returns {Object} - The state object
 */
function useRequireState(requiredKeys = [], redirectPath = "/") {
  const location = useLocation();
  const navigate = useNavigate();
  const state = useMemo(() => location.state || {}, [location.state]);
  const hasAllKeys = useMemo(
    () => requiredKeys.every((key) => key in state),
    [requiredKeys, state]
  );

  useEffect(() => {
    if (!hasAllKeys) {
      navigate(redirectPath, { replace: true });
    }
  }, [hasAllKeys, navigate, redirectPath, requiredKeys, state]);

  return state;
}

export default useRequireState;
