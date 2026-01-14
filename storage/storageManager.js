const STORAGE_KEY = "close_data";

export async function upsertData(newData) {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const storage = result[STORAGE_KEY] || { contacts: [], opportunities: [], tasks: [], lastSync: null };

      // Helper for deduplication
      const merge = (existing, incoming) => {
        const map = new Map(existing.map(item => [item.id, item]));
        incoming.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
        return Array.from(map.values());
      };

      storage.contacts = merge(storage.contacts, newData.contacts || []);
      storage.opportunities = merge(storage.opportunities, newData.opportunities || []);
      storage.tasks = merge(storage.tasks, newData.tasks || []);
      storage.lastSync = Date.now();

      chrome.storage.local.set({ [STORAGE_KEY]: storage }, () => resolve(storage));
    });
  });
}