import React, { useState } from 'react';
import { UserAccount, Role } from '../types';
import DepartmentManagement from './DepartmentManagement';
import MasterSchedule from './MasterSchedule';
import KpiManagement from './TeamManagement';
import UserManagement from './UserManagement'; // Import the new component

interface GeneralSettingsProps {
  user: UserAccount;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ user }) => {
  const isAdmin = user.role === Role.Admin;
  const isDeptHead = user.role === Role.DeptHead;

  // Set the default active tab based on user role
  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'kpi'); // Default to 'users' for Admin

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return isAdmin ? <UserManagement /> : null; // Render UserManagement
      case 'departments':
        return isAdmin ? <DepartmentManagement /> : null;
      case 'schedule':
        return isAdmin ? <MasterSchedule /> : null;
      case 'kpi':
        return (isAdmin || isDeptHead) ? <KpiManagement user={user} /> : null;
      default:
        // Fallback to the first available tab
        return isAdmin ? <UserManagement /> : <KpiManagement user={user} />;
    }
  };

  const TabButton: React.FC<{ tabId: string; label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
        activeTab === tabId
          ? 'border-teal-500 text-teal-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">General Settings</h1>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {isAdmin && (
            <>
              <TabButton tabId="users" label="User Accounts" />
              <TabButton tabId="departments" label="Departments" />
              <TabButton tabId="schedule" label="Master Schedule" />
            </>
          )}
          {(isAdmin || isDeptHead) && (
            <TabButton tabId="kpi" label="KPI Management" />
          )}
        </nav>
      </div>

      <div className="mt-4">
        {/* The rendered content has its own internal padding and structure */}
        {renderContent()}
      </div>
    </div>
  );
};

export default GeneralSettings;
