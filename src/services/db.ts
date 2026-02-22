// import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
// import type { Person, PendingChange, SyncMeta } from '../types';
// import { SEED_ITS_NUMBERS } from '../config';

// interface QuranSurveyDB extends DBSchema {
//   people: {
//     key: number; // EjamaatID
//     value: Person;
//     indexes: {
//       'by-name': string;
//       'by-row': string;
//       'by-seat': string;
//     };
//   };
//   pendingChanges: {
//     key: number; // EjamaatID
//     value: PendingChange;
//   };
//   meta: {
//     key: string;
//     value: { key: string; data: SyncMeta | number | string };
//   };
//   auth: {
//     key: string;
//     value: { key: string; data: number[] };
//   };
// }

// let dbInstance: IDBPDatabase<QuranSurveyDB> | null = null;

// async function getDB(): Promise<IDBPDatabase<QuranSurveyDB>> {
//   if (dbInstance) return dbInstance;

//   dbInstance = await openDB<QuranSurveyDB>('quran-survey-db', 2, {
//     upgrade(db, oldVersion) {
//       if (oldVersion < 1) {
//         const peopleStore = db.createObjectStore('people', { keyPath: 'EjamaatID' });
//         peopleStore.createIndex('by-name', 'Full_Name');
//         peopleStore.createIndex('by-row', 'ROW');
//         peopleStore.createIndex('by-seat', 'SEAT');

//         db.createObjectStore('pendingChanges', { keyPath: 'EjamaatID' });
//         db.createObjectStore('meta', { keyPath: 'key' });
//         db.createObjectStore('auth', { keyPath: 'key' });
//       }
//     },
//   });

//   // Initialize allowed ITS numbers if not present
//   const authData = await dbInstance.get('auth', 'allowedITS');
//   if (!authData) {
//     // Ensure all numbers
//     const seedNumbers = SEED_ITS_NUMBERS.map(Number);
//     await dbInstance.put('auth', { key: 'allowedITS', data: seedNumbers });
//   }

//   return dbInstance;
// }

// // ---- People ----

// export async function getAllPeople(): Promise<Person[]> {
//   const db = await getDB();
//   return db.getAll('people');
// }

// export async function getPerson(ejamaatID: number): Promise<Person | undefined> {
//   const db = await getDB();
//   return db.get('people', ejamaatID);
// }

// export async function putPerson(person: Person): Promise<void> {
//   const db = await getDB();
//   await db.put('people', person);
// }

// export async function replaceAllPeople(people: Person[]): Promise<void> {
//   const db = await getDB();
//   const tx = db.transaction('people', 'readwrite');
//   await tx.store.clear();
//   for (const person of people) {
//     await tx.store.put(person);
//   }
//   await tx.done;
// }

// export async function getPeopleCount(): Promise<number> {
//   const db = await getDB();
//   return db.count('people');
// }

// // ---- Pending Changes ----

// export async function savePendingChange(change: PendingChange): Promise<void> {
//   const db = await getDB();
//   await db.put('pendingChanges', change);

//   // Update local person record immediately
//   const person = await db.get('people', change.EjamaatID);
//   if (person) {
//     person.Quran_Sanad = change.Quran_Sanad;
//     person.Talim = change.Talim;
//     person.Contact_No = change.Contact_No;
//     person.Is_Updated = change.Is_Updated;
//     await db.put('people', person);
//   }
// }

// export async function getAllPendingChanges(): Promise<PendingChange[]> {
//   const db = await getDB();
//   return db.getAll('pendingChanges');
// }

// export async function clearPendingChanges(): Promise<void> {
//   const db = await getDB();
//   await db.clear('pendingChanges');
// }

// export async function getPendingChangeCount(): Promise<number> {
//   const db = await getDB();
//   return db.count('pendingChanges');
// }

// // ---- Meta ----

// export async function getSyncMeta(): Promise<SyncMeta> {
//   const db = await getDB();
//   const meta = await db.get('meta', 'syncMeta');
//   if (!meta) return { lastSync: null, lastSyncStatus: 'idle' };
//   return meta.data as SyncMeta;
// }

// export async function updateSyncMeta(syncMeta: SyncMeta): Promise<void> {
//   const db = await getDB();
//   await db.put('meta', { key: 'syncMeta', data: syncMeta });
// }

// // ---- Auth ----

// export async function getLoggedInITS(): Promise<number | null> {
//   const db = await getDB();
//   const record = await db.get('auth', 'loggedInITS');
//   return record ? (record.data[0] as number) : null;
// }

// export async function setLoggedInITS(its: number | null): Promise<void> {
//   const db = await getDB();
//   if (its === null) {
//     await db.delete('auth', 'loggedInITS');
//   } else {
//     await db.put('auth', { key: 'loggedInITS', data: [its] });
//   }
// }

// export async function getAllowedITS(): Promise<number[]> {
//   const db = await getDB();
//   const record = await db.get('auth', 'allowedITS');
//   return record ? (record.data as number[]) : SEED_ITS_NUMBERS.map(Number);
// }

// export async function setAllowedITS(itsList: number[]): Promise<void> {
//   const db = await getDB();
//   const numbersList = itsList.map(Number);
//   await db.put('auth', { key: 'allowedITS', data: numbersList });
// }

// export async function isITSAllowed(its: number): Promise<boolean> {
//   const allowed = await getAllowedITS();
//   return allowed.includes(Number(its));
// }

// src/services/db.ts
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Person, PendingChange, SyncMeta } from '../types';
import { SEED_ITS_NUMBERS, DEFAULT_PASSWORD } from '../config';

interface QuranSurveyDB extends DBSchema {
  people: {
    key: number; // EjamaatID
    value: Person;
    indexes: {
      'by-name': string;
      'by-row': string;
      'by-seat': string;
    };
  };
  pendingChanges: {
    key: number; // EjamaatID
    value: PendingChange;
  };
  meta: {
    key: string;
    value: { key: string; data: SyncMeta | number | string };
  };
  auth: {
    key: string;
    value: { key: string; data: number | number[] | string };
  };
}

let dbInstance: IDBPDatabase<QuranSurveyDB> | null = null;

async function getDB(): Promise<IDBPDatabase<QuranSurveyDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<QuranSurveyDB>('quran-survey-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        // People store
        const peopleStore = db.createObjectStore('people', { keyPath: 'EjamaatID' });
        peopleStore.createIndex('by-name', 'Full_Name');
        peopleStore.createIndex('by-row', 'ROW');
        peopleStore.createIndex('by-seat', 'SEAT');

        // Pending changes store
        db.createObjectStore('pendingChanges', { keyPath: 'EjamaatID' });

        // Meta store
        db.createObjectStore('meta', { keyPath: 'key' });

        // Auth store
        db.createObjectStore('auth', { keyPath: 'key' });
      }
    },
  });

  // Initialize allowed ITS
  const authData = await dbInstance.get('auth', 'allowedITS');
  if (!authData) {
    await dbInstance.put('auth', { key: 'allowedITS', data: SEED_ITS_NUMBERS });
  }

  // Initialize default password
  const passwordData = await dbInstance.get('auth', 'defaultPassword');
  if (!passwordData) {
    await dbInstance.put('auth', { key: 'defaultPassword', data: DEFAULT_PASSWORD });
  }

  return dbInstance;
}

// ---- People ----
export async function getAllPeople(): Promise<Person[]> {
  const db = await getDB();
  return db.getAll('people');
}

export async function getPerson(ejamaatID: number): Promise<Person | undefined> {
  const db = await getDB();
  return db.get('people', ejamaatID);
}

export async function putPerson(person: Person): Promise<void> {
  const db = await getDB();
  await db.put('people', person);
}

export async function replaceAllPeople(people: Person[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('people', 'readwrite');
  await tx.store.clear();
  for (const person of people) {
    await tx.store.put(person);
  }
  await tx.done;
}

export async function getPeopleCount(): Promise<number> {
  const db = await getDB();
  return db.count('people');
}

// ---- Pending Changes ----
export async function savePendingChange(change: PendingChange): Promise<void> {
  const db = await getDB();
  await db.put('pendingChanges', change);

  // Update local person immediately
  const person = await db.get('people', change.EjamaatID);
  if (person) {
    person.Quran_Sanad = change.Quran_Sanad;
    person.Talim = change.Talim;
    person.Contact_No = change.Contact_No;
    person.Is_Updated = change.Is_Updated;
    await db.put('people', person);
  }
}

export async function getAllPendingChanges(): Promise<PendingChange[]> {
  const db = await getDB();
  return db.getAll('pendingChanges');
}

export async function clearPendingChanges(): Promise<void> {
  const db = await getDB();
  await db.clear('pendingChanges');
}

export async function getPendingChangeCount(): Promise<number> {
  const db = await getDB();
  return db.count('pendingChanges');
}

// ---- Meta ----
export async function getSyncMeta(): Promise<SyncMeta> {
  const db = await getDB();
  const meta = await db.get('meta', 'syncMeta');
  if (!meta) return { lastSync: null, lastSyncStatus: 'idle' };
  return meta.data as SyncMeta;
}

export async function updateSyncMeta(syncMeta: SyncMeta): Promise<void> {
  const db = await getDB();
  await db.put('meta', { key: 'syncMeta', data: syncMeta });
}

// ---- Auth ----
export async function getLoggedInITS(): Promise<number | null> {
  const db = await getDB();
  const record = await db.get('auth', 'loggedInITS');
  return record ? (record.data as number) : null;
}

export async function setLoggedInITS(its: number | null): Promise<void> {
  const db = await getDB();
  if (its === null) {
    await db.delete('auth', 'loggedInITS');
  } else {
    await db.put('auth', { key: 'loggedInITS', data: its });
  }
}

export async function getAllowedITS(): Promise<number[]> {
  const db = await getDB();
  const record = await db.get('auth', 'allowedITS');
  return record ? (record.data as number[]) : SEED_ITS_NUMBERS;
}

export async function setAllowedITS(itsList: number[]): Promise<void> {
  const db = await getDB();
  await db.put('auth', { key: 'allowedITS', data: itsList });
}

export async function isITSAllowed(its: number): Promise<boolean> {
  const allowed = await getAllowedITS();
  return allowed.includes(its);
}

export async function getDefaultPassword(): Promise<string> {
  const db = await getDB();
  const record = await db.get('auth', 'defaultPassword');
  return record ? (record.data as string) : DEFAULT_PASSWORD;
}