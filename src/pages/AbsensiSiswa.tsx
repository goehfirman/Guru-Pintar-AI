import React, { useState, useEffect, useRef } from 'react';
import { getStorageKey } from '../utils/academic';
import { getUserProfile } from '../utils/userProfile';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const AbsensiSiswa: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('X IPA 1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isRekapModalOpen, setIsRekapModalOpen] = useState(false);
  const [rekapStartDate, setRekapStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [rekapEndDate, setRekapEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [availableClasses, setAvailableClasses] = useState<string[]>(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2']);
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  
  const socketRef = useRef<any>(null);

  const loadData = () => {
    // Load Students first to get classes from data
    const savedStudents = localStorage.getItem(getStorageKey('guru_students'));
    let students: any[] = [];
    if (savedStudents) {
      try {
        students = JSON.parse(savedStudents) || [];
        setAllStudents(students);
      } catch (e) {
        setAllStudents([]);
      }
    } else {
      setAllStudents([]);
    }

    // Load Classes
    const savedClasses = localStorage.getItem(getStorageKey('guru_classes'));
    let classNames: string[] = [];
    if (savedClasses) {
      try {
        const parsedClasses = JSON.parse(savedClasses);
        if (parsedClasses.length > 0) {
          classNames = parsedClasses.map((c: any) => c.name);
        }
      } catch (e) {}
    }

    // If no classes defined in settings, or to ensure all student classes are available
    const studentClasses = Array.from(new Set(students.map(s => s.class))).filter(Boolean) as string[];
    const combinedClasses = Array.from(new Set([...classNames, ...studentClasses]));
    
    if (combinedClasses.length > 0) {
      setAvailableClasses(combinedClasses);
      
      // Smart selection: 
      // 1. If current selectedClass is not in combinedClasses, pick the first one.
      // 2. If current selectedClass has no students, but others do, pick the first one that has students.
      const currentClassHasStudents = students.some(s => 
        s.class?.toString().trim() === selectedClass?.toString().trim() && 
        (s.status?.toString().toLowerCase() === 'aktif' || !s.status)
      );
      
      if (!combinedClasses.includes(selectedClass) || (!currentClassHasStudents && studentClasses.length > 0)) {
        // Pick the first class from studentClasses if available, otherwise first from combined
        const targetClass = studentClasses.length > 0 ? studentClasses[0] : combinedClasses[0];
        setSelectedClass(targetClass);
      }
    } else {
      setAvailableClasses(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2']);
    }

    // Load Attendance
    const savedAttendance = localStorage.getItem(getStorageKey('guru_attendance'));
    if (savedAttendance) {
      try {
        setAttendanceData(JSON.parse(savedAttendance));
      } catch (e) {}
    } else {
      setAttendanceData({});
    }
  };

  useEffect(() => {
    loadData();
    
    // Initialize socket
    socketRef.current = io();
    
    socketRef.current.on('attendance:update', (data) => {
      // Check if the update is for the current class and date
      if (data.class === selectedClass && data.date === selectedDate) {
        handleStatusChange(data.studentId, data.status);
      }
    });

    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('classesUpdated', loadData);
    window.addEventListener('studentsUpdated', loadData);
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('classesUpdated', loadData);
      window.removeEventListener('studentsUpdated', loadData);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedClass, selectedDate]);

  const currentStudents = allStudents.filter(s => 
    s.class?.toString().trim() === selectedClass?.toString().trim() && 
    (s.status?.toString().toLowerCase() === 'aktif' || !s.status)
  );
  
  const getAttendanceKey = () => `${selectedDate}_${selectedClass}`;
  
  const currentAttendance = attendanceData[getAttendanceKey()] || {};

  const handleStatusChange = (studentId: string, status: string) => {
    const key = getAttendanceKey();
    setAttendanceData(prev => {
      const newData = {
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          [studentId]: {
            ...(prev[key]?.[studentId] || {}),
            status
          }
        }
      };
      localStorage.setItem(getStorageKey('guru_attendance'), JSON.stringify(newData));
      return newData;
    });
  };

  const handleNoteChange = (studentId: string, note: string) => {
    const key = getAttendanceKey();
    setAttendanceData(prev => {
      const newData = {
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          [studentId]: {
            ...(prev[key]?.[studentId] || {}),
            note
          }
        }
      };
      localStorage.setItem(getStorageKey('guru_attendance'), JSON.stringify(newData));
      return newData;
    });
  };

  const saveAttendance = () => {
    localStorage.setItem(getStorageKey('guru_attendance'), JSON.stringify(attendanceData));
    alert('Data absensi berhasil disimpan!');
  };

  const downloadRekapPdf = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const profile = getUserProfile();
    const today = new Date();
    const formattedToday = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const start = new Date(rekapStartDate);
    const end = new Date(rekapEndDate);
    const formattedStart = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedEnd = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    doc.setFontSize(16);
    doc.text(`Rekapitulasi Absensi Siswa`, 148, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Kelas: ${selectedClass}`, 148, 22, { align: 'center' });
    doc.text(`Periode: ${formattedStart} s/d ${formattedEnd}`, 148, 28, { align: 'center' });

    // Aggregate data
    const summary: Record<string, any> = {};
    currentStudents.forEach(s => {
      summary[s.id] = { name: s.name, nisn: s.nisn || '-', hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    });

    // Iterate through dates in range
    const d = new Date(start);
    while (d <= end) {
      const dateStr = d.toISOString().split('T')[0];
      const key = `${dateStr}_${selectedClass}`;
      const dayAttendance = attendanceData[key] || {};
      
      currentStudents.forEach(s => {
        const status = dayAttendance[s.id]?.status || '';
        if (status === 'Hadir') summary[s.id].hadir++;
        else if (status === 'Sakit') summary[s.id].sakit++;
        else if (status === 'Izin') summary[s.id].izin++;
        else if (status === 'Alpa') summary[s.id].alpa++;
      });
      
      d.setDate(d.getDate() + 1);
    }

    const tableBody = currentStudents.map((s, i) => [
      i + 1,
      summary[s.id].nisn,
      summary[s.id].name,
      summary[s.id].hadir,
      summary[s.id].sakit,
      summary[s.id].izin,
      summary[s.id].alpa,
      `${Math.round((summary[s.id].hadir / (summary[s.id].hadir + summary[s.id].sakit + summary[s.id].izin + summary[s.id].alpa)) * 100)}%`
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['No', 'NISN', 'Nama Lengkap', 'H', 'S', 'I', 'A', '% Kehadiran']],
      body: tableBody,
      headStyles: { fillColor: [30, 63, 174] },
      styles: { fontSize: 9 }
    });

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 20;
    if (finalY > 160) {
      doc.addPage();
      finalY = 20;
    }

    const signatureX = 210;
    doc.setFontSize(10);
    doc.text(`${profile.birthPlace || 'Jakarta'}, ${formattedToday}`, signatureX, finalY);
    doc.text(`Guru Kelas,`, signatureX, finalY + 5);
    
    if (profile.signatureUrl) {
      try {
        doc.addImage(profile.signatureUrl, 'PNG', signatureX, finalY + 10, 40, 20);
      } catch (e) {
        console.error('Error adding signature to PDF', e);
      }
    }
    
    const nameY = profile.signatureUrl ? finalY + 35 : finalY + 30;
    doc.setFont(undefined, 'bold');
    doc.text(profile.fullName, signatureX, nameY);
    doc.setFont(undefined, 'normal');
    doc.text(`NIP. ${profile.nip}`, signatureX, nameY + 5);

    doc.save(`Rekap_Absensi_${selectedClass}_${rekapStartDate}_to_${rekapEndDate}.pdf`);
    setIsRekapModalOpen(false);
  };

  // Calculate stats
  let hadir = 0, sakit = 0, izin = 0, alpa = 0, kosong = 0;
  currentStudents.forEach(student => {
    const status = currentAttendance[student.id]?.status || ''; // Default empty
    if (status === 'Hadir') hadir++;
    else if (status === 'Sakit') sakit++;
    else if (status === 'Izin') izin++;
    else if (status === 'Alpa') alpa++;
    else kosong++;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Absensi Siswa</h1>
          <p className="text-gray-500 dark:text-gray-400">Rekapitulasi kehadiran siswa per pertemuan</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">refresh</span>
            Muat Ulang
          </button>
          <button onClick={() => window.open('/#/absensi-mandiri', '_blank')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Buka Kios Absensi
          </button>
          <button onClick={() => setIsRekapModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Cetak Rekap
          </button>
          <button onClick={saveAttendance} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined">save</span>
            Simpan Absensi
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
            >
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-2 px-4 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Belum: {kosong}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Hadir: {hadir}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Sakit: {sakit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Izin: {izin}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Alpa: {alpa}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium w-16">No</th>
                <th scope="col" className="px-6 py-4 font-medium w-32">NISN</th>
                <th scope="col" className="px-6 py-4 font-medium">Nama Lengkap</th>
                <th scope="col" className="px-6 py-4 font-medium text-center">Status Kehadiran</th>
                <th scope="col" className="px-6 py-4 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student, index) => {
                  const status = currentAttendance[student.id]?.status || '';
                  const note = currentAttendance[student.id]?.note || '';
                  
                  return (
                    <tr key={student.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.nisn || student.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`status-${student.id}`} value="Hadir" checked={status === 'Hadir'} onChange={() => handleStatusChange(student.id, 'Hadir')} className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">H</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer ml-3">
                            <input type="radio" name={`status-${student.id}`} value="Sakit" checked={status === 'Sakit'} onChange={() => handleStatusChange(student.id, 'Sakit')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">S</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer ml-3">
                            <input type="radio" name={`status-${student.id}`} value="Izin" checked={status === 'Izin'} onChange={() => handleStatusChange(student.id, 'Izin')} className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">I</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer ml-3">
                            <input type="radio" name={`status-${student.id}`} value="Alpa" checked={status === 'Alpa'} onChange={() => handleStatusChange(student.id, 'Alpa')} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">A</span>
                          </label>
                          <button 
                            onClick={() => handleStatusChange(student.id, '')} 
                            className={`ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${status === '' ? 'text-gray-400 opacity-50 cursor-not-allowed' : 'text-gray-500'}`}
                            disabled={status === ''}
                            title="Reset (Kosongkan)"
                          >
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          placeholder="Tambahkan catatan..."
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-20">person_off</span>
                      {allStudents.length === 0 ? (
                        <p>Belum ada data siswa di sistem. Silakan isi data di menu <strong>Data Siswa</strong>.</p>
                      ) : (
                        <p>Tidak ada siswa aktif di kelas <strong>{selectedClass}</strong>.</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rekap Absen */}
      {isRekapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cetak Rekap Absensi</h3>
              <button onClick={() => setIsRekapModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 text-sm text-blue-800 bg-blue-50 rounded-lg dark:bg-blue-900/30 dark:text-blue-300">
                Pilih rentang waktu untuk merekap kehadiran siswa kelas <strong>{selectedClass}</strong>.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={rekapStartDate}
                    onChange={(e) => setRekapStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={rekapEndDate}
                    onChange={(e) => setRekapEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsRekapModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={downloadRekapPdf}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Cetak PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsensiSiswa;
