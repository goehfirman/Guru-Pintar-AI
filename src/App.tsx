import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProfilSaya from './pages/ProfilSaya';
import DataSiswa from './pages/DataSiswa';
import JadwalPelajaran from './pages/JadwalPelajaran';
import JurnalAgendaGuru from './pages/JurnalAgendaGuru';
import AbsensiSiswa from './pages/AbsensiSiswa';
import PenilaianSiswa from './pages/PenilaianSiswa';
import KalenderAkademik from './pages/KalenderAkademik';
import PengaturanSekolah from './pages/PengaturanSekolah';
import PengaturanKelas from './pages/PengaturanKelas';
import PengaturanMataPelajaran from './pages/PengaturanMataPelajaran';
import PanduanKurikulum from './pages/PanduanKurikulum';
import ManajemenEkskul from './pages/ManajemenEkskul';
import PortfolioPrestasi from './pages/PortfolioPrestasi';
import ModulAjarAI from './pages/ModulAjarAI';
import BankSoalAI from './pages/BankSoalAI';
import CetakLaporan from './pages/CetakLaporan';
import KirimKepalaSekolah from './pages/KirimKepalaSekolah';
import PlaceholderPage from './pages/PlaceholderPage';
import AlurTujuanPembelajaran from './pages/AlurTujuanPembelajaran';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="atp" element={<AlurTujuanPembelajaran />} />
          <Route path="prota" element={<PlaceholderPage />} />
          <Route path="promes" element={<PlaceholderPage />} />
          <Route path="profil" element={<ProfilSaya />} />
          <Route path="pengaturan" element={<PengaturanSekolah />} />
          <Route path="pengaturan-kelas" element={<PengaturanKelas />} />
          <Route path="pengaturan-mapel" element={<PengaturanMataPelajaran />} />
          <Route path="panduan" element={<PanduanKurikulum />} />
          <Route path="data-siswa" element={<DataSiswa />} />
          <Route path="jadwal" element={<JadwalPelajaran />} />
          <Route path="kalender" element={<KalenderAkademik />} />
          <Route path="jurnal" element={<JurnalAgendaGuru />} />
          <Route path="absensi" element={<AbsensiSiswa />} />
          <Route path="penilaian" element={<PenilaianSiswa />} />
          <Route path="ekskul" element={<ManajemenEkskul />} />
          <Route path="portfolio" element={<PortfolioPrestasi />} />
          <Route path="modul-ajar-ai" element={<ModulAjarAI />} />
          <Route path="bank-soal-ai" element={<BankSoalAI />} />
          <Route path="cetak-laporan" element={<CetakLaporan />} />
          <Route path="kirim-kepsek" element={<KirimKepalaSekolah />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
