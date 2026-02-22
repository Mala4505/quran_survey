// App Configuration

// Replace this with your deployed Google Apps Script Web App URL
// export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtr6eb-jfpcjpN2ccz5OCWeBw-hJ_Mma33Aqr8PNwNe6D_KWbKWh4YUQ1V51qSK6tr/exec';
export const APPS_SCRIPT_URL = 'https://quran-survey.aliasgerzmala.workers.dev/';

// Seed ITS numbers that can log in before first sync
export const SEED_ITS_NUMBERS = [30477380, 30453355];

// Quran Sanad options
export const QURAN_SANAD_OPTIONS = [
    'Juz Amma',
    'Marhala Khamesa',
    'Marhala Rabea',
    'Marhala Sabea',
    'Marhala Sadesa',
    'Marhala Salesa',
    'Marhala Sania',
    'Marhala Ula',
    'Sanah Salesah',
    'Sanah Saniyah',
    'Sanah Ula',
    'Hafiz',
    'Surah al-Balad',
    'Surah al-Inshiqaq',
    'No Sanad',
] as const;

// Talim options
export const TALIM_OPTIONS = ['Yes', 'No'] as const;

// Sync windows (hours in 24h format)
export const SYNC_WINDOWS = [
    { start: 10, end: 13 },   // 10:00 AM – 1:00 PM
    { start: 19, end: 23 },   // 7:00 PM – 11:00 PM
    { start: 23, end: 26 },   // 11:00 PM – 2:00 AM (26 = 2 AM next day)
] as const;

// Sync retry interval in milliseconds (15 minutes)
export const SYNC_RETRY_INTERVAL = 15 * 60 * 1000;

// Sync check interval in milliseconds (1 minute)
export const SYNC_CHECK_INTERVAL = 60 * 1000;
