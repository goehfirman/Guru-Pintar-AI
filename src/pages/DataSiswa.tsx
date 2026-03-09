import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getStorageKey } from '../utils/academic';
import { getUserProfile } from '../utils/userProfile';
import { getSchoolProfile } from '../utils/schoolProfile';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeCanvas } from 'qrcode.react';

const initialStudents: any[] = [];

const DataSiswa: React.FC = () => {
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [availableClasses, setAvailableClasses] = useState<string[]>(['X IPA 1', 'X IPA 2', 'X IPS 1']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    const savedStudents = localStorage.getItem(getStorageKey('guru_students'));
    if (savedStudents) {
      try {
        setStudentsList(JSON.parse(savedStudents));
      } catch (e) {
        setStudentsList(initialStudents);
      }
    } else {
      setStudentsList(initialStudents);
    }

    const savedClasses = localStorage.getItem(getStorageKey('guru_classes'));
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses);
        if (parsed.length > 0) {
          setAvailableClasses(parsed.map((c: any) => c.name));
        } else {
          setAvailableClasses(['X IPA 1', 'X IPA 2', 'X IPS 1']);
        }
      } catch (e) {}
    } else {
      setAvailableClasses(['X IPA 1', 'X IPA 2', 'X IPS 1']);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('classesUpdated', loadData);
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('classesUpdated', loadData);
    };
  }, []);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'add' | 'edit' | 'detail' | 'delete' | 'import';
    student?: any;
  }>({ isOpen: false, type: 'add' });

  const [formData, setFormData] = useState({
    nisn: '',
    name: '',
    class: 'X IPA 1',
    gender: 'L',
    status: 'Aktif'
  });

  const filteredStudents = studentsList.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.nisn.includes(searchTerm);
    const matchesClass = selectedClass === 'Semua Kelas' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleDownloadFormat = () => {
    const csvContent = "NISN,Nama Lengkap,Kelas,L/P,Status\n0012345678,Contoh Nama,X IPA 1,L,Aktif";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "format_import_siswa.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const headers = "No,NISN,Nama Lengkap,Kelas,L/P,Status\n";
    const rows = filteredStudents.map((s, i) => `${i + 1},${s.nisn},${s.name},${s.class},${s.gender},${s.status}`).join("\n");
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data_siswa.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    // ... existing handleExportPdf ...
  };

  const handleCetakKartu = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const profile = getUserProfile();
    const school = getSchoolProfile();
    
    doc.setFontSize(16);
    doc.text(`Kartu Absensi Siswa - ${selectedClass}`, 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Gunakan kartu ini untuk melakukan absensi mandiri`, 105, 22, { align: 'center' });

    const cardWidth = 90;
    const cardHeight = 55;
    const margin = 10;
    const gap = 5;
    
    let x = margin;
    let y = 30;

    for (let i = 0; i < filteredStudents.length; i++) {
      const student = filteredStudents[i];
      
      // Draw card border
      doc.setDrawColor(200);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3);
      
      // Header kartu
      doc.setFillColor(30, 63, 174);
      doc.roundedRect(x, y, cardWidth, 12, 3, 3, 'F');
      doc.setTextColor(255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(school.name || 'KARTU ABSENSI SISWA', x + cardWidth/2, y + 8, { align: 'center' });
      
      // Student Info
      doc.setTextColor(0);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(student.name.toUpperCase(), x + 5, y + 20);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text(`NISN: ${student.nisn}`, x + 5, y + 25);
      doc.text(`Kelas: ${student.class}`, x + 5, y + 29);
      
      // QR Code
      const canvas = document.createElement('canvas');
      const qrValue = JSON.stringify({ type: 'student_id', id: student.id, nisn: student.nisn, name: student.name });
      
      // We need to wait for QR to be drawn if we were using a library that's async, 
      // but qrcode.react is a component. Let's use a simpler approach or a helper.
      // Since we can't easily render a React component to a dataURL here without mounting,
      // I'll use a trick: I'll add a hidden QR component to the page and use its canvas.
      
      const qrCanvas = document.getElementById(`qr-gen-${student.id}`) as HTMLCanvasElement;
      if (qrCanvas) {
        const qrDataUrl = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', x + cardWidth - 35, y + 15, 30, 30);
      }

      doc.setFontSize(6);
      doc.setTextColor(150);
      doc.text('Scan untuk Absensi', x + cardWidth - 20, y + 48, { align: 'center' });

      // Update coordinates for next card
      x += cardWidth + gap;
      if (x + cardWidth > 210) {
        x = margin;
        y += cardHeight + gap;
      }
      
      if (y + cardHeight > 297 - margin) {
        if (i < filteredStudents.length - 1) {
          doc.addPage();
          y = margin;
          x = margin;
        }
      }
    }

    doc.save(`Kartu_Absensi_${selectedClass}.pdf`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          if (data.length > 0) {
            // Intelligent mapping
            const headers = Object.keys(data[0] as object);
            
            // Find columns based on keywords
            const nisnCol = headers.find(h => h.toLowerCase().includes('nisn') || h.toLowerCase().includes('induk')) || '';
            const nameCol = headers.find(h => h.toLowerCase().includes('nama') || h.toLowerCase().includes('name') || h.toLowerCase().includes('siswa')) || '';
            const classCol = headers.find(h => h.toLowerCase().includes('kelas') || h.toLowerCase().includes('rombel') || h.toLowerCase().includes('tingkat')) || '';
            const genderCol = headers.find(h => h.toLowerCase().includes('l/p') || h.toLowerCase().includes('jk') || h.toLowerCase().includes('jenis kelamin') || h.toLowerCase().includes('gender')) || '';
            const statusCol = headers.find(h => h.toLowerCase().includes('status') || h.toLowerCase().includes('keterangan')) || '';

            const newStudents = data.map((row: any) => {
              // Parse gender
              let gender = 'L';
              const rawGender = row[genderCol]?.toString().toLowerCase() || '';
              if (rawGender.startsWith('p') || rawGender === 'perempuan' || rawGender === 'female') {
                gender = 'P';
              }

              // Parse status
              let status = 'Aktif';
              const rawStatus = row[statusCol]?.toString().toLowerCase() || '';
              if (rawStatus.includes('pindah')) status = 'Pindah';
              if (rawStatus.includes('keluar')) status = 'Keluar';

              return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                nisn: row[nisnCol]?.toString() || '005' + Math.floor(Math.random() * 10000000),
                name: row[nameCol]?.toString() || '',
                class: row[classCol]?.toString() || 'X IPA 1',
                gender,
                status
              };
            }).filter(s => s.name.trim() !== ''); // Filter out empty names

            if (newStudents.length > 0) {
              setStudentsList(prev => {
                const newList = [...prev, ...newStudents];
                localStorage.setItem(getStorageKey('guru_students'), JSON.stringify(newList));
                window.dispatchEvent(new Event('studentsUpdated'));
                return newList;
              });
              setModalState({ isOpen: true, type: 'import', student: { name: file.name, count: newStudents.length } });
            } else {
              alert('Tidak ada data siswa valid yang ditemukan dalam file. Pastikan ada kolom nama.');
            }
          } else {
            alert('File Excel kosong.');
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          alert('Terjadi kesalahan saat membaca file Excel.');
        }
      };
      reader.readAsBinaryString(file);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCloseModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleAddClick = () => {
    setFormData({ nisn: '', name: '', class: availableClasses[0] || 'X IPA 1', gender: 'L', status: 'Aktif' });
    setModalState({ isOpen: true, type: 'add' });
  };

  const handleEditClick = (student: any) => {
    setFormData(student);
    setModalState({ isOpen: true, type: 'edit', student });
  };

  const handleDetailClick = (student: any) => {
    setModalState({ isOpen: true, type: 'detail', student });
  };

  const handleDeleteClick = (student: any) => {
    setModalState({ isOpen: true, type: 'delete', student });
  };

  const handleSaveStudent = () => {
    if (!formData.name) return;
    let newList = [...studentsList];
    if (modalState.type === 'add') {
      const newStudent = {
        ...formData,
        id: Date.now().toString(),
        nisn: formData.nisn || '005' + Math.floor(Math.random() * 10000000),
      };
      newList = [...studentsList, newStudent];
      alert('Data siswa berhasil ditambahkan!');
    } else if (modalState.type === 'edit' && modalState.student) {
      newList = studentsList.map(s => s.id === modalState.student.id ? { ...s, ...formData } : s);
      alert('Data siswa berhasil diperbarui!');
    }
    setStudentsList(newList);
    localStorage.setItem(getStorageKey('guru_students'), JSON.stringify(newList));
    window.dispatchEvent(new Event('studentsUpdated'));
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (modalState.student) {
      const newList = studentsList.filter(s => s.id !== modalState.student.id);
      setStudentsList(newList);
      localStorage.setItem(getStorageKey('guru_students'), JSON.stringify(newList));
      window.dispatchEvent(new Event('studentsUpdated'));
      alert('Data siswa berhasil dihapus!');
    }
    handleCloseModal();
  };

  const handleManualSave = () => {
    localStorage.setItem(getStorageKey('guru_students'), JSON.stringify(studentsList));
    window.dispatchEvent(new Event('studentsUpdated'));
    alert('Data siswa berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Siswa</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola data induk siswa dan informasi akademik</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownloadFormat}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">description</span>
            Unduh Format
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            <span className="material-symbols-outlined">upload_file</span>
            Import Excel
          </button>
          
          <button 
            onClick={handleCetakKartu}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 transition-colors bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Cetak Kartu Absensi
          </button>
          
          <button 
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            PDF
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">download</span>
            Excel
          </button>
          
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Siswa
          </button>

          <button 
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin menghapus SEMUA data siswa?')) {
                setStudentsList([]);
                localStorage.removeItem(getStorageKey('guru_students'));
                window.dispatchEvent(new Event('studentsUpdated'));
                alert('Semua data siswa telah dihapus.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 transition-colors bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            <span className="material-symbols-outlined">delete_sweep</span>
            Hapus Semua
          </button>
          
          <button 
            onClick={handleManualSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-green-600 hover:bg-green-700"
          >
            <span className="material-symbols-outlined">save</span>
            Simpan Data
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg sm:w-64 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Menampilkan {filteredStudents.length} siswa</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">No</th>
                <th scope="col" className="px-6 py-4 font-medium">NISN</th>
                <th scope="col" className="px-6 py-4 font-medium">Nama Lengkap</th>
                <th scope="col" className="px-6 py-4 font-medium">Kelas</th>
                <th scope="col" className="px-6 py-4 font-medium">L/P</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.nisn}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.name}</td>
                    <td className="px-6 py-4">{student.class}</td>
                    <td className="px-6 py-4">{student.gender}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        student.status === 'Aktif' 
                          ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
                          : 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDetailClick(student)} className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors" title="Detail">
                          <span className="text-xl material-symbols-outlined">visibility</span>
                        </button>
                        <button onClick={() => handleEditClick(student)} className="p-1.5 text-orange-600 rounded-lg hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors" title="Edit">
                          <span className="text-xl material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => handleDeleteClick(student)} className="p-1.5 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Hapus">
                          <span className="text-xl material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data siswa yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan 1 hingga {filteredStudents.length} dari {filteredStudents.length} entri
          </span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50" disabled>
              Sebelumnya
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50" disabled>
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Hidden QR Generators for PDF */}
      <div className="hidden">
        {filteredStudents.map(student => (
          <QRCodeCanvas
            key={student.id}
            id={`qr-gen-${student.id}`}
            value={JSON.stringify({ type: 'student_id', id: student.id, nisn: student.nisn, name: student.name })}
            size={128}
          />
        ))}
      </div>

      {/* Modals */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalState.type === 'add' && 'Tambah Siswa Baru'}
                {modalState.type === 'edit' && 'Edit Data Siswa'}
                {modalState.type === 'detail' && 'Detail Siswa'}
                {modalState.type === 'delete' && 'Konfirmasi Hapus'}
                {modalState.type === 'import' && 'Import Berhasil'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              {(modalState.type === 'add' || modalState.type === 'edit') && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">NISN</label>
                    <input 
                      type="text" 
                      value={formData.nisn} 
                      onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Otomatis jika kosong"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Masukkan nama siswa"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                      <select 
                        value={formData.class} 
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {availableClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">L/P</label>
                      <select 
                        value={formData.gender} 
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Pindah">Pindah</option>
                      <option value="Keluar">Keluar</option>
                    </select>
                  </div>
                </div>
              )}

              {modalState.type === 'detail' && modalState.student && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3 gap-2 py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">NISN</span>
                    <span className="col-span-2 font-medium text-gray-900 dark:text-white">{modalState.student.nisn}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Nama Lengkap</span>
                    <span className="col-span-2 font-medium text-gray-900 dark:text-white">{modalState.student.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Kelas</span>
                    <span className="col-span-2 font-medium text-gray-900 dark:text-white">{modalState.student.class}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Jenis Kelamin</span>
                    <span className="col-span-2 font-medium text-gray-900 dark:text-white">{modalState.student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <span className="col-span-2 font-medium text-gray-900 dark:text-white">{modalState.student.status}</span>
                  </div>
                </div>
              )}

              {modalState.type === 'delete' && modalState.student && (
                <p className="text-gray-600 dark:text-gray-300">
                  Apakah Anda yakin ingin menghapus data siswa <span className="font-bold text-gray-900 dark:text-white">{modalState.student.name}</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              )}

              {modalState.type === 'import' && modalState.student && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/30">
                    <span className="text-green-600 material-symbols-outlined dark:text-green-400">check_circle</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    File <span className="font-medium text-gray-900 dark:text-white">{modalState.student.name}</span> berhasil dibaca.
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Sebanyak <span className="font-bold text-gray-900 dark:text-white">{modalState.student.count}</span> data siswa telah ditambahkan ke dalam sistem secara otomatis.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3">
              {(modalState.type === 'add' || modalState.type === 'edit') && (
                <>
                  <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                    Batal
                  </button>
                  <button onClick={handleSaveStudent} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700">
                    Simpan
                  </button>
                </>
              )}
              {modalState.type === 'delete' && (
                <>
                  <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                    Batal
                  </button>
                  <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                    Hapus
                  </button>
                </>
              )}
              {(modalState.type === 'detail' || modalState.type === 'import') && (
                <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700">
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSiswa;
