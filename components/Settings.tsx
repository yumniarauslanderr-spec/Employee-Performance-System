
import React from 'react';
import Card from './common/Card';
import { UserAccount } from '../types';

interface SettingsProps {
  user: UserAccount;
}

const GeneralSettingsComponent: React.FC<{ user: UserAccount }> = ({ user }) => (
  <div className="max-w-2xl mx-auto">
    <Card title="Account Settings">
      <div className="space-y-4">
        <div>
          <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input id="email-address" type="email" readOnly value={user.email} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm" />
        </div>
        <div>
          <label htmlFor="new-passcode" className="block text-sm font-medium text-gray-700">Change Passcode</label>
          <input id="new-passcode" type="password" placeholder="New Passcode" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
        </div>
        <button type="button" onClick={() => alert('Passcode updated! (Demo)')} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">Update Passcode</button>
      </div>
    </Card>
    <div className="mt-6">
      <Card title="Notification Preferences">
        <div className="space-y-2">
            <div className="flex items-center">
                <input id="email-notifications" name="notifications" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" defaultChecked />
                <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">Email notifications for new feedback</label>
            </div>
             <div className="flex items-center">
                <input id="weekly-summary" name="summary" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                <label htmlFor="weekly-summary" className="ml-2 block text-sm text-gray-900">Weekly performance summary email</label>
            </div>
        </div>
      </Card>
    </div>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ user }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Settings</h1>
      <GeneralSettingsComponent user={user} />
    </div>
  );
};

export default Settings;