import React, { useState, useEffect } from 'react';
import { getStorageKey } from '../utils/academic';

const AbsensiSiswa: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('X IPA 1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [availableClasses, setAvailableClasses] = useState<string[]>(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2']);
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});

  const loadData = () => {
    // Load Classes
    const savedClasses = localStorage.getItem(getStorageKey('guru_classes'));
    if (savedClasses) {
      try {
        const parsedClasses = JSON.parse(savedClasses);
        if (parsedClasses.length > 0) {
          const classNames = parsedClasses.map((c: any) => c.name);
          setAvailableClasses(classNames);
          if (!classNames.includes(selectedClass)) {
            setSelectedClass(classNames[0]);
          }
        }
      } catch (e) {}
    }

    // Load Students
    const savedStudents = localStorage.getItem(getStorageKey('guru_students'));
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        setAllStudents(parsedStudents || []);
      } catch (e) {
        setAllStudents([]);
      }
    } else {
      setAllStudents([]);
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
    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('classesUpdated', loadData);
    window.addEventListener('studentsUpdated', loadData);
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('classesUpdated', loadData);
      window.removeEventListener('studentsUpdated', loadData);
    };
  }, []);

  const currentStudents = allStudents.filter(s => s.class === selectedClass && s.status === 'Aktif');
  
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

  // Calculate stats
  let hadir = 0, sakit = 0, izin = 0, alpa = 0;
  currentStudents.forEach(student => {
    const status = currentAttendance[student.id]?.status || 'Hadir'; // Default Hadir
    if (status === 'Hadir') hadir++;
    else if (status === 'Sakit') sakit++;
    else if (status === 'Izin') izin++;
    else if (status === 'Alpa') alpa++;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Absensi Siswa</h1>
          <p className="text-gray-500 dark:text-gray-400">Rekapitulasi kehadiran siswa per pertemuan</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">download</span>
            Export Rekap
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
                  const status = currentAttendance[student.id]?.status || 'Hadir';
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada siswa aktif di kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AbsensiSiswa;
