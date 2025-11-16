import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, Role, UserProfile } from '../types';
import Dashboard from './Dashboard';
import Reports from './Reports';
import Settings from './Settings';
import UserProfilePage from './UserProfile';
import { getEmployeeById } from '../services/mockApi';
import AppLogo from './common/AppLogo';
import Attendance from './Attendance';
import TeamSchedule from './TeamSchedule';
import MySchedule from './MySchedule';
import AdminAnalytics from './AdminAnalytics';
import AICoachingAssistant from './AICoachingAssistant';
import GeneralSettings from './GeneralSettings';

interface LayoutProps {
  user: UserAccount;
  onLogout: () => void;
}

const NavItem: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full text-left p-3 rounded-lg transition-colors ${active ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'}`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
        <span className="ml-4 font-medium">{label}</span>
    </button>
)

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [employee, setEmployee] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getEmployeeById(user.employeeId).then(setEmployee);
  }, [user.employeeId]);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setEmployee(updatedProfile);
  };

  const ICONS = {
      dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10l-7-7-7 7z" /></svg>,
      reports: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      settings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      logout: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
      profile: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      attendance: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      schedule: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 14a2 2 0 100-4 2 2 0 000 4z" /></svg>,
      analyticsAI: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.684-2.684L11.25 18l1.938-.648a3.375 3.375 0 002.684-2.684L16.25 13.5l.648 1.938a3.375 3.375 0 002.684 2.684L21.75 18l-1.938.648a3.375 3.375 0 00-2.684 2.684z" /></svg>,
      aiCoach: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-6-6v-1.5a6 6 0 00-6 6v1.5a6 6 0 006 6zM12 18.75a6 6 0 00-6-6v-1.5a6 6 0 006-6v1.5a6 6 0 006 6v-1.5a6 6 0 00-6-6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75h.008v.008H12v-.008z" /></svg>,
      generalSettings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.227l.473-.201a49.244 49.244 0 015.694 0l.473.201c.549.22.998.685 1.11 1.227.111.542.062 1.114-.142 1.626l-.473.946a48.455 48.455 0 01-5.694 0l-.473-.946a1.64 1.64 0 01-.142-1.626zM10.343 3.94L9 2.25M13.657 3.94L15 2.25m-5.657 18.56c.09.542.56 1.007 1.11 1.227l.473.201a49.244 49.244 0 005.694 0l.473-.201c.549-.22.998.685 1.11-1.227.111-.542.062-1.114-.142-1.626l-.473-.946a48.455 48.455 0 00-5.694 0l-.473.946a1.64 1.64 0 00-.142 1.626zM10.343 21.06L9 22.75m4.657-1.69l1.343 1.69" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zM12 6.75a5.25 5.25 0 01-4.135 8.123m4.135-8.123a5.25 5.25 0 004.135 8.123m0 0A5.25 5.25 0 0112 17.25m-4.135-2.427A5.25 5.25 0 0112 6.75" /></svg>,
  };

  const handleNavClick = (page: string) => {
    setActivePage(page);
    setSidebarOpen(false); // Close sidebar on nav item click on mobile
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={user} navigate={handleNavClick} />;
      case 'general-settings':
        return <GeneralSettings user={user} />;
      case 'team-schedule':
        return <TeamSchedule user={user} />;
      case 'attendance':
        return <Attendance user={user} />;
      case 'my-schedule':
        return <MySchedule user={user} />;
      case 'analytics-ai':
        return <AdminAnalytics />;
      case 'ai-coach':
        return <AICoachingAssistant user={user} />;
      case 'profile':
        return <UserProfilePage user={user} onProfileUpdate={handleProfileUpdate} />;
      case 'reports':
        return <Reports user={user} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Dashboard user={user} navigate={handleNavClick} />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-center">
             <AppLogo className="text-3xl" />
        </div>
        <div className="flex-1 p-4 space-y-2">
            <NavItem icon={ICONS.dashboard} label="Dashboard" active={activePage === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
            {user.role === Role.Employee && (
                <>
                    <NavItem icon={ICONS.schedule} label="My Schedule" active={activePage === 'my-schedule'} onClick={() => handleNavClick('my-schedule')} />
                    <NavItem icon={ICONS.aiCoach} label="AI Coach" active={activePage === 'ai-coach'} onClick={() => handleNavClick('ai-coach')} />
                </>
            )}
            {(user.role === Role.Admin || user.role === Role.DeptHead) && (
                <>
                  <NavItem icon={ICONS.generalSettings} label="General Settings" active={activePage === 'general-settings'} onClick={() => handleNavClick('general-settings')} />
                  {user.role === Role.DeptHead && <NavItem icon={ICONS.schedule} label="Team Schedule" active={activePage === 'team-schedule'} onClick={() => handleNavClick('team-schedule')} />}
                </>
            )}
            {user.role === Role.Admin && (
                <>
                  <NavItem icon={ICONS.analyticsAI} label="Analytics & AI" active={activePage === 'analytics-ai'} onClick={() => handleNavClick('analytics-ai')} />
                </>
            )}
            <NavItem icon={ICONS.reports} label="Reports" active={activePage === 'reports'} onClick={() => handleNavClick('reports')} />
            <NavItem icon={ICONS.settings} label="Settings" active={activePage === 'settings'} onClick={() => handleNavClick('settings')} />
        </div>
        <div className="p-4 border-t">
            <button onClick={onLogout} className={`flex items-center w-full text-left p-3 rounded-lg transition-colors text-gray-600 hover:bg-teal-50 hover:text-teal-700`}>
                {React.cloneElement(ICONS.logout, { className: 'w-6 h-6' })}
                <span className="ml-4 font-medium">Logout</span>
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="bg-white border-r h-full">
                {sidebarContent}
            </div>
          </div>
      </aside>
      
      {/* Mobile sidebar with overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 flex z-40">
          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </div>
          {/* Overlay */}
          <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
          <button onClick={() => setSidebarOpen(true)} className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
             <div className="flex items-center">
                <div className="hidden md:block text-gray-700 font-semibold text-sm">
                    {currentTime.toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })}
                </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
                <div className="ml-3 relative" ref={profileMenuRef}>
                    <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center space-x-3 max-w-xs bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 p-1">
                        {employee && (
                           <div className="text-right hidden sm:block">
                               <p className="text-sm font-medium text-gray-800">{employee.name}</p>
                               <p className="text-xs text-gray-500">{employee.position}</p>
                           </div>
                        )}
                        <img className="h-10 w-10 rounded-full" src={employee?.avatar} alt="" />
                    </button>
                     {isProfileMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20">
                            <button
                                onClick={() => { handleNavClick('profile'); setIsProfileMenuOpen(false); }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                {React.cloneElement(ICONS.profile, { className: 'w-5 h-5 mr-3 text-gray-500' })}
                                My Profile
                            </button>
                            <button
                                onClick={() => { handleNavClick('attendance'); setIsProfileMenuOpen(false); }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                {React.cloneElement(ICONS.attendance, { className: 'w-5 h-5 mr-3 text-gray-500' })}
                                Attendance
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                {renderPage()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;