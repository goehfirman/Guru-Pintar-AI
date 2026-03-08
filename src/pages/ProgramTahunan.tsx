import React, { useState, useEffect, useRef } from 'react';
import { getStorageKey } from '../utils/academic';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from '@google/genai';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  mappedClasses: string[];
  jpPerTahun: number;
}

interface ATPItem {
  id: string;
  subjectId: string;
  kodeTp: string;
  unitTopik: string;
  jejakTurunanCp: string;
  rumusanTp: string;
  asesmen: string;
  jp: string;
}

const initialSubjects: SubjectItem[] = [
  { id: '1', code: 'PAI', name: 'Pendidikan Agama Islam', mappedClasses: ['1', '2', '3'], jpPerTahun: 108 },
  { id: '2', code: 'PKN', name: 'Pendidikan Pancasila', mappedClasses: ['1', '2', '3'], jpPerTahun: 72 },
  { id: '3', code: 'IND', name: 'Bahasa Indonesia', mappedClasses: ['1', '2', '3'], jpPerTahun: 216 },
  { id: '4', code: 'MTK', name: 'Matematika', mappedClasses: ['1', '2', '3'], jpPerTahun: 180 },
  { id: '5', code: 'IPAS', name: 'IPAS', mappedClasses: ['1', '2', '3'], jpPerTahun: 180 },
  { id: '6', code: 'PJOK', name: 'PJOK', mappedClasses: ['1', '2', '3'], jpPerTahun: 108 },
  { id: '7', code: 'SBDP', name: 'Seni Budaya', mappedClasses: ['1', '2', '3'], jpPerTahun: 108 },
  { id: '8', code: 'ING', name: 'Bahasa Inggris', mappedClasses: ['1', '2', '3'], jpPerTahun: 108 },
  { id: '9', code: 'PLBJ', name: 'PLBJ', mappedClasses: ['1', '2', '3'], jpPerTahun: 72 },
  { id: '10', code: 'KKA', name: 'Koding dan Kecerdasan Artifisial', mappedClasses: ['1', '2', '3'], jpPerTahun: 72 },
];

const ProgramTahunan: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [atpData, setAtpData] = useState<ATPItem[]>([]);
  const [effectiveWeeks, setEffectiveWeeks] = useState<Record<string, number>>({});
  const [jpPerMinggu, setJpPerMinggu] = useState<number>(0);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [savedProtas, setSavedProtas] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = () => {
      const savedSubjects = localStorage.getItem(getStorageKey('guru_subjects'));
      if (savedSubjects) {
        try {
          const allSubjects: SubjectItem[] = JSON.parse(savedSubjects);
          setSubjects(allSubjects);
        } catch (e) {
          setSubjects(initialSubjects);
        }
      } else {
        setSubjects(initialSubjects);
      }

      const savedWeeks = localStorage.getItem(getStorageKey('effective_weeks'));
      if (savedWeeks) {
        setEffectiveWeeks(JSON.parse(savedWeeks));
      }
      
      const savedProtas = localStorage.getItem(getStorageKey('saved_protas'));
      if (savedProtas) {
        setSavedProtas(JSON.parse(savedProtas));
      }
    };

    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('subjectsUpdated', loadData);
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('subjectsUpdated', loadData);
    };
  }, []);

  const saveProta = () => {
    const newProta = {
      id: Date.now().toString(),
      subjectName: subjects.find(s => s.id === selectedSubjectId)?.name,
      ...generatedData,
      createdAt: new Date().toISOString()
    };
    const updatedProtas = [...savedProtas, newProta];
    setSavedProtas(updatedProtas);
    localStorage.setItem(getStorageKey('saved_protas'), JSON.stringify(updatedProtas));
    alert('PROTA berhasil disimpan!');
  };

  const deleteProta = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus PROTA ini?')) {
      const updatedProtas = savedProtas.filter(p => p.id !== id);
      setSavedProtas(updatedProtas);
      localStorage.setItem(getStorageKey('saved_protas'), JSON.stringify(updatedProtas));
      if (generatedData?.id === id) setGeneratedData(null);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      const savedAtp = localStorage.getItem(getStorageKey(`guru_atp_${selectedSubjectId}`));
      if (savedAtp) {
        setAtpData(JSON.parse(savedAtp));
      } else {
        setAtpData([]);
      }
      
      const subject = subjects.find(s => s.id === selectedSubjectId);
      if (subject) {
        // Sync JP per tahun from master data (subject.jpPerTahun)
        // Recalculate JP per minggu based on effective weeks
        const totalWeeks = Number(Object.values(effectiveWeeks).reduce((a: number, b: number) => a + b, 0));
        if (totalWeeks > 0) {
          setJpPerMinggu(Math.round(subject.jpPerTahun / totalWeeks));
        } else {
          setJpPerMinggu(Math.round(subject.jpPerTahun / 36));
        }
      }
    }
  }, [selectedSubjectId, subjects, effectiveWeeks]);

  const totalEffectiveWeeks = Object.values(effectiveWeeks).reduce((a: number, b: number) => a + b, 0);
  const totalJpTahunan = Number(totalEffectiveWeeks) * Number(jpPerMinggu);

  const processImport = async () => {
    if (!importFile) {
      setImportError('Silakan pilih file terlebih dahulu.');
      return;
    }
    setIsImporting(true);
    setImportError(null);
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) throw new Error('API Key Gemini tidak ditemukan.');
      alert('Fitur Import Pintar sedang dalam pengembangan.');
      setIsImportModalOpen(false);
    } catch (error: any) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const generateProta = async () => {
    setIsGenerating(true);
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) throw new Error('API Key Gemini tidak ditemukan.');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Buatkan Program Tahunan (PROTA) untuk mata pelajaran ${subjects.find(s => s.id === selectedSubjectId)?.name} dengan JP per minggu ${jpPerMinggu}.
        
        REFERENSI ALUR TUJUAN PEMBELAJARAN (ATP):
        ${JSON.stringify(atpData.map(item => ({ unitTopik: item.unitTopik, tujuanPembelajaran: item.rumusanTp, jp: item.jp })))}

        ATURAN SISTEM (WAJIB DIPATUHI):
        1. Tujuan Pembelajaran (TP) HARUS sesuai dengan data ATP yang diberikan.
        2. Submateri harus diturunkan langsung dari setiap TP.
        3. Tidak boleh ada submateri di luar TP.
        4. Total Minggu Efektif Tahunan = ${totalEffectiveWeeks} minggu.
        5. Total JP Tahunan = ${totalJpTahunan} JP.
        6. Semester 1 = Juli–Desember.
        7. Semester 2 = Januari–Juni.
        8. Total JP Semester 1 + Semester 2 = Total JP Tahunan.
        9. Tidak boleh selisih 1 JP.
        10. JP per minggu tidak boleh melebihi alokasi per minggu.
        11. Tidak boleh ada minggu kosong jika materi masih berjalan.
        12. Wajib memuat dalam PROTA: UH, PTS Semester 1, Pengayaan, Refleksi.
        13. Semua komponen masuk dalam total JP tahunan.
        FORMAT OUTPUT JSON:
        {
          "pengesahan": { "mataPelajaran": "...", "faseKelas": "...", "tahunPelajaran": "...", "disahkanDi": "...", "tanggal": "...", "kepalaSekolah": "...", "nipKepalaSekolah": "...", "guru": "...", "nipGuru": "..." },
          "prota": [ { "no": 1, "tujuanPembelajaran": "...", "unitTopik": "...", "submateri": "...", "alokasiJp": 0, "bulan": "...", "semester": 1 } ],
          "statistik": { "totalMingguEfektif": ${totalEffectiveWeeks}, "totalJpSemester1": 0, "totalJpSemester2": 0, "totalJpTahunan": ${totalJpTahunan} }
        }
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (response.text) setGeneratedData(JSON.parse(response.text));
    } catch (error: any) {
      alert('Gagal generate: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Program Tahunan (PROTA) dan Program Semester (PROMES)", 105, 10, { align: 'center' });
    const pengesahan = generatedData.pengesahan;
    doc.setFontSize(10);
    doc.text(`Mata Pelajaran: ${pengesahan.mataPelajaran}`, 20, 20);
    doc.text(`Fase/Kelas: ${pengesahan.faseKelas}`, 20, 25);
    doc.text(`Tahun Pelajaran: ${pengesahan.tahunPelajaran}`, 20, 30);
    autoTable(doc, {
      startY: 40,
      head: [['No', 'Tujuan Pembelajaran', 'Unit/Topik', 'Submateri', 'Alokasi JP', 'Bulan', 'Semester']],
      body: generatedData.prota.map((item: any) => [item.no, item.tujuanPembelajaran, item.unitTopik, item.submateri, item.alokasiJp, item.bulan, item.semester]),
    });
    doc.save('prota_promes.pdf');
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(generatedData.prota);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PROTA");
    XLSX.writeFile(wb, "prota_promes.xlsx");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Program Tahunan (PROTA)</h1>
        <p className="text-gray-500 dark:text-gray-400">Generator Program Tahunan dan Program Semester</p>
      </div>
      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="flex justify-end gap-3 mb-6">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">
            <span className="material-symbols-outlined">upload_file</span> Import Pintar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Mata Pelajaran</label>
            <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">-- Pilih Mata Pelajaran --</option>
              {subjects
                .filter(s => localStorage.getItem(getStorageKey(`guru_atp_${s.id}`)))
                .map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">JP per Minggu</label>
            <input type="number" value={jpPerMinggu} onChange={(e) => setJpPerMinggu(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p>Total Minggu Efektif Tahunan: {totalEffectiveWeeks} minggu</p>
          <p>Total JP Tahunan: {totalJpTahunan} JP</p>
        </div>
        <button onClick={generateProta} className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700 disabled:opacity-50" disabled={!selectedSubjectId || atpData.length === 0 || isGenerating}>
          {isGenerating ? 'Memproses...' : 'Generate PROTA'}
        </button>
      </div>
      {generatedData && (
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <h2 className="text-xl font-bold mb-4">Hasil Generate PROTA</h2>
          <div className="flex gap-3 mb-4">
            <button onClick={saveProta} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Simpan PROTA</button>
            <button onClick={downloadPdf} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Download PDF</button>
            <button onClick={downloadExcel} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Download Excel</button>
          </div>
          <div className="overflow-x-auto">
            <h3 className="font-bold mb-2">Program Tahunan (PROTA)</h3>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">No</th>
                  <th className="px-6 py-3">Tujuan Pembelajaran</th>
                  <th className="px-6 py-3">Unit/Topik</th>
                  <th className="px-6 py-3">Submateri</th>
                  <th className="px-6 py-3">Alokasi JP</th>
                  <th className="px-6 py-3">Bulan</th>
                  <th className="px-6 py-3">Semester</th>
                </tr>
              </thead>
              <tbody>
                {generatedData.prota.map((item: any) => (
                  <tr key={item.no} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4">{item.no}</td>
                    <td className="px-6 py-4">{item.tujuanPembelajaran}</td>
                    <td className="px-6 py-4">{item.unitTopik}</td>
                    <td className="px-6 py-4">{item.submateri}</td>
                    <td className="px-6 py-4">{item.alokasiJp}</td>
                    <td className="px-6 py-4">{item.bulan}</td>
                    <td className="px-6 py-4">{item.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Total Minggu Efektif Tahunan = {generatedData.statistik.totalMingguEfektif} minggu</p>
            <p>Total JP Semester 1 = {generatedData.statistik.totalJpSemester1} JP</p>
            <p>Total JP Semester 2 = {generatedData.statistik.totalJpSemester2} JP</p>
            <p>Total JP Tahunan = {generatedData.statistik.totalJpTahunan} JP</p>
          </div>
        </div>
      )}

      {/* Saved PROTAs List */}
      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <h2 className="text-xl font-bold mb-4">Daftar PROTA Tersimpan</h2>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Mata Pelajaran</th>
              <th className="px-6 py-3">Tanggal Dibuat</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {savedProtas.map((prota: any) => (
              <tr key={prota.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4">{prota.subjectName}</td>
                <td className="px-6 py-4">{new Date(prota.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setGeneratedData(prota)} className="text-blue-600 hover:underline mr-2">Lihat</button>
                  <button onClick={() => { setGeneratedData(prota); setSelectedSubjectId(subjects.find(s => s.name === prota.subjectName)?.id || ''); }} className="text-orange-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Cetak PROTA</title>
                            <style>
                              body { font-family: sans-serif; padding: 20px; }
                              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                            </style>
                          </head>
                          <body>
                            <h1>Program Tahunan: ${prota.subjectName}</h1>
                            <table>
                              <thead>
                                <tr><th>No</th><th>Tujuan Pembelajaran</th><th>Unit/Topik</th><th>Submateri</th><th>Alokasi JP</th><th>Bulan</th><th>Semester</th></tr>
                              </thead>
                              <tbody>
                                ${prota.prota.map((item: any) => `
                                  <tr>
                                    <td>${item.no}</td>
                                    <td>${item.tujuanPembelajaran}</td>
                                    <td>${item.unitTopik}</td>
                                    <td>${item.submateri}</td>
                                    <td>${item.alokasiJp}</td>
                                    <td>${item.bulan}</td>
                                    <td>${item.semester}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }} className="text-green-600 hover:underline mr-2">Cetak</button>
                  <button onClick={() => deleteProta(prota.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold mb-4">Import Pintar PROTA</h3>
            <input type="file" ref={fileInputRef} onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="mb-4" />
            {importError && <p className="text-red-500 text-sm mb-4">{importError}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">Batal</button>
              <button onClick={processImport} disabled={isImporting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg">
                {isImporting ? 'Memproses...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramTahunan;
