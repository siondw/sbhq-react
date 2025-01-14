import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Non-admin imports...
import AuthScreen from "./screens/Auth/AuthScreen";
import PregameScreen from "./screens/Pregame/PregameScreen";
import QuestionScreen from "./screens/Question/QuestionScreen";
import SubmittedScreen from "./screens/Submitted/SubmittedScreen";
import CorrectScreen from "./screens/Correct/CorrectScreen";
import EliminatedScreen from "./screens/Eliminated/EliminatedScreen";
import VerificationScreen from "./screens/VerificationScreen/VerificationScreen";
import LobbyScreen from "./screens/Lobby/LobbyScreen";
import JoinContestsScreen from "./screens/JoinContests/JoinContestsScreen";

import { AuthProvider } from "./contexts/AuthContext";
import reportWebVitals from "./reportWebVitals";

// **Admin** imports
import AdminScreen from "./screens/Admin/AdminScreen";
import OverviewScreen from "./components/admin/Overview/OverviewScreen";
import ContestDetail from "./components/admin/ContestDetail/InContestScreen";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public / user-facing routes */}
          <Route path="/" element={<AuthScreen />} />
          <Route path="/pregame" element={<PregameScreen />} />
          <Route path="/question" element={<QuestionScreen />} />
          <Route path="/submitted" element={<SubmittedScreen />} />
          <Route path="/correct" element={<CorrectScreen />} />
          <Route path="/eliminated" element={<EliminatedScreen />} />
          <Route path="/verify" element={<VerificationScreen />} />
          <Route path="/lobby" element={<LobbyScreen />} />
          <Route path="/join-contests" element={<JoinContestsScreen />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminScreen />}>
            {/* 
              /admin => OverviewScreen 
              (we use 'index' to show OverviewScreen when the path is exactly /admin)
            */}
            <Route index element={<OverviewScreen />} />

            {/* /admin/:id => ContestDetail */}
            <Route path=":id" element={<ContestDetail />} />

            {/* fallback for unknown paths under /admin */}
            <Route path="*" element={<Navigate replace to="/admin" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
