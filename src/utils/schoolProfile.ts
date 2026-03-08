export interface SchoolProfile {
  name: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
}

export const defaultSchoolProfile: SchoolProfile = {
  name: 'SDN Pekayon 09',
  npsn: '20108981',
  address: 'Jl. Pendidikan Jakarta Timur',
  phone: '(021) 8706842',
  email: 'sdnegeripekayon09@gmail.com',
  logoUrl: ''
};

const STORAGE_KEY = 'guru_school_profile';

export const getSchoolProfile = (): SchoolProfile => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    // Check if it's the old default data and migrate if necessary
    if (parsed.name === 'SMA Negeri 1 Contoh') {
      const newProfile = { ...defaultSchoolProfile, logoUrl: parsed.logoUrl || '' };
      saveSchoolProfile(newProfile);
      return newProfile;
    }
    // Merge with default to ensure new fields (like logoUrl) exist if they were missing in old data
    return { ...defaultSchoolProfile, ...parsed };
  }
  return defaultSchoolProfile;
};

export const saveSchoolProfile = (profile: SchoolProfile): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('schoolProfileUpdated'));
};
