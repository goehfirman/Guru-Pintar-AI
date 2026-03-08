import React, { useState, useEffect } from 'react';
import { getStorageKey } from '../utils/academic';

const initialStudents = [
  { id: '1001', name: 'Ahmad Fauzi', class: 'X IPA 1', status: 'Aktif' },
  { id: '1002', name: 'Budi Santoso', class: 'X IPA 1', status: 'Aktif' },
  { id: '1003', name: 'Citra Lestari', class: 'X IPA 1', status: 'Aktif' },
  { id: '1004', name: 'Dewi Ayu', class: 'X IPA 1', status: 'Aktif' },
  { id: '1005', name: 'Eko Prasetyo', class: 'X IPA 1', status: 'Aktif' },
  { id: '1006', name: 'Fina Melati', class: 'X IPA 2', status: 'Aktif' },
  { id: '1007', name: 'Gilang Ramadhan', class: 'X IPA 2', status: 'Aktif' },
];

const PenilaianSiswa: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('X IPA 1');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [availableClasses, setAvailableClasses] = useState<string[]>(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2']);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Pendidikan Agama Islam', 
    'Pendidikan Pancasila', 
    'Bahasa Indonesia', 
    'Matematika', 
    'IPAS', 
    'PJOK', 
    'Seni Budaya', 
    'Bahasa Inggris', 
    'PLBJ', 
    'Koding dan Kecerdasan Artifisial'
  ]);
  
  const [allStudents, setAllStudents] = useState<any[]>(initialStudents);
  const [gradesData, setGradesData] = useState<Record<string, any>>({});

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

    // Load Subjects
    const savedSubjects = localStorage.getItem(getStorageKey('guru_subjects'));
    if (savedSubjects) {
      try {
        const parsedSubjects = JSON.parse(savedSubjects);
        if (parsedSubjects.length > 0) {
          const subjectNames = parsedSubjects.map((s: any) => s.name);
          setAvailableSubjects(subjectNames);
          if (!subjectNames.includes(selectedSubject)) {
            setSelectedSubject(subjectNames[0]);
          }
        }
      } catch (e) {}
    }

    // Load Students
    const savedStudents = localStorage.getItem(getStorageKey('guru_students'));
    if (savedStudents) {
      try {
        const parsedStudents = JSON.parse(savedStudents);
        if (parsedStudents.length > 0) {
          setAllStudents(parsedStudents);
        }
      } catch (e) {}
    }

    // Load Grades
    const savedGrades = localStorage.getItem(getStorageKey('guru_grades'));
    if (savedGrades) {
      try {
        setGradesData(JSON.parse(savedGrades));
      } catch (e) {}
    } else {
      setGradesData({});
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('classesUpdated', loadData);
    window.addEventListener('studentsUpdated', loadData);
    window.addEventListener('subjectsUpdated', loadData);
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('classesUpdated', loadData);
      window.removeEventListener('studentsUpdated', loadData);
      window.removeEventListener('subjectsUpdated', loadData);
    };
  }, []);

  const currentStudents = allStudents.filter(s => s.class === selectedClass && s.status === 'Aktif');
  
  const getGradesKey = () => `Year_${selectedClass}_${selectedSubject}`;
  
  const currentGrades = gradesData[getGradesKey()] || {};

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    const numValue = value === '' ? '' : Number(value);
    const key = getGradesKey();
    setGradesData(prev => {
      const newData = {
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          [studentId]: {
            ...(prev[key]?.[studentId] || { tugas1: 0, tugas2: 0, uh1: 0, pts: 0, pas: 0 }),
            [field]: numValue
          }
        }
      };
      localStorage.setItem(getStorageKey('guru_grades'), JSON.stringify(newData));
      return newData;
    });
  };

  const saveGrades = () => {
    localStorage.setItem(getStorageKey('guru_grades'), JSON.stringify(gradesData));
    alert('Data nilai berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Penilaian Siswa</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola nilai tugas, ulangan, dan ujian siswa</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">upload</span>
            Import Nilai
          </button>
          <button onClick={saveGrades} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined">save</span>
            Simpan Nilai
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
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
            >
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors">
              <span className="material-symbols-outlined text-sm">add_column_right</span>
              Tambah Kolom Nilai
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium w-16" rowSpan={2}>No</th>
                <th scope="col" className="px-6 py-4 font-medium w-32" rowSpan={2}>NISN</th>
                <th scope="col" className="px-6 py-4 font-medium" rowSpan={2}>Nama Lengkap</th>
                <th scope="col" className="px-6 py-2 font-medium text-center border-b border-gray-200 dark:border-border-dark" colSpan={2}>Tugas Harian</th>
                <th scope="col" className="px-6 py-2 font-medium text-center border-b border-gray-200 dark:border-border-dark" colSpan={1}>Ulangan Harian</th>
                <th scope="col" className="px-6 py-2 font-medium text-center border-b border-gray-200 dark:border-border-dark" colSpan={2}>Ujian Semester</th>
                <th scope="col" className="px-6 py-4 font-medium text-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" rowSpan={2}>Nilai Akhir</th>
              </tr>
              <tr>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">Tgs 1</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">Tgs 2</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">UH 1</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">PTS</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">PAS</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student, index) => {
                  const sGrades = currentGrades[student.id] || { tugas1: 0, tugas2: 0, uh1: 0, pts: 0, pas: 0 };
                  const t1 = Number(sGrades.tugas1) || 0;
                  const t2 = Number(sGrades.tugas2) || 0;
                  const uh1 = Number(sGrades.uh1) || 0;
                  const pts = Number(sGrades.pts) || 0;
                  const pas = Number(sGrades.pas) || 0;
                  
                  // Simple average calculation, can be adjusted based on weight
                  const totalComponents = (pas > 0 ? 5 : 4);
                  const sum = t1 + t2 + uh1 + pts + pas;
                  const nilaiAkhir = Math.round(sum / totalComponents);
                  
                  return (
                    <tr key={student.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.nisn || student.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.name}</td>
                      <td className="px-4 py-2 border-l border-gray-200 dark:border-border-dark">
                        <input type="number" value={sGrades.tugas1 === 0 && !sGrades.tugas1_edited ? '' : sGrades.tugas1} onChange={(e) => handleGradeChange(student.id, 'tugas1', e.target.value)} className="w-16 px-2 py-1 text-center border border-gray-200 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" />
                      </td>
                      <td className="px-4 py-2 border-l border-gray-200 dark:border-border-dark">
                        <input type="number" value={sGrades.tugas2 === 0 && !sGrades.tugas2_edited ? '' : sGrades.tugas2} onChange={(e) => handleGradeChange(student.id, 'tugas2', e.target.value)} className="w-16 px-2 py-1 text-center border border-gray-200 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" />
                      </td>
                      <td className="px-4 py-2 border-l border-gray-200 dark:border-border-dark">
                        <input type="number" value={sGrades.uh1 === 0 && !sGrades.uh1_edited ? '' : sGrades.uh1} onChange={(e) => handleGradeChange(student.id, 'uh1', e.target.value)} className="w-16 px-2 py-1 text-center border border-gray-200 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" />
                      </td>
                      <td className="px-4 py-2 border-l border-gray-200 dark:border-border-dark">
                        <input type="number" value={sGrades.pts === 0 && !sGrades.pts_edited ? '' : sGrades.pts} onChange={(e) => handleGradeChange(student.id, 'pts', e.target.value)} className="w-16 px-2 py-1 text-center border border-gray-200 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" />
                      </td>
                      <td className="px-4 py-2 border-l border-gray-200 dark:border-border-dark">
                        <input type="number" value={sGrades.pas === 0 && !sGrades.pas_edited ? '' : sGrades.pas} onChange={(e) => handleGradeChange(student.id, 'pas', e.target.value)} placeholder="-" className="w-16 px-2 py-1 text-center border border-gray-200 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" />
                      </td>
                      <td className="px-6 py-4 font-bold text-center text-blue-700 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400">
                        {nilaiAkhir || 0}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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

export default PenilaianSiswa;
