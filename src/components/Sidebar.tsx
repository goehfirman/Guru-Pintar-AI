import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getSchoolProfile } from '../utils/schoolProfile';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Alur Tujuan Pembelajaran', path: '/atp', icon: 'route' },
  { name: 'Program Tahunan', path: '/prota', icon: 'calendar_view_month' },
  { name: 'Program Semester', path: '/promes', icon: 'date_range' },
  { name: 'Data Siswa', path: '/data-siswa', icon: 'group' },
  { name: 'Jadwal Pelajaran', path: '/jadwal', icon: 'calendar_month' },
  { name: 'Jurnal Agenda Guru', path: '/jurnal', icon: 'book' },
  { name: 'Absensi Siswa', path: '/absensi', icon: 'fact_check' },
  { name: 'Penilaian Siswa', path: '/penilaian', icon: 'assignment' },
  { name: 'Manajemen Ekskul', path: '/ekskul', icon: 'sports_soccer' },
  { name: 'Portfolio Prestasi', path: '/portfolio', icon: 'emoji_events' },
];

const aiTools = [
  { name: 'Modul Ajar AI', path: '/modul-ajar-ai', icon: 'auto_fix_high' },
  { name: 'Bank Soal AI', path: '/bank-soal-ai', icon: 'psychology' },
];

const reportTools = [
  { name: 'Cetak Laporan', path: '/cetak-laporan', icon: 'print' },
  { name: 'Kirim Kepala Sekolah', path: '/kirim-kepsek', icon: 'send_and_archive' },
];

const settingsItems = [
  { name: 'Profil Saya', path: '/profil', icon: 'person' },
  { name: 'Pengaturan Sekolah', path: '/pengaturan', icon: 'settings' },
  { name: 'Pengaturan Kelas', path: '/pengaturan-kelas', icon: 'class' },
  { name: 'Mata Pelajaran', path: '/pengaturan-mapel', icon: 'subject' },
  { name: 'Kalender Akademik', path: '/kalender', icon: 'event' },
  { name: 'Panduan Kurikulum', path: '/panduan', icon: 'menu_book' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [schoolLogo, setSchoolLogo] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('GuruPintar AI');

  useEffect(() => {
    const loadSchoolData = () => {
      const profile = getSchoolProfile();
      setSchoolLogo(profile.logoUrl);
      // We can optionally set the school name here too if we want to replace "GuruPintar AI"
      // setSchoolName(profile.name || 'GuruPintar AI'); 
    };

    loadSchoolData();
    window.addEventListener('schoolProfileUpdated', loadSchoolData);
    return () => window.removeEventListener('schoolProfileUpdated', loadSchoolData);
  }, []);

  return (
    <aside
      className={twMerge(
        'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 dark:bg-sidebar-dark dark:border-border-dark lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 text-white rounded-xl bg-primary overflow-hidden">
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined">school</span>
            )}
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[140px]" title={schoolName}>
            {schoolName}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <NavLink
          to="/"
          onClick={() => {
            if (window.innerWidth < 1024) {
              setIsOpen(false);
            }
          }}
          className={({ isActive }) =>
            twMerge(
              'flex items-center gap-3 px-4 py-3 mb-6 text-sm font-medium rounded-xl transition-colors',
              isActive
                ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
            )
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </NavLink>

        <div className="mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Master Data
        </div>
        <nav className="space-y-1">
          {settingsItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={({ isActive }) =>
                twMerge(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                  isActive
                    ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                )
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Menu Utama
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={({ isActive }) =>
                twMerge(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                  isActive
                    ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                )
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Alat AI
        </div>
        <nav className="space-y-1">
          {aiTools.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={({ isActive }) =>
                twMerge(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                  isActive
                    ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                )
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Laporan & Dokumen
        </div>
        <nav className="space-y-1">
          {reportTools.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={({ isActive }) =>
                twMerge(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                  isActive
                    ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                )
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-border-dark bg-white dark:bg-sidebar-dark shrink-0">
        <button className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors rounded-xl hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
