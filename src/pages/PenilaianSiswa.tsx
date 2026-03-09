import React, { useState, useEffect } from 'react';
import { getStorageKey } from '../utils/academic';

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
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [gradesData, setGradesData] = useState<Record<string, any>>({});
  const [extraColumns, setExtraColumns] = useState<Record<string, {id: string, name: string}[]>>({});
  const [weights, setWeights] = useState<Record<string, Record<string, number>>>({});
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isManageColumnsModalOpen, setIsManageColumnsModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

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
        const targetClass = studentClasses.length > 0 ? studentClasses[0] : combinedClasses[0];
        setSelectedClass(targetClass);
      }
    } else {
      setAvailableClasses(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2']);
    }

    // Load Subjects
    const savedSubjects = localStorage.getItem(getStorageKey('guru_subjects'));
    if (savedSubjects) {
      try {
        const parsedSubjects = JSON.parse(savedSubjects);
        if (parsedSubjects.length > 0) {
          const subjectNames = parsedSubjects.map((s: any) => s.name);
          setAvailableSubjects(subjectNames);
          if (!selectedSubject || !subjectNames.includes(selectedSubject)) {
            setSelectedSubject(subjectNames[0]);
          }
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

    // Load Extra Columns
    const savedExtraColumns = localStorage.getItem(getStorageKey('guru_extra_columns'));
    if (savedExtraColumns) {
      try {
        setExtraColumns(JSON.parse(savedExtraColumns));
      } catch (e) {}
    } else {
      setExtraColumns({});
    }

    // Load Weights
    const savedWeights = localStorage.getItem(getStorageKey('guru_grade_weights'));
    if (savedWeights) {
      try {
        setWeights(JSON.parse(savedWeights));
      } catch (e) {}
    } else {
      setWeights({});
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

  const currentStudents = allStudents.filter(s => 
    s.class?.toString().trim() === selectedClass?.toString().trim() && 
    (s.status?.toString().toLowerCase() === 'aktif' || !s.status)
  );
  
  const getGradesKey = () => `Year_${selectedClass}_${selectedSubject}`;
  
  const currentGrades = gradesData[getGradesKey()] || {};
  const currentExtraColumns = extraColumns[getGradesKey()] || [];
  const currentWeights = weights[getGradesKey()] || {
    tugas1: 1, tugas2: 1, uh1: 1, pts: 1, pas: 1
  };

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
            [field]: numValue,
            [`${field}_edited`]: true
          }
        }
      };
      localStorage.setItem(getStorageKey('guru_grades'), JSON.stringify(newData));
      return newData;
    });
  };

  const addExtraColumn = () => {
    if (!newColumnName.trim()) return;
    
    const key = getGradesKey();
    const columnId = `extra_${Date.now()}`;
    const newCol = { id: columnId, name: newColumnName.trim() };
    
    setExtraColumns(prev => {
      const newData = {
        ...prev,
        [key]: [...(prev[key] || []), newCol]
      };
      localStorage.setItem(getStorageKey('guru_extra_columns'), JSON.stringify(newData));
      return newData;
    });
    
    setNewColumnName('');
    setIsAddColumnModalOpen(false);
  };

  const removeExtraColumn = (columnId: string) => {
    const key = getGradesKey();
    const updatedCols = (extraColumns[key] || []).filter(c => c.id !== columnId);
    const newExtraColumns = {
      ...extraColumns,
      [key]: updatedCols
    };
    setExtraColumns(newExtraColumns);
    localStorage.setItem(getStorageKey('guru_extra_columns'), JSON.stringify(newExtraColumns));
  };

  const removeAllExtraColumns = () => {
    const key = getGradesKey();
    const newExtraColumns = {
      ...extraColumns,
      [key]: []
    };
    setExtraColumns(newExtraColumns);
    localStorage.setItem(getStorageKey('guru_extra_columns'), JSON.stringify(newExtraColumns));
    setIsManageColumnsModalOpen(false);
  };

  const handleWeightChange = (field: string, value: number) => {
    const key = getGradesKey();
    setWeights(prev => {
      const newData = {
        ...prev,
        [key]: {
          ...(prev[key] || { tugas1: 1, tugas2: 1, uh1: 1, pts: 1, pas: 1 }),
          [field]: value
        }
      };
      localStorage.setItem(getStorageKey('guru_grade_weights'), JSON.stringify(newData));
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
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">refresh</span>
            Muat Ulang
          </button>
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
            <button 
              onClick={() => setIsWeightModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">settings_input_component</span>
              Atur Bobot
            </button>
            <button 
              onClick={() => setIsAddColumnModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add_column_right</span>
              Tambah Kolom
            </button>
            {currentExtraColumns.length > 0 && (
              <button 
                onClick={() => setIsManageColumnsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Hapus Kolom
              </button>
            )}
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
                {currentExtraColumns.length > 0 && (
                  <th scope="col" className="px-6 py-2 font-medium text-center border-b border-gray-200 dark:border-border-dark" colSpan={currentExtraColumns.length}>Nilai Tambahan</th>
                )}
                <th scope="col" className="px-6 py-4 font-medium text-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" rowSpan={2}>Nilai Akhir</th>
              </tr>
              <tr>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">Tgs 1</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">Tgs 2</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">UH 1</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">PTS</th>
                <th scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark">PAS</th>
                {currentExtraColumns.map(col => (
                  <th key={col.id} scope="col" className="px-4 py-2 font-medium text-center border-l border-gray-200 dark:border-border-dark group relative min-w-[100px]">
                    <div className="flex items-center justify-center gap-2">
                      <span className="truncate max-w-[80px]">{col.name}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExtraColumn(col.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Hapus Kolom"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  </th>
                ))}
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
                  
                  let weightedSum = 0;
                  let totalWeight = 0;

                  // Base components
                  const components = [
                    { val: t1, weight: currentWeights.tugas1 || 1 },
                    { val: t2, weight: currentWeights.tugas2 || 1 },
                    { val: uh1, weight: currentWeights.uh1 || 1 },
                    { val: pts, weight: currentWeights.pts || 1 },
                    { val: pas, weight: currentWeights.pas || 1 },
                  ];

                  components.forEach(c => {
                    weightedSum += c.val * c.weight;
                    totalWeight += c.weight;
                  });

                  // Extra columns
                  currentExtraColumns.forEach(col => {
                    const val = Number(sGrades[col.id]) || 0;
                    const weight = currentWeights[col.id] || 1;
                    weightedSum += val * weight;
                    totalWeight += weight;
                  });

                  const nilaiAkhir = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
                  
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
                      {currentExtraColumns.map(col => (
                        <td key={col.id} className="px-4 py-2 border-l border-gray-200 dark:border-border-dark">
                          <input 
                            type="number" 
                            value={sGrades[col.id] === 0 && !sGrades[`${col.id}_edited`] ? '' : sGrades[col.id]} 
                            onChange={(e) => handleGradeChange(student.id, col.id, e.target.value)} 
                            className="w-16 px-2 py-1 text-center border border-gray-200 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" 
                          />
                        </td>
                      ))}
                      <td className="px-6 py-4 font-bold text-center text-blue-700 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400">
                        {nilaiAkhir || 0}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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

      {/* Modal Tambah Kolom */}
      {isAddColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Kolom Nilai</h3>
              <button onClick={() => setIsAddColumnModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kolom (Contoh: Tugas 3, Kuis, dll)</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Masukkan nama kolom..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && addExtraColumn()}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsAddColumnModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={addExtraColumn}
                className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
              >
                Tambah Kolom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kelola/Hapus Kolom */}
      {isManageColumnsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Kolom Nilai</h3>
              <button onClick={() => setIsManageColumnsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Pilih kolom tambahan yang ingin Anda hapus dari mata pelajaran <strong>{selectedSubject}</strong> di kelas <strong>{selectedClass}</strong>.
              </p>
              
              {currentExtraColumns.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                  {currentExtraColumns.map(col => (
                    <div key={col.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50">
                      <span className="font-medium text-gray-900 dark:text-white">{col.name}</span>
                      <button 
                        onClick={() => removeExtraColumn(col.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada kolom tambahan untuk dihapus.
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setIsManageColumnsModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
              >
                Selesai
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={removeAllExtraColumns}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                Hapus Semua Kolom Tambahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atur Bobot */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pengaturan Bobot Nilai</h3>
              <button onClick={() => setIsWeightModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tentukan bobot untuk setiap komponen penilaian. Nilai akhir dihitung berdasarkan rata-rata tertimbang.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Komponen Utama</h4>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Tugas 1</label>
                  <input type="number" min="1" value={currentWeights.tugas1 || 1} onChange={(e) => handleWeightChange('tugas1', Number(e.target.value))} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Tugas 2</label>
                  <input type="number" min="1" value={currentWeights.tugas2 || 1} onChange={(e) => handleWeightChange('tugas2', Number(e.target.value))} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300">UH 1</label>
                  <input type="number" min="1" value={currentWeights.uh1 || 1} onChange={(e) => handleWeightChange('uh1', Number(e.target.value))} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">&nbsp;</h4>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300">PTS</label>
                  <input type="number" min="1" value={currentWeights.pts || 1} onChange={(e) => handleWeightChange('pts', Number(e.target.value))} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300">PAS</label>
                  <input type="number" min="1" value={currentWeights.pas || 1} onChange={(e) => handleWeightChange('pas', Number(e.target.value))} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
            </div>

            {currentExtraColumns.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Kolom Tambahan</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {currentExtraColumns.map(col => (
                    <div key={col.id} className="flex items-center justify-between gap-4">
                      <label className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{col.name}</label>
                      <input type="number" min="1" value={currentWeights[col.id] || 1} onChange={(e) => handleWeightChange(col.id, Number(e.target.value))} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenilaianSiswa;
