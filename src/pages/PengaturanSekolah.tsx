import React, { useState, useEffect, useRef } from 'react';
import { SchoolProfile, getSchoolProfile, saveSchoolProfile } from '../utils/schoolProfile';

const PengaturanSekolah: React.FC = () => {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(getSchoolProfile());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [academicSettings, setAcademicSettings] = useState({
    activeYear: '2023/2024',
    curriculum: 'Kurikulum Merdeka'
  });

  const [gradingSystem, setGradingSystem] = useState({
    kkm: '75',
    taskWeight: '30',
    ptsWeight: '30',
    pasWeight: '40'
  });

  useEffect(() => {
    // Load initial profile using the utility
    setSchoolProfile(getSchoolProfile());

    const savedAcademic = localStorage.getItem('guru_academic_settings');
    if (savedAcademic) setAcademicSettings(JSON.parse(savedAcademic));

    const savedGrading = localStorage.getItem('guru_grading_system');
    if (savedGrading) setGradingSystem(JSON.parse(savedGrading));
  }, []);

  const handleSave = () => {
    saveSchoolProfile(schoolProfile);
    localStorage.setItem('guru_academic_settings', JSON.stringify(academicSettings));
    localStorage.setItem('guru_grading_system', JSON.stringify(gradingSystem));
    window.dispatchEvent(new Event('academicSettingsUpdated'));
    alert('Pengaturan berhasil disimpan!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // Limit to ~500KB
        alert('Ukuran file terlalu besar (maksimal 500KB)');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolProfile(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Generate academic years up to 2030
  const generateAcademicYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 2020; i <= 2030; i++) {
      years.push(`${i}/${i + 1}`);
    }
    return years;
  };

  const academicYears = generateAcademicYears();

  const settingsGroups = [
    {
      title: 'Profil Sekolah',
      description: 'Informasi dasar dan identitas sekolah',
      icon: 'school',
      content: (
        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center justify-center sm:flex-row sm:justify-start gap-6 mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                {schoolProfile.logoUrl ? (
                  <img src={schoolProfile.logoUrl} alt="Logo Sekolah" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">school</span>
                )}
              </div>
              <button 
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transition-transform hover:scale-105"
                title="Ganti Logo"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Logo Sekolah</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Format: JPG, PNG. Maks: 500KB</p>
              <button 
                onClick={triggerFileInput}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
              >
                Upload Logo Baru
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Nama Sekolah</label>
            <div className="sm:col-span-2">
              <input type="text" value={schoolProfile.name} onChange={e => setSchoolProfile({...schoolProfile, name: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">NPSN</label>
            <div className="sm:col-span-2">
              <input type="text" value={schoolProfile.npsn} onChange={e => setSchoolProfile({...schoolProfile, npsn: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Alamat</label>
            <div className="sm:col-span-2">
              <textarea value={schoolProfile.address} onChange={e => setSchoolProfile({...schoolProfile, address: e.target.value})} rows={3} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors resize-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Telepon</label>
            <div className="sm:col-span-2">
              <input type="text" value={schoolProfile.phone} onChange={e => setSchoolProfile({...schoolProfile, phone: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Email</label>
            <div className="sm:col-span-2">
              <input type="email" value={schoolProfile.email} onChange={e => setSchoolProfile({...schoolProfile, email: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Pengaturan Akademik',
      description: 'Konfigurasi tahun ajaran dan semester aktif',
      icon: 'calendar_month',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Tahun Ajaran Aktif</label>
            <div className="sm:col-span-2 relative">
              <input 
                type="text" 
                list="academic-years"
                value={academicSettings.activeYear} 
                onChange={e => setAcademicSettings({...academicSettings, activeYear: e.target.value})} 
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" 
                placeholder="Pilih atau ketik tahun ajaran (misal: 2023/2024)"
              />
              <datalist id="academic-years">
                {academicYears.map(year => (
                  <option key={year} value={year} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Kurikulum</label>
            <div className="sm:col-span-2">
              <select value={academicSettings.curriculum} onChange={e => setAcademicSettings({...academicSettings, curriculum: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors">
                <option value="Kurikulum 2013">Kurikulum 2013</option>
                <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Sistem Penilaian',
      description: 'Aturan dan bobot penilaian siswa',
      icon: 'grading',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">KKM Sekolah</label>
            <div className="sm:col-span-2">
              <input type="number" value={gradingSystem.kkm} onChange={e => setGradingSystem({...gradingSystem, kkm: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Bobot Tugas (%)</label>
            <div className="sm:col-span-2">
              <input type="number" value={gradingSystem.taskWeight} onChange={e => setGradingSystem({...gradingSystem, taskWeight: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Bobot PTS (%)</label>
            <div className="sm:col-span-2">
              <input type="number" value={gradingSystem.ptsWeight} onChange={e => setGradingSystem({...gradingSystem, ptsWeight: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">Bobot PAS (%)</label>
            <div className="sm:col-span-2">
              <input type="number" value={gradingSystem.pasWeight} onChange={e => setGradingSystem({...gradingSystem, pasWeight: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors" />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Sekolah</h1>
          <p className="text-gray-500 dark:text-gray-400">Konfigurasi sistem dan informasi sekolah</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined">save</span>
            Simpan Semua Perubahan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sidebar Navigation for Settings */}
        <div className="lg:col-span-1 space-y-2">
          {settingsGroups.map((group, index) => (
            <button
              key={index}
              className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-colors ${
                index === 0 
                  ? 'bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30' 
                  : 'bg-white border border-gray-100 dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${index === 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                <span className="material-symbols-outlined">{group.icon}</span>
              </div>
              <div>
                <h3 className={`font-semibold ${index === 0 ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>{group.title}</h3>
                <p className={`text-xs mt-1 ${index === 0 ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>{group.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Settings Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {settingsGroups.map((group, index) => (
            <div key={index} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-border-dark">
                <span className="material-symbols-outlined text-gray-400">{group.icon}</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{group.title}</h2>
              </div>
              
              {group.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PengaturanSekolah;
