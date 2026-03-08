export interface UserProfile {
  fullName: string;
  nip: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  religion: string;
  address: string;
  status: string;
  rank: string;
  subject: string;
  additionalTask: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

export const defaultProfile: UserProfile = {
  fullName: 'Andi Setiawan, S.Pd.',
  nip: '198507232010011015',
  birthPlace: 'Bandung',
  birthDate: '1985-07-23',
  gender: 'L',
  religion: 'Islam',
  address: 'Jl. Merdeka No. 123, Kel. Sukamaju, Kec. Cibeunying, Kota Bandung, Jawa Barat 40123',
  status: 'PNS',
  rank: 'III/a',
  subject: 'Matematika',
  additionalTask: 'Wali Kelas X IPA 1',
  email: 'andi.setiawan@sekolah.sch.id',
  phone: '+62 812-3456-7890',
  avatarUrl: 'https://ui-avatars.com/api/?name=Andi+Setiawan&background=1e3fae&color=fff&size=128'
};

const STORAGE_KEY = 'user_profile_data';

export const getUserProfile = (): UserProfile => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultProfile;
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('userProfileUpdated'));
};
