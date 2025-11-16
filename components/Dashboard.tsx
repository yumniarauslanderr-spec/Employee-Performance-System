
import React from 'react';
import { UserAccount, Role } from '../types';
import AdminDashboard from './AdminDashboard';
import DeptHeadDashboard from './DeptHeadDashboard';
import EmployeeDashboard from './EmployeeDashboard';

interface DashboardProps {
  user: UserAccount;
  navigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, navigate }) => {
  switch (user.role) {
    case Role.Admin:
      return <AdminDashboard />;
    case Role.DeptHead:
      return <DeptHeadDashboard user={user} />;
    case Role.Employee:
      return <EmployeeDashboard user={user} navigate={navigate} />;
    default:
      return <div>Invalid user role.</div>;
  }
};

export default Dashboard;