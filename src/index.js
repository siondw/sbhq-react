import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import RegistrationScreen from "./screens/Registration/RegistrationScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import PregameScreen from "./screens/Pregame/PregameScreen";
import QuestionScreen from "./screens/Question/QuestionScreen";
import SubmittedScreen from "./screens/Submitted/SubmittedScreen";
import CorrectScreen from "./screens/Correct/CorrectScreen";
import EliminatedScreen from "./screens/Eliminated/EliminatedScreen";
import VerificationScreen from "./screens/VerificationScreen/VerificationScreen";
import LobbyScreen from "./screens/Lobby/LobbyScreen";
import JoinContestsScreen from "./screens/JoinContests/JoinContestsScreen";

// Use AdminScreen here
import AdminScreen from "./screens/Admin/AdminScreen";
import OverviewContent from "./components/admin/Overview/OverviewContent";
import QuestionManagement from "./components/admin/QuestionManagement/QuestionManagement";
import ParticipantManagement from "./components/admin/ParticipantManagement/ParticipantManagement";
import SubmissionManagement from "./components/admin/SubmissionManagement/SubmissionManagement";
import ContestManager from "./components/admin/ContestManager/ContestManager";

import { AuthProvider } from "./contexts/AuthContext"; // Adjust the path as necessary

import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegistrationScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/pregame" element={<PregameScreen />} />
          <Route path="/question" element={<QuestionScreen />} />
          <Route path="/submitted" element={<SubmittedScreen />} />
          <Route path="/correct" element={<CorrectScreen />} />
          <Route path="/eliminated" element={<EliminatedScreen />} />
          <Route path="/verify" element={<VerificationScreen />} />
          <Route path="/lobby" element={<LobbyScreen />} />
          <Route path="/join-contests" element={<JoinContestsScreen />} />

          {/* Admin Dashboard with Nested Routes */}
          <Route path="/admin" element={<AdminScreen />}>
            <Route path="overview" element={<OverviewContent />} />
            <Route path="contests" element={<ContestManager />} />
            <Route path="questions" element={<QuestionManagement />} />
            <Route path="participants" element={<ParticipantManagement />} />
            <Route path="submissions" element={<SubmissionManagement />} />
            {/* Default route for admin dashboard */}
            <Route path="*" element={<Navigate replace to="/admin/overview" />} />
          </Route>

          <Route path="/" element={<Navigate replace to="/register" />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
