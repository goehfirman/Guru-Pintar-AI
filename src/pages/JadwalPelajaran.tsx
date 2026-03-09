import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from '@google/genai';
import { getStorageKey } from '../utils/academic';
import { getUserProfile } from '../utils/userProfile';
import { clsx } from 'clsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ScheduleRow {
  time: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
}

const defaultSchedule: ScheduleRow[] = [
  { time: '07:30 - 09:00', monday: 'Matematika (X IPA 1)', tuesday: 'IPAS (X IPA 2)', wednesday: 'Bahasa Indonesia (XI IPA 1)', thursday: 'Bahasa Inggris (X IPA 1)', friday: 'Senam Pagi' },
  { time: '09:00 - 09:15', monday: 'Istirahat', tuesday: 'Istirahat', wednesday: 'Istirahat', thursday: 'Istirahat', friday: 'Istirahat' },
  { time: '09:15 - 10:45', monday: 'Pendidikan Pancasila (X IPA 2)', tuesday: 'Seni Budaya (X IPS 1)', wednesday: 'PJOK (XI IPA 1)', thursday: 'Koding dan Kecerdasan Artifisial (XI IPS 1)', friday: 'Pendidikan Agama Islam (X IPA 1)' },
  { time: '10:45 - 12:15', monday: 'IPAS (X IPA 1)', tuesday: 'Matematika (XI IPA 2)', wednesday: 'PLBJ (X IPS 2)', thursday: 'IPAS (X IPA 1)', friday: 'Persiapan Sholat Jumat' },
  { time: '12:15 - 13:00', monday: 'Istirahat & Sholat', tuesday: 'Istirahat & Sholat', wednesday: 'Istirahat & Sholat', thursday: 'Istirahat & Sholat', friday: 'Sholat Jumat' },
  { time: '13:00 - 14:30', monday: 'Bahasa Inggris (XI IPS 2)', tuesday: 'IPAS (X IPA 2)', wednesday: 'Bahasa Indonesia (XI IPA 1)', thursday: 'Matematika (X IPA 2)', friday: 'Ekstrakurikuler' },
];

const JadwalPelajaran: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ScheduleRow | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    const saved = localStorage.getItem(getStorageKey('guru_schedule'));
    if (saved) {
      try {
        setSchedule(JSON.parse(saved));
      } catch (e) {
        setSchedule(defaultSchedule);
      }
    } else {
      setSchedule(defaultSchedule);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    return () => window.removeEventListener('academicSettingsUpdated', loadData);
  }, []);

  const handleEditClick = (row: ScheduleRow, index: number) => {
    setEditingRow({ ...row });
    setEditingIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingRow) {
      const newSchedule = [...schedule];
      newSchedule[editingIndex] = editingRow;
      setSchedule(newSchedule);
      localStorage.setItem(getStorageKey('guru_schedule'), JSON.stringify(newSchedule));
      window.dispatchEvent(new Event('scheduleUpdated'));
      setIsEditModalOpen(false);
      setEditingRow(null);
      setEditingIndex(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportError(null);
    }
  };

  const processImport = async () => {
    if (!importFile) {
      setImportError('Silakan pilih file terlebih dahulu.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        throw new Error('API Key Gemini tidak ditemukan. Silakan masukkan API Key di menu Dashboard.');
      }

      const ai = new GoogleGenAI({ apiKey });
      let promptContent: any[] = [];

      if (importFile.name.endsWith('.pdf')) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(importFile);
        });

        promptContent = [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'application/pdf',
            },
          },
          {
            text: 'Ekstrak jadwal pelajaran dari dokumen PDF ini. Petakan ke dalam format JSON array of objects dengan properti: time (format "HH:mm - HH:mm"), monday, tuesday, wednesday, thursday, friday. Jika ada waktu istirahat, masukkan juga sebagai baris tersendiri. Pastikan semua hari kerja (Senin-Jumat) terisi.',
          },
        ];
      } else if (importFile.name.endsWith('.xls') || importFile.name.endsWith('.xlsx')) {
        const arrayBuffer = await importFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let csvData = '';
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          csvData += `Sheet: ${sheetName}\n`;
          csvData += XLSX.utils.sheet_to_csv(worksheet);
          csvData += '\n\n';
        });

        promptContent = [
          {
            text: `Berikut adalah data jadwal pelajaran dalam format CSV:\n\n${csvData}\n\nEkstrak jadwal pelajaran dari data tersebut. Petakan ke dalam format JSON array of objects dengan properti: time (format "HH:mm - HH:mm"), monday, tuesday, wednesday, thursday, friday. Jika ada waktu istirahat, masukkan juga sebagai baris tersendiri.`,
          },
        ];
      } else {
        throw new Error('Format file tidak didukung. Gunakan PDF atau Excel (.xls, .xlsx).');
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: promptContent },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: 'Rentang waktu, contoh "07:30 - 09:00"' },
                monday: { type: Type.STRING },
                tuesday: { type: Type.STRING },
                wednesday: { type: Type.STRING },
                thursday: { type: Type.STRING },
                friday: { type: Type.STRING },
              },
              required: ['time', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            },
          },
        },
      });

      const extractedSchedule = JSON.parse(response.text || '[]');
      if (extractedSchedule && extractedSchedule.length > 0) {
        setSchedule(extractedSchedule);
        localStorage.setItem(getStorageKey('guru_schedule'), JSON.stringify(extractedSchedule));
        window.dispatchEvent(new Event('scheduleUpdated'));
        setIsImportModalOpen(false);
        setImportFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert(`Berhasil mengimport jadwal pelajaran!`);
      } else {
        throw new Error('Gagal mengekstrak data jadwal dari file tersebut.');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setImportError(error.message || 'Terjadi kesalahan saat memproses file.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const profile = getUserProfile();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    doc.setFontSize(16);
    doc.text(`Jadwal Pelajaran`, 148, 15, { align: 'center' });

    autoTable(doc, {
      startY: 25,
      head: [['Waktu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']],
      body: schedule.map(row => [row.time, row.monday, row.tuesday, row.wednesday, row.thursday, row.friday]),
      headStyles: { fillColor: [30, 63, 174] }
    });

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 20;
    
    if (finalY > 160) {
      doc.addPage();
      finalY = 20;
    }

    const signatureX = 210;
    doc.setFontSize(10);
    doc.text(`${profile.birthPlace || 'Jakarta'}, ${formattedDate}`, signatureX, finalY);
    doc.text(`Guru Mata Pelajaran,`, signatureX, finalY + 5);
    
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

    doc.save(`Jadwal_Pelajaran.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Pelajaran</h2>
        <div className="flex items-center gap-3">
          <button onClick={downloadPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Cetak PDF
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Import Pintar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-white uppercase bg-gray-900 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider border-r border-gray-800">Waktu</th>
              <th className="px-6 py-4 font-bold tracking-wider border-r border-gray-800">Senin</th>
              <th className="px-6 py-4 font-bold tracking-wider border-r border-gray-800">Selasa</th>
              <th className="px-6 py-4 font-bold tracking-wider border-r border-gray-800">Rabu</th>
              <th className="px-6 py-4 font-bold tracking-wider border-r border-gray-800">Kamis</th>
              <th className="px-6 py-4 font-bold tracking-wider border-r border-gray-800">Jumat</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50/50 dark:bg-gray-900/20 dark:text-white border-r border-gray-100 dark:border-gray-700 w-32">
                  {row.time}
                </td>
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => {
                  const content = row[day];
                  const isBreak = content.toLowerCase().includes('istirahat') || content.toLowerCase().includes('sholat');
                  
                  return (
                    <td key={day} className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 min-w-[160px]">
                      {content ? (
                        <div className={clsx(
                          "px-3 py-2 rounded-lg text-xs font-bold shadow-sm",
                          isBreak 
                            ? "bg-amber-100 text-amber-800 border border-amber-200" 
                            : "bg-blue-600 text-white border border-blue-700"
                        )}>
                          {content}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 italic text-xs">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditClick(row, index)} className="p-2 text-orange-600 rounded-xl hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-all" title="Edit">
                    <span className="text-xl material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold mb-4">Edit Jadwal: {editingRow.time}</h3>
            <div className="space-y-3">
              {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map(day => (
                <div key={day}>
                  <label className="block text-sm font-medium capitalize">{day}</label>
                  <input 
                    type="text"
                    value={editingRow[day]}
                    onChange={(e) => setEditingRow({...editingRow, [day]: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">Batal</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg">Simpan</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import Pintar Jadwal</h3>
              <button 
                onClick={() => !isImporting && setIsImportModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                disabled={isImporting}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload file jadwal pelajaran dalam format PDF atau Excel. AI akan secara otomatis mengekstrak dan memetakan jadwal Anda.
              </p>
              
              <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${importFile ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className={`mb-3 text-3xl material-symbols-outlined ${importFile ? 'text-blue-500' : 'text-gray-400'}`}>
                      {importFile ? 'description' : 'cloud_upload'}
                    </span>
                    {importFile ? (
                      <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">{importFile.name}</p>
                    ) : (
                      <>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, XLS, XLSX (Max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.xls,.xlsx" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isImporting}
                  />
                </label>
              </div>

              {importError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                  {importError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsImportModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
                disabled={isImporting}
              >
                Batal
              </button>
              <button 
                onClick={processImport} 
                disabled={!importFile || isImporting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Proses Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalPelajaran;
