import React, { useState, useEffect } from 'react';
import { UserProfile, getUserProfile, saveUserProfile } from '../utils/userProfile';

const ProfilSaya: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {
    // Load initial profile
    setProfile(getUserProfile());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result as string;
        setProfile(prev => ({
          ...prev,
          signatureUrl: base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    saveUserProfile(profile);
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola informasi pribadi dan kredensial Anda</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
        >
          <span className="material-symbols-outlined">save</span>
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=1e3fae&color=fff&size=128`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                />
                <button className="absolute bottom-0 right-0 p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-sm">
                  <span className="text-sm material-symbols-outlined">photo_camera</span>
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.fullName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Guru {profile.subject}</p>
              
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-full dark:bg-green-900/20 dark:text-green-400">
                <span className="text-sm material-symbols-outlined">verified</span>
                Akun Terverifikasi
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tanda Tangan Digital</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Upload tanda tangan Anda untuk disematkan secara otomatis pada dokumen PDF yang diunduh.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                {profile.signatureUrl ? (
                  <img src={profile.signatureUrl} alt="Signature" className="max-h-full object-contain" />
                ) : (
                  <div className="text-center text-gray-400">
                    <span className="material-symbols-outlined text-3xl mb-1">signature</span>
                    <p className="text-xs">Belum ada tanda tangan</p>
                  </div>
                )}
              </div>
              
              <label className="w-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleSignatureUpload}
                  className="hidden" 
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  {profile.signatureUrl ? 'Ganti Tanda Tangan' : 'Upload Tanda Tangan'}
                </div>
              </label>
              
              {profile.signatureUrl && (
                <button 
                  onClick={() => setProfile(prev => ({ ...prev, signatureUrl: '' }))}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Hapus Tanda Tangan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Informasi Pribadi</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">NIP / NUPTK</label>
                  <input
                    type="text"
                    name="nip"
                    value={profile.nip}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tempat Lahir</label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={profile.birthPlace}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={profile.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
                  <select 
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agama</label>
                  <select 
                    name="religion"
                    value={profile.religion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alamat Lengkap</label>
                  <textarea
                    rows={3}
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors resize-none"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Informasi Kepegawaian</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Pegawai</label>
                  <select 
                    name="status"
                    value={profile.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Honorer">Honorer</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Golongan / Ruang</label>
                  <select 
                    name="rank"
                    value={profile.rank}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  >
                    <option value="III/a">III/a - Penata Muda</option>
                    <option value="III/b">III/b - Penata Muda Tingkat I</option>
                    <option value="III/c">III/c - Penata</option>
                    <option value="III/d">III/d - Penata Tingkat I</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mata Pelajaran Diampu</label>
                  <input
                    type="text"
                    name="subject"
                    value={profile.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tugas Tambahan</label>
                  <input
                    type="text"
                    name="additionalTask"
                    value={profile.additionalTask}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Save Notification Toast */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${showSaveNotification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3 px-6 py-4 text-white bg-green-600 rounded-xl shadow-lg">
          <span className="material-symbols-outlined">check_circle</span>
          <div>
            <h4 className="font-bold">Berhasil!</h4>
            <p className="text-sm">Data profil berhasil diperbarui!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilSaya;
