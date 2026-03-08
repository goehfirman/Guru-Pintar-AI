import React, { useState, useEffect } from 'react';
import { getStorageKey } from '../utils/academic';
import { UserProfile, getUserProfile } from '../utils/userProfile';

const Dashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const loadData = () => {
    // Load User Profile
    setUserProfile(getUserProfile());

    // Load Gemini API Key
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
    }

    // Load Students Count
    const savedStudents = localStorage.getItem(getStorageKey('guru_students'));
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        setTotalStudents(parsedStudents.filter((s: any) => s.status === 'Aktif').length);
      } catch (e) {}
    } else {
      setTotalStudents(0);
    }

    // Load Classes Count
    const savedClasses = localStorage.getItem(getStorageKey('guru_classes'));
    if (savedClasses) {
      try {
        const parsedClasses = JSON.parse(savedClasses);
        setTotalClasses(parsedClasses.length);
      } catch (e) {}
    } else {
      setTotalClasses(0);
    }

    // Load Today's Schedule
    const savedSchedule = localStorage.getItem(getStorageKey('guru_schedule'));
    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule);
        const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        const today = days[new Date().getDay()];
        
        if (today !== 'minggu' && today !== 'sabtu') {
          const todayClasses = parsedSchedule
            .filter((item: any) => item[today] && item[today] !== '-' && item[today].toLowerCase() !== 'istirahat')
            .map((item: any) => {
              // Parse format like "Matematika (X IPA 1)"
              const match = item[today].match(/(.*?)\s*\((.*?)\)/);
              if (match) {
                return {
                  time: item.time,
                  subject: match[1].trim(),
                  class: match[2].trim()
                };
              }
              return {
                time: item.time,
                subject: item[today],
                class: '-'
              };
            });
          setTodaySchedule(todayClasses);
        } else {
          setTodaySchedule([]);
        }
      } catch (e) {}
    } else {
      // Default schedule if none exists
      setTodaySchedule([]);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', geminiApiKey);
    alert('API Key berhasil disimpan!');
  };

  useEffect(() => {
    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('studentsUpdated', loadData);
    window.addEventListener('classesUpdated', loadData);
    window.addEventListener('scheduleUpdated', loadData);
    window.addEventListener('userProfileUpdated', loadData);
    
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('studentsUpdated', loadData);
      window.removeEventListener('classesUpdated', loadData);
      window.removeEventListener('scheduleUpdated', loadData);
      window.removeEventListener('userProfileUpdated', loadData);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Selamat Datang, {userProfile.fullName}</h1>
          <p className="text-gray-500 dark:text-gray-400">Ringkasan aktivitas dan jadwal Anda hari ini</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
          <span className="material-symbols-outlined">add</span>
          Buat Jurnal Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-blue-600 bg-blue-50 rounded-xl dark:bg-blue-900/20 dark:text-blue-400">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full dark:bg-green-900/20 dark:text-green-400">+2%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Siswa Diajar</p>
        </div>

        {/* Card 2 */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-purple-600 bg-purple-50 rounded-xl dark:bg-purple-900/20 dark:text-purple-400">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <span className="text-sm font-medium text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-full dark:bg-gray-800 dark:text-gray-400">Minggu Ini</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalClasses}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelas Diajar</p>
        </div>

        {/* Card 3 */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-orange-600 bg-orange-50 rounded-xl dark:bg-orange-900/20 dark:text-orange-400">
              <span className="material-symbols-outlined">assignment_turned_in</span>
            </div>
            <span className="text-sm font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full dark:bg-red-900/20 dark:text-red-400">3 Belum</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">12</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tugas Menunggu Nilai</p>
        </div>

        {/* Card 4 */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-green-600 bg-green-50 rounded-xl dark:bg-green-900/20 dark:text-green-400">
              <span className="material-symbols-outlined">event_available</span>
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full dark:bg-green-900/20 dark:text-green-400">98%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">95%</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata Kehadiran</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Jadwal Hari Ini */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm lg:col-span-2 dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Jadwal Mengajar Hari Ini</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((schedule, index) => {
                const [start, end] = schedule.time.split(' - ');
                return (
                  <div key={index} className="flex items-center justify-between p-4 transition-colors border border-gray-100 rounded-xl hover:bg-gray-50 dark:border-border-dark dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-16 h-16 text-blue-600 bg-blue-50 rounded-xl dark:bg-blue-900/20 dark:text-blue-400">
                        <span className="text-sm font-bold">{start}</span>
                        <span className="text-xs">{end}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{schedule.subject}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kelas {schedule.class}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${index === 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {index === 0 ? 'Sedang Berlangsung' : 'Akan Datang'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Tidak ada jadwal mengajar hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Pengumuman */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pengaturan API Key</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gemini API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Masukkan API Key Gemini Anda"
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={saveApiKey}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  >
                    Simpan
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  API Key ini akan digunakan untuk fitur-fitur AI seperti Import Pintar. 
                  Key disimpan secara lokal di browser Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pengumuman Sekolah</h2>
            <button className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="space-y-4">
            {/* Pengumuman 1 */}
            <div className="pb-4 border-b border-gray-100 dark:border-border-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-400">Penting</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Hari ini, 08:00</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Rapat Evaluasi Tengah Semester</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">Diharapkan kehadiran seluruh dewan guru pada rapat evaluasi tengah semester ganjil di ruang guru.</p>
            </div>

            {/* Pengumuman 2 */}
            <div className="pb-4 border-b border-gray-100 dark:border-border-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md dark:bg-blue-900/20 dark:text-blue-400">Info</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Kemarin, 14:30</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Batas Pengumpulan Nilai Tugas</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">Mengingatkan kembali batas akhir pengisian nilai tugas ke-3 adalah hari Jumat minggu ini.</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
