export const getAcademicSuffix = () => {
  const settings = localStorage.getItem('guru_academic_settings');
  if (settings) {
    try {
      const parsed = JSON.parse(settings);
      return `${parsed.activeYear}`.replace(/\//g, '-');
    } catch (e) {}
  }
  return '2023-2024';
};

export const getStorageKey = (baseKey: string) => {
  return `${baseKey}_${getAcademicSuffix()}`;
};
