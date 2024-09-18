import React from 'react';
import AdminDashboard from '../../components/admin/Dashboard/AdminDashboard';

const AdminScreen = () => {
  // You can include authentication checks or other logic specific to the screen here

  return (
    <div className="admin-dashboard-screen">
      <AdminDashboard />
    </div>
  );
};

export default AdminScreen;
