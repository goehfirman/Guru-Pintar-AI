import React, { useState, useEffect } from 'react';
import { UserProfile, getUserProfile } from '../utils/userProfile';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [academicInfo, setAcademicInfo] = useState({
    year: '2023/2024'
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadAcademicInfo = () => {
      const savedInfo = localStorage.getItem('guru_academic_settings');
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setAcademicInfo({
          year: parsed.activeYear || '2023/2024'
        });
      }
    };

    const loadUserProfile = () => {
      setUserProfile(getUserProfile());
    };

    loadAcademicInfo();
    loadUserProfile();
    
    window.addEventListener('academicSettingsUpdated', loadAcademicInfo);
    window.addEventListener('userProfileUpdated', loadUserProfile);
    
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadAcademicInfo);
      window.removeEventListener('userProfileUpdated', loadUserProfile);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 dark:bg-sidebar-dark dark:border-border-dark sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl dark:bg-gray-800">
          <span className="text-gray-400 material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Cari siswa, jadwal, atau materi..."
            className="w-64 text-sm bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          <span className="text-sm font-medium">TA {academicInfo.year}</span>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-border-dark">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Guru {userProfile.subject}</p>
          </div>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.fullName)}&background=1e3fae&color=fff`}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
