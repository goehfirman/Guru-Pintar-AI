import React from 'react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Halaman';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageName}</h1>
          <p className="text-gray-500 dark:text-gray-400">Halaman ini sedang dalam pengembangan</p>
        </div>
      </div>

      <div className="p-12 text-center bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-blue-600 bg-blue-50 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
          <span className="text-4xl material-symbols-outlined">construction</span>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Fitur Segera Hadir</h2>
        <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400">
          Kami sedang bekerja keras untuk menghadirkan fitur <strong>{pageName}</strong>. 
          Silakan cek kembali nanti untuk pembaruan terbaru.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
