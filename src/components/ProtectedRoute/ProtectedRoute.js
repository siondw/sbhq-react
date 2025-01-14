import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ProtectedRoute({ adminOnly = false }) {
  const { user, role } = useAuth();

  console.log("ProtectedRoute: User:", user);
  console.log("ProtectedRoute: Role:", role);

  // Check if the user is authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if the user is an admin (for admin-only routes)
  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the protected content
  return <Outlet />;
}

export default ProtectedRoute;
