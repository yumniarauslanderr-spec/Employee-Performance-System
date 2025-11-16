
import React, { useState } from 'react';
import { UserAccount } from '../types';
import { USERS } from '../constants';
import AppLogo from './common/AppLogo';

interface LoginProps {
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>(USERS[0].email);
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.email === selectedUserEmail);
    if (user && user.passcode === passcode) {
      onLogin(user);
    } else {
      setError('Invalid details. Please check your email and passcode.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-4 md:space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
             <AppLogo className="text-5xl" />
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900">Employee Performance System</h2>
          <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
        </div>
        <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
              Select User (Demo)
            </label>
            <select
              id="user-select"
              value={selectedUserEmail}
              onChange={(e) => {
                setSelectedUserEmail(e.target.value);
                setPasscode('');
                setError('');
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            >
              {USERS.map(user => (
                <option key={user.email} value={user.email}>
                  {user.email} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-gray-700">
              Passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;