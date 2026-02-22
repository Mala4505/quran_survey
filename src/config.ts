// App Configuration

// List of ITS numbers allowed to login initially
export const SEED_ITS_NUMBERS: number[] = [
  30477380,
  30453355,
  786110,
  // Add more if needed
];

// Default password for all users
export const DEFAULT_PASSWORD = '12345'; // replace with whatever you want

// Google Apps Script / Worker URL
export const APPS_SCRIPT_URL = 'https://quran-survey.aliasgerzmala.workers.dev/';

// Quran Sanad options
export const QURAN_SANAD_OPTIONS = [
  'No Sanad',
  'Hafiz',
  'Surah al-Balad',
  'Surah al-Inshiqaq',
  'Juz Amma',
  'Marhala Ula',
  'Marhala Sania',
  'Marhala Salesa',
  'Marhala Rabea',
  'Marhala Khamesa',
  'Marhala Sadesa',
  'Marhala Sabea',
  'Sanah Ula',
  'Sanah Saniyah',
  'Sanah Salesah',
] as const;

// Talim options
export const TALIM_OPTIONS = ['Yes', 'No'] as const;

// Sync windows
export const SYNC_WINDOWS = [
  { start: 10, end: 13 },
  { start: 19, end: 23 },
  { start: 23, end: 26 },
] as const;

// Sync intervals
export const SYNC_RETRY_INTERVAL = 15 * 60 * 1000;
export const SYNC_CHECK_INTERVAL = 60 * 1000;