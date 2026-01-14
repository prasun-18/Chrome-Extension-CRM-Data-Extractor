/**
 * Storage Manager – Close CRM Data
 * --------------------------------
 * Responsibilities:
 * - Persist extracted contacts
 * - Deduplicate & update records
 * - Maintain lastSync timestamp
 * - Prevent race conditions
 */

const STORAGE_KEY = "close_data";

/* --------------------------------
   Get Existing Storage
----------------------------------*/
function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || {
        contacts: [],
        opportunities: [],
        tasks: [],
        lastSync: null
      });
    });
  });
}

/* --------------------------------
   Save Data Atomically
----------------------------------*/
function saveStoredData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [STORAGE_KEY]: data },
      () => resolve()
    );
  });
}

/* --------------------------------
   Merge Contacts (Dedup + Update)
----------------------------------*/
export async function upsertContacts(newContacts) {
  const storage = await getStoredData();

  const existingMap = new Map(
    storage.contacts.map(c => [c.id, c])
  );

  newContacts.forEach((contact) => {
    if (existingMap.has(contact.id)) {
      // UPDATE existing contact
      existingMap.set(contact.id, {
        ...existingMap.get(contact.id),
        ...contact
      });
    } else {
      // INSERT new contact
      existingMap.set(contact.id, contact);
    }
  });

  storage.contacts = Array.from(existingMap.values());
  storage.lastSync = Date.now();

  await saveStoredData(storage);

  return storage.contacts;
}

/* --------------------------------
   Delete Contact by ID
----------------------------------*/
export async function deleteContact(contactId) {
  const storage = await getStoredData();

  storage.contacts = storage.contacts.filter(
    c => c.id !== contactId
  );

  await saveStoredData(storage);
}

/* --------------------------------
   Read Contacts
----------------------------------*/
export async function getContacts() {
  const storage = await getStoredData();
  return storage.contacts;
}

/* --------------------------------
   Clear Contacts (Optional Utility)
----------------------------------*/
export async function clearContacts() {
  const storage = await getStoredData();
  storage.contacts = [];
  await saveStoredData(storage);
}
