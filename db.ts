
// db.ts - Database Handler for FlowDo
// Simplified for Timer-only mode.
// Note: Actual stats are currently handled via localStorage in this version for simplicity, 
// but we keep the DB structure for future extensive data features (like detailed session logs).

const DB_NAME = 'FlowDoDB';
const DB_VERSION = 2; // Incremented version
const STORE_NAME = 'settings'; // Repurposed or kept for future use

// Open Database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const db = {
  // Export/Import for Backup
  async exportAllData(): Promise<string> {
    const stats = localStorage.getItem('flowdo-stats');
    const settings = localStorage.getItem('flowdo-settings');
    const timerConfig = localStorage.getItem('flowdo-timer-config');
    
    const backup = {
      version: 3, // Version 3 for Timer-only schema
      timestamp: Date.now(),
      stats: stats ? JSON.parse(stats) : null,
      settings: settings ? JSON.parse(settings) : null,
      timerConfig: timerConfig ? JSON.parse(timerConfig) : null
    };
    
    return JSON.stringify(backup);
  },

  async importData(jsonString: string): Promise<boolean> {
     try {
       const data = JSON.parse(jsonString);
       // basic validation - checking for stats or settings presence
       if (!data.stats && !data.settings && !data.timerConfig) throw new Error("Invalid backup format");
       
       // Restore local storage
       if (data.stats) localStorage.setItem('flowdo-stats', JSON.stringify(data.stats));
       if (data.settings) localStorage.setItem('flowdo-settings', JSON.stringify(data.settings));
       if (data.timerConfig) localStorage.setItem('flowdo-timer-config', JSON.stringify(data.timerConfig));
       
       return true;
     } catch(e) {
       console.error("Import failed", e);
       return false;
     }
  }
};
