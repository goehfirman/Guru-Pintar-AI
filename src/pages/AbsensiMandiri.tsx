import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import io from 'socket.io-client';
import { getStorageKey } from '../utils/academic';

const AbsensiMandiri: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('X IPA 1');
  const [availableClasses, setAvailableClasses] = useState<string[]>(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2']);
  const [scanResult, setScanResult] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'submitting' | 'success' | 'error'>('scanning');
  const [errorMessage, setErrorMessage] = useState('');
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  
  const socketRef = useRef<any>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Load students and classes
    const savedStudents = localStorage.getItem(getStorageKey('guru_students'));
    if (savedStudents) {
      try {
        const students = JSON.parse(savedStudents);
        setAllStudents(students);
        const classes = Array.from(new Set(students.map((s: any) => s.class))).filter(Boolean) as string[];
        if (classes.length > 0) {
          setAvailableClasses(classes);
          setSelectedClass(classes[0]);
        }
      } catch (e) {}
    }

    // Initialize socket
    socketRef.current = io();

    return () => {
      stopCamera();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startCamera = async () => {
    if (html5QrCodeRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCode.start(
        { facingMode: "user" }, // or "environment"
        config,
        onScanSuccess,
        onScanFailure
      );
      
      setIsCameraStarted(true);
      setStatus('scanning');
    } catch (err) {
      console.error("Unable to start camera", err);
      setErrorMessage("Gagal menyalakan kamera. Pastikan izin kamera telah diberikan.");
      setStatus('error');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current = null;
        setIsCameraStarted(false);
      } catch (err) {
        console.error("Unable to stop camera", err);
      }
    }
  };

  function onScanSuccess(decodedText: string) {
    if (status !== 'scanning') return; // Prevent multiple scans while processing

    try {
      const data = JSON.parse(decodedText);
      if (data.type === 'student_id') {
        processAttendance(data);
      } else {
        // Handle case where JSON is parsed but it's not our expected format
        handleUnknownScan(decodedText);
      }
    } catch (e) {
      // If not JSON, maybe it's just the NISN/ID directly
      handleUnknownScan(decodedText);
    }
  }

  function handleUnknownScan(decodedText: string) {
    // Try to find student by ID or NISN
    const student = allStudents.find(s => 
      s.nisn === decodedText || 
      s.id === decodedText ||
      (s.nisn && decodedText.includes(s.nisn)) // Fallback for partial matches
    );
    
    if (student) {
      processAttendance({ type: 'student_id', id: student.id, nisn: student.nisn, name: student.name });
    } else {
      setStatus('error');
      setErrorMessage('Data siswa tidak ditemukan. Pastikan kartu yang dipindai benar.');
      setTimeout(() => setStatus('scanning'), 3000);
    }
  }

  function onScanFailure(error: any) {}

  const processAttendance = (studentData: any) => {
    if (status === 'submitting') return;
    
    setStatus('submitting');
    
    const student = allStudents.find(s => s.id === studentData.id || s.nisn === studentData.nisn);
    if (!student) {
      setStatus('error');
      setErrorMessage('Data siswa tidak ditemukan dalam sistem.');
      setTimeout(() => setStatus('scanning'), 3000);
      return;
    }
    
    const studentClass = student.class?.toString().trim();
    const targetClass = selectedClass?.toString().trim();
    
    if (studentClass !== targetClass) {
      setStatus('error');
      setErrorMessage(`Siswa ini terdaftar di kelas ${studentClass || 'Tidak ada kelas'}, bukan ${targetClass}.`);
      setTimeout(() => setStatus('scanning'), 3000);
      return;
    }

    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const attendanceData = {
      studentId: student.id,
      studentName: student.name,
      class: targetClass,
      date: dateStr,
      status: 'Hadir',
      timestamp: d.toISOString()
    };

    // Save to localStorage directly so it persists even if AbsensiSiswa is closed
    try {
      const storageKey = getStorageKey('guru_attendance');
      const savedAttendance = localStorage.getItem(storageKey);
      const parsedAttendance = savedAttendance ? JSON.parse(savedAttendance) : {};
      
      const key = `${dateStr}_${targetClass}`;
      const newData = {
        ...parsedAttendance,
        [key]: {
          ...(parsedAttendance[key] || {}),
          [student.id]: {
            ...(parsedAttendance[key]?.[student.id] || {}),
            status: 'Hadir'
          }
        }
      };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      // Dispatch event for other tabs/components
      window.dispatchEvent(new Event('attendanceUpdated'));
    } catch (e) {
      console.error('Failed to save attendance locally', e);
    }

    if (socketRef.current) {
      socketRef.current.emit('student:attendance', attendanceData);
    }
    
    setRecentAttendance(prev => [attendanceData, ...prev].slice(0, 5));
    setStatus('success');
    setScanResult(student);
    
    setTimeout(() => {
      setScanResult(null);
      setStatus('scanning');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Scanner */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 bg-primary text-white text-center">
            <h1 className="text-xl font-bold">Kios Absensi Mandiri</h1>
            <p className="text-sm opacity-80">Tunjukkan Kartu Siswa ke Kamera</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pilih Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                >
                  {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                {!isCameraStarted ? (
                  <button 
                    onClick={startCamera}
                    className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">videocam</span>
                    Mulai Kamera
                  </button>
                ) : (
                  <button 
                    onClick={stopCamera}
                    className="w-full py-2 bg-red-100 text-red-600 text-sm font-bold rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">videocam_off</span>
                    Stop Kamera
                  </button>
                )}
              </div>
            </div>

            <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border-2 border-primary/20">
              <div id="reader" className="w-full h-full"></div>
              
              {!isCameraStarted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <span className="material-symbols-outlined text-5xl mb-2">photo_camera</span>
                  <p className="text-sm">Klik tombol "Mulai Kamera" untuk memulai pemindaian</p>
                </div>
              )}

              {status === 'submitting' && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {status === 'success' && scanResult && (
                <div className="absolute inset-0 bg-green-500/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white animate-in zoom-in duration-300">
                  <span className="material-symbols-outlined text-6xl mb-2">check_circle</span>
                  <div className="text-xl font-bold">{scanResult.name}</div>
                  <div className="text-sm opacity-90">Berhasil Absen!</div>
                </div>
              )}

              {status === 'error' && (
                <div className="absolute inset-0 bg-red-500/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white animate-in shake duration-300">
                  <span className="material-symbols-outlined text-6xl mb-2">error</span>
                  <div className="px-6 text-center text-sm font-medium">{errorMessage}</div>
                  <button 
                    onClick={() => setStatus('scanning')}
                    className="mt-4 px-4 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Absensi Terkini
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Daftar siswa yang baru saja melakukan absen</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto max-h-[400px]">
            {recentAttendance.length > 0 ? (
              <div className="space-y-4">
                {recentAttendance.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl animate-in slide-in-from-right-4 duration-500">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{item.studentName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {item.class}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Hadir</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                <span className="material-symbols-outlined text-5xl">qr_code_scanner</span>
                <p className="text-sm">Belum ada aktivitas absensi</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/30 text-center border-t border-gray-100 dark:border-gray-700">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Status Sistem</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Terhubung Real-time</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-xs">
        &copy; 2026 Platform Admin Guru • Kios Absensi Mandiri
      </div>
    </div>
  );
};

export default AbsensiMandiri;
