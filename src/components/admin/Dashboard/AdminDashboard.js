import React from 'react';
import Sidebar from '../Sidebar/Sidebar'; // Adjust path if necessary
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1C1C1E' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#2C2C2E' }}>
        {/* Outlet renders the content for the current route */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
