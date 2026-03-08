import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from '@google/genai';
import { getStorageKey } from '../utils/academic';

const initialEvents = [
  { id: 1, date: '17 Jul 2023', title: 'Hari Pertama Sekolah', type: 'Akademik', color: 'blue' },
  { id: 2, date: '20 Jul 2023', title: 'Tahun Baru Islam', type: 'Libur Nasional', color: 'red' },
  { id: 3, date: '17 Agu 2023', title: 'HUT RI ke-78', type: 'Libur Nasional', color: 'red' },
  { id: 4, date: '28 Sep 2023', title: 'Maulid Nabi Muhammad SAW', type: 'Libur Nasional', color: 'red' },
  { id: 5, date: '10 Nov 2023', title: 'Hari Pahlawan', type: 'Libur Nasional', color: 'red' },
  { id: 6, date: '15 Nov 2023', title: 'Rapat Koordinasi Guru', type: 'Kegiatan Sekolah', color: 'blue' },
  { id: 7, date: '20-24 Nov 2023', title: 'Penilaian Tengah Semester', type: 'Akademik', color: 'green' },
  { id: 8, date: '25 Nov 2023', title: 'Hari Guru Nasional', type: 'Peringatan', color: 'purple' },
  { id: 9, date: '1-8 Des 2023', title: 'Penilaian Akhir Semester', type: 'Akademik', color: 'green' },
  { id: 10, date: '15 Des 2023', title: 'Pembagian Rapor', type: 'Akademik', color: 'green' },
  { id: 11, date: '18-31 Des 2023', title: 'Libur Semester Ganjil', type: 'Libur Sekolah', color: 'orange' },
  { id: 12, date: '1 Jan 2024', title: 'Tahun Baru 2024', type: 'Libur Nasional', color: 'red' },
  { id: 13, date: '8 Feb 2024', title: 'Isra Mi\'raj', type: 'Libur Nasional', color: 'red' },
  { id: 14, date: '10 Feb 2024', title: 'Tahun Baru Imlek', type: 'Libur Nasional', color: 'red' },
  { id: 15, date: '11 Mar 2024', title: 'Hari Raya Nyepi', type: 'Libur Nasional', color: 'red' },
  { id: 16, date: '29 Mar 2024', title: 'Wafat Isa Al Masih', type: 'Libur Nasional', color: 'red' },
  { id: 17, date: '10-11 Apr 2024', title: 'Hari Raya Idul Fitri', type: 'Libur Nasional', color: 'red' },
  { id: 18, date: '1 Mei 2024', title: 'Hari Buruh', type: 'Libur Nasional', color: 'red' },
  { id: 19, date: '9 Mei 2024', title: 'Kenaikan Isa Al Masih', type: 'Libur Nasional', color: 'red' },
  { id: 20, date: '23 Mei 2024', title: 'Hari Raya Waisak', type: 'Libur Nasional', color: 'red' },
  { id: 21, date: '1 Jun 2024', title: 'Hari Lahir Pancasila', type: 'Libur Nasional', color: 'red' },
  { id: 22, date: '17 Jun 2024', title: 'Hari Raya Idul Adha', type: 'Libur Nasional', color: 'red' },
];

const months = [
  'Juli 2023', 'Agustus 2023', 'September 2023', 'Oktober 2023', 'November 2023', 'Desember 2023',
  'Januari 2024', 'Februari 2024', 'Maret 2024', 'April 2024', 'Mei 2024', 'Juni 2024'
];

const KalenderAkademik: React.FC = () => {
  // Initialize state from localStorage if available
  const [activeTab, setActiveTab] = useState<'kalender' | 'minggu' | 'hari'>(() => {
    return (localStorage.getItem('kalender_active_tab') as 'kalender' | 'minggu' | 'hari') || 'kalender';
  });
  
  const [academicYear, setAcademicYear] = useState('2023/2024');
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    return localStorage.getItem('kalender_current_month') || '';
  });
  
  const [events, setEvents] = useState(initialEvents);

  // Save activeTab whenever it changes
  useEffect(() => {
    localStorage.setItem('kalender_active_tab', activeTab);
  }, [activeTab]);

  // Save currentMonth whenever it changes
  useEffect(() => {
    if (currentMonth) {
      localStorage.setItem('kalender_current_month', currentMonth);
    }
  }, [currentMonth]);
  
  // Minggu Efektif State
  const [effectiveWeeks, setEffectiveWeeks] = useState<Record<string, number>>({});
  
  // Hari Efektif State
  const [schoolDays, setSchoolDays] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', title: '', type: 'Kegiatan Sekolah', color: 'blue' });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      const settings = localStorage.getItem('guru_academic_settings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          if (parsed.activeYear) {
            setAcademicYear(parsed.activeYear);
            
            // Set initial month logic...
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonthIndex = now.getMonth(); // 0-11
            
            const [startYear, endYear] = parsed.activeYear.split('/').map(Number);
            
            const isCurrentInAcademic = (currentYear === startYear && currentMonthIndex >= 6) || 
                                      (currentYear === endYear && currentMonthIndex <= 5);
            
            if (isCurrentInAcademic) {
              const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
              // Only set if not already set (e.g. from localStorage)
              setCurrentMonth(prev => prev || `${monthNames[currentMonthIndex]} ${currentYear}`);
            } else {
              setCurrentMonth(prev => prev || `Juli ${startYear}`);
            }
          }
        } catch (e) {
          console.error("Failed to parse academic settings", e);
        }
      } else {
        setCurrentMonth(prev => prev || 'Juli 2023');
      }

      // Load effective weeks
      const savedWeeks = localStorage.getItem(getStorageKey('effective_weeks'));
      if (savedWeeks) {
        try {
          setEffectiveWeeks(JSON.parse(savedWeeks));
        } catch (e) {}
      }

      // Load school days
      const savedDays = localStorage.getItem(getStorageKey('school_days'));
      if (savedDays) {
        try {
          setSchoolDays(JSON.parse(savedDays));
        } catch (e) {}
      }
    };
    
    loadSettings();
    window.addEventListener('academicSettingsUpdated', loadSettings);
    return () => window.removeEventListener('academicSettingsUpdated', loadSettings);
  }, []);

  // Save handlers
  const saveEffectiveWeeks = () => {
    localStorage.setItem(getStorageKey('effective_weeks'), JSON.stringify(effectiveWeeks));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const saveSchoolDays = () => {
    localStorage.setItem(getStorageKey('school_days'), JSON.stringify(schoolDays));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  // Load events when academic year changes or on mount
  useEffect(() => {
    const loadEvents = () => {
      const key = getStorageKey('academic_events');
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setEvents(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse events", e);
        }
      } else {
        setEvents(initialEvents);
      }
    };
    loadEvents();
  }, [academicYear]);

  const handleSave = () => {
    try {
      const key = getStorageKey('academic_events');
      localStorage.setItem(key, JSON.stringify(events));
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error) {
      console.error('Error saving events:', error);
      alert('Gagal menyimpan data.');
    }
  };

  // Generate months list based on academic year
  const getMonthsList = () => {
    const [startYear, endYear] = academicYear.split('/').map(Number);
    if (!startYear || !endYear) return [];
    
    return [
      `Juli ${startYear}`, `Agustus ${startYear}`, `September ${startYear}`, `Oktober ${startYear}`, `November ${startYear}`, `Desember ${startYear}`,
      `Januari ${endYear}`, `Februari ${endYear}`, `Maret ${endYear}`, `April ${endYear}`, `Mei ${endYear}`, `Juni ${endYear}`
    ];
  };

  const months = getMonthsList();

  // Calendar logic helpers
  const getMonthData = (monthStr: string) => {
    if (!monthStr) return { daysInMonth: 30, startDay: 0, monthIndex: 0, year: 2023 };
    
    const parts = monthStr.split(' ');
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    
    const monthMap: Record<string, number> = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    
    const monthIndex = monthMap[monthName];
    const date = new Date(year, monthIndex, 1);
    const startDay = date.getDay(); // 0 = Sunday
    
    // Get days in month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    return { daysInMonth, startDay, monthIndex, year };
  };

  const { daysInMonth, startDay, monthIndex, year } = getMonthData(currentMonth);

  const handlePrevMonth = () => {
    const currentIndex = months.indexOf(currentMonth);
    if (currentIndex > 0) {
      setCurrentMonth(months[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = months.indexOf(currentMonth);
    if (currentIndex < months.length - 1) {
      setCurrentMonth(months[currentIndex + 1]);
    }
  };

  const jumpToToday = () => {
    const now = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const todayStr = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    
    if (months.includes(todayStr)) {
      setCurrentMonth(todayStr);
    } else {
      alert('Hari ini berada di luar tahun ajaran aktif.');
    }
  };

  const handleDateClick = (day: number) => {
    const parts = currentMonth.split(' ');
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthIndex = monthNames.indexOf(monthName);
    
    // Create date string YYYY-MM-DD for input
    const date = new Date(year, monthIndex, day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    setNewEvent({
      date: `${yyyy}-${mm}-${dd}`,
      title: '',
      type: 'Kegiatan Sekolah',
      color: 'blue'
    });
    setIsAddEventModalOpen(true);
  };

  const handleAddEvent = () => {
    if (!newEvent.date || !newEvent.title) {
      alert('Mohon lengkapi tanggal dan nama kegiatan.');
      return;
    }
    
    // Format date to "D MMM YYYY" if it's in YYYY-MM-DD format
    let formattedDate = newEvent.date;
    if (newEvent.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const dateObj = new Date(newEvent.date);
      const day = dateObj.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = monthNames[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      formattedDate = `${day} ${month} ${year}`;
    }

    const eventToAdd = {
      id: Date.now(),
      date: formattedDate,
      title: newEvent.title,
      type: newEvent.type,
      color: newEvent.color
    };

    setEvents([...events, eventToAdd]);
    setIsAddEventModalOpen(false);
    setNewEvent({ date: '', title: '', type: 'Kegiatan Sekolah', color: 'blue' });
    alert('Kegiatan berhasil ditambahkan!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
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
        // Handle PDF
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
            text: 'Ekstrak data kalender akademik dari dokumen PDF ini. Petakan ke dalam format JSON dengan array of objects, di mana setiap object memiliki properti: date (format "D MMM YYYY", contoh "17 Agu 2023"), title, type (contoh: "Libur Nasional", "Akademik", "Kegiatan Sekolah"), dan color (pilih satu: "red", "blue", "green", "purple", "orange" berdasarkan jenis kegiatan).',
          },
        ];
      } else if (importFile.name.endsWith('.xls') || importFile.name.endsWith('.xlsx')) {
        // Handle Excel
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
            text: `Berikut adalah data kalender akademik dalam format CSV:\n\n${csvData}\n\nEkstrak data kalender akademik dari data tersebut. Petakan ke dalam format JSON dengan array of objects, di mana setiap object memiliki properti: date (format "D MMM YYYY", contoh "17 Agu 2023"), title, type (contoh: "Libur Nasional", "Akademik", "Kegiatan Sekolah"), dan color (pilih satu: "red", "blue", "green", "purple", "orange" berdasarkan jenis kegiatan).`,
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
                date: { type: Type.STRING, description: 'Tanggal kegiatan, format "D MMM YYYY"' },
                title: { type: Type.STRING, description: 'Nama kegiatan atau hari libur' },
                type: { type: Type.STRING, description: 'Jenis kegiatan' },
                color: { type: Type.STRING, description: 'Warna label (red, blue, green, purple, orange)' },
              },
              required: ['date', 'title', 'type', 'color'],
            },
          },
        },
      });

      const extractedEvents = JSON.parse(response.text || '[]');
      if (extractedEvents && extractedEvents.length > 0) {
        // Add IDs to new events
        const newEvents = extractedEvents.map((ev: any, index: number) => ({
          ...ev,
          id: Date.now() + index
        }));
        
        setEvents([...newEvents, ...events]); // Add new events at the beginning or merge
        setIsImportModalOpen(false);
        setImportFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert(`Berhasil mengimport ${newEvents.length} kegiatan kalender!`);
      } else {
        throw new Error('Gagal mengekstrak data kalender dari file tersebut.');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setImportError(error.message || 'Terjadi kesalahan saat memproses file.');
    } finally {
      setIsImporting(false);
    }
  };

  const getMonthShortName = (fullMonth: string) => {
    const map: Record<string, string> = {
      'Juli': 'Jul', 'Agustus': 'Agu', 'September': 'Sep', 'Oktober': 'Okt', 'November': 'Nov', 'Desember': 'Des',
      'Januari': 'Jan', 'Februari': 'Feb', 'Maret': 'Mar', 'April': 'Apr', 'Mei': 'Mei', 'Juni': 'Jun'
    };
    const [month, year] = fullMonth.split(' ');
    return `${map[month]} ${year}`;
  };

  const filteredEvents = events.filter(event => event.date.includes(getMonthShortName(currentMonth)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kalender Akademik</h1>
          <p className="text-gray-500 dark:text-gray-400">Pengaturan jadwal dan waktu efektif belajar</p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-xl dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('kalender')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'kalender'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Kalender
          </button>
          <button
            onClick={() => setActiveTab('minggu')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'minggu'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Minggu Efektif
          </button>
          <button
            onClick={() => setActiveTab('hari')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'hari'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Hari Efektif
          </button>
        </div>
      </div>

      {activeTab === 'kalender' && (
        <div className="space-y-6">
          <div className="flex items-center justify-end gap-3">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-sidebar-dark dark:border-border-dark dark:text-white dark:focus:bg-gray-900 transition-colors"
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <span className="material-symbols-outlined">save</span>
              Simpan
            </button>
            <button 
              onClick={() => setIsAddEventModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <span className="material-symbols-outlined">add</span>
              Tambah Kegiatan
            </button>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              <span className="material-symbols-outlined">upload_file</span>
              Import Pintar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">download</span>
              Unduh PDF
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kalender View */}
        <div className="lg:col-span-2 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{currentMonth}</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                disabled={months.indexOf(currentMonth) <= 0}
                className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                onClick={jumpToToday}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Hari Ini
              </button>
              <button 
                onClick={handleNextMonth}
                disabled={months.indexOf(currentMonth) >= months.length - 1}
                className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Simple Calendar Grid Placeholder */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-border-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {/* Empty days for previous month */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white dark:bg-sidebar-dark min-h-[100px] p-2 opacity-50">
                {/* Optional: Show previous month dates */}
              </div>
            ))}
            
            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${day} ${currentMonth.split(' ')[0]} ${year}`; // e.g., "15 November 2023"
              
              // Helper to check if event matches this date
              const getEventsForDay = (d: number) => {
                return filteredEvents.filter(e => {
                  // Handle "17 Jul 2023" format
                  if (e.date === dateStr) return true;
                  
                  // Handle "17 Jul" format (assuming current year)
                  const shortMonth = getMonthShortName(currentMonth).split(' ')[0]; // "Nov"
                  if (e.date === `${d} ${shortMonth} ${year}`) return true;
                  
                  // Handle range "20-24 Nov 2023"
                  if (e.date.includes('-')) {
                    // This is a simple range check, could be improved
                    const parts = e.date.split(' '); // ["20-24", "Nov", "2023"]
                    if (parts.length >= 2) {
                      const range = parts[0].split('-');
                      const evtMonth = parts[1];
                      const evtYear = parts[2] || year.toString();
                      
                      if (evtMonth === getMonthShortName(currentMonth).split(' ')[0] && evtYear === year.toString()) {
                        const start = parseInt(range[0]);
                        const end = parseInt(range[1]);
                        return d >= start && d <= end;
                      }
                    }
                  }
                  
                  return false;
                });
              };
              
              const dayEvents = getEventsForDay(day);
              const hasEvent = dayEvents.length > 0;
              
              const isToday = day === new Date().getDate() && 
                             monthIndex === new Date().getMonth() && 
                             year === new Date().getFullYear();
              
              return (
                <div key={`day-${day}`} className={`group relative bg-white dark:bg-sidebar-dark min-h-[100px] p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isToday ? 'ring-2 ring-inset ring-blue-500' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {day}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
                        title="Tambah Kegiatan"
                    >
                        <span className="material-symbols-outlined text-[16px] font-bold block">add</span>
                    </button>
                  </div>
                  
                  {hasEvent && (
                    <div className="mt-1 space-y-1">
                      {dayEvents.map(e => (
                        <div key={e.id} className={`px-1.5 py-0.5 text-[10px] font-bold rounded truncate ${
                          e.color === 'red' ? 'text-red-800 bg-red-100 dark:bg-red-900/40 dark:text-red-300' :
                          e.color === 'blue' ? 'text-blue-800 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300' :
                          e.color === 'green' ? 'text-green-800 bg-green-100 dark:bg-green-900/40 dark:text-green-300' :
                          e.color === 'purple' ? 'text-purple-800 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300' :
                          'text-orange-800 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300'
                        }`}>
                          {e.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Empty days for next month */}
            {Array.from({ length: 42 - (startDay + daysInMonth) }).map((_, i) => (
              <div key={`empty-next-${i}`} className="bg-white dark:bg-sidebar-dark min-h-[100px] p-2 opacity-50">
                {/* Optional: Show next month dates */}
              </div>
            ))}
          </div>
        </div>

        {/* Daftar Kegiatan */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Agenda Mendatang</h2>
          
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const colorClasses = {
                  red: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-900/30',
                  blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
                  green: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-900/30',
                  purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
                  orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-900/30',
                }[event.color];

                return (
                  <div key={event.id} className={`p-4 rounded-xl border ${colorClasses}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">{event.date}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">{event.type}</span>
                    </div>
                    <h4 className="font-semibold">{event.title}</h4>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Tidak ada agenda bulan ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

      {activeTab === 'minggu' && (
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pengaturan Minggu Efektif</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tentukan jumlah minggu efektif belajar untuk setiap bulan</p>
            </div>
            <button 
              onClick={saveEffectiveWeeks}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <span className="material-symbols-outlined">save</span>
              Simpan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3">Bulan</th>
                  <th className="px-6 py-3">Jumlah Minggu</th>
                  <th className="px-6 py-3">Minggu Efektif</th>
                  <th className="px-6 py-3">Minggu Tidak Efektif</th>
                  <th className="px-6 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => {
                  const weeks = effectiveWeeks[month] !== undefined ? effectiveWeeks[month] : 4;
                  return (
                    <tr key={month} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{month}</td>
                      <td className="px-6 py-4">4</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={weeks}
                          onChange={(e) => setEffectiveWeeks({...effectiveWeeks, [month]: parseInt(e.target.value) || 0})}
                          className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4">{Math.max(0, 4 - weeks)}</td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Keterangan..."
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'hari' && (
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pengaturan Hari Efektif</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pilih hari-hari yang merupakan hari efektif belajar</p>
            </div>
            <button 
              onClick={saveSchoolDays}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <span className="material-symbols-outlined">save</span>
              Simpan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
              <label key={day} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                schoolDays.includes(day) 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
              }`}>
                <input
                  type="checkbox"
                  checked={schoolDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSchoolDays([...schoolDays, day]);
                    } else {
                      setSchoolDays(schoolDays.filter(d => d !== day));
                    }
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-3 font-medium text-gray-900 dark:text-white">{day}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Kegiatan Baru</h3>
              <button 
                onClick={() => setIsAddEventModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kegiatan</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-4 py-2 text-sm text-black border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Contoh: Rapat Guru"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                <input 
                  type="date" 
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-4 py-2 text-sm text-black border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kegiatan</label>
                <select 
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full px-4 py-2 text-sm text-black border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Libur Nasional">Libur Nasional</option>
                  <option value="Libur Sekolah">Libur Sekolah</option>
                  <option value="Peringatan">Peringatan</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Warna Label</label>
                <div className="flex gap-2">
                  {['blue', 'red', 'green', 'purple', 'orange'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewEvent({...newEvent, color})}
                      className={`w-8 h-8 rounded-full border-2 ${newEvent.color === color ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color === 'blue' ? '#3b82f6' : color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : color === 'purple' ? '#a855f7' : '#f97316' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsAddEventModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button 
                onClick={handleAddEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Simpan Kegiatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import Pintar Kalender</h3>
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
                Upload file kalender akademik dalam format PDF atau Excel. AI akan secara otomatis mengekstrak daftar kegiatan dan hari libur.
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
      {/* Save Notification Toast */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${showSaveNotification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3 px-6 py-4 text-white bg-green-600 rounded-xl shadow-lg">
          <span className="material-symbols-outlined">check_circle</span>
          <div>
            <h4 className="font-bold">Berhasil!</h4>
            <p className="text-sm">Data anda berhasil tersimpan!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalenderAkademik;
