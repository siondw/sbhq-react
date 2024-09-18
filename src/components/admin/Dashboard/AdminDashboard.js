// AdminDashboard.js
import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import OverviewContent from '../Overview/OverviewContent';
import QuestionManagement from '../QuestionManagement/QuestionManagement';
import ParticipantManagement from '../ParticipantManagement/ParticipantManagement';

const AdminDashboard = () => {
  const [currentScreen, setCurrentScreen] = useState('overview');

  const renderContent = () => {
    switch (currentScreen) {
      case 'overview': return <OverviewContent />;
      case 'questions': return <QuestionManagement />;
      case 'participants': return <ParticipantManagement />;
      default: return <OverviewContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar setCurrentScreen={setCurrentScreen} currentScreen={currentScreen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
