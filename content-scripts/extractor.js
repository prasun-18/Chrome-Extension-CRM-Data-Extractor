import { isContactsView } from "../utils/domHelpers.js";
import { showIndicator } from "./shadowIndicator.js";

/* --------------------------------
   Utility: Wait for Contacts DOM
----------------------------------*/
function waitForContactsToLoad(timeout = 4000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // If already present, resolve immediately
    if (document.querySelectorAll('a[href^="mailto:"]').length > 0) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelectorAll('a[href^="mailto:"]').length > 0) {
        observer.disconnect();
        resolve();
      }

      if (Date.now() - startTime > timeout) {
        observer.disconnect();
        resolve(); // fail-safe
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

/* --------------------------------
   ID Generator (Stable)
----------------------------------*/
function generateContactId(name, emails) {
  const base = `${name}_${emails[0] || ""}`;
  return `contact_${btoa(unescape(encodeURIComponent(base)))}`;
}

/* --------------------------------
   Contacts Extraction Logic
----------------------------------*/
function extractContacts() {
  const contactsMap = new Map();

  // Close renders rows dynamically; keep selectors flexible
  const rows = document.querySelectorAll(
    '[role="row"], .list-row, li, div'
  );

  rows.forEach((row) => {
    const emailEls = row.querySelectorAll('a[href^="mailto:"]');
    if (emailEls.length === 0) return; // Not a contact row

    const phoneEls = row.querySelectorAll('a[href^="tel:"]');

    const nameEl =
      row.querySelector("strong") ||
      row.querySelector(".name") ||
      row.querySelector('[data-testid*="name"]');

    const leadEl =
      row.querySelector(".lead") ||
      row.querySelector(".company") ||
      row.querySelector('[data-testid*="company"]');

    const name = nameEl?.innerText?.trim();
    if (!name) return;

    const emails = Array.from(emailEls)
      .map(e => e.innerText.trim())
      .filter(Boolean);

    const phones = Array.from(phoneEls)
      .map(p => p.innerText.trim())
      .filter(Boolean);

    const lead = leadEl?.innerText?.trim() || "";

    const id = generateContactId(name, emails);

    // Deduplicate within the same extraction run
    if (!contactsMap.has(id)) {
      contactsMap.set(id, {
        id,
        name,
        emails,
        phones,
        lead
      });
    }
  });

  return Array.from(contactsMap.values());
}

/* --------------------------------
   Message Listener (MV3 Safe)
----------------------------------*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "RUN_EXTRACTION") return;

  (async () => {
    if (!isContactsView()) {
      showIndicator("error", "Not on Contacts view");
      sendResponse({
        status: "error",
        message: "Not on Close Contacts view"
      });
      return;
    }

    showIndicator("loading", "Extracting contacts…");

    await waitForContactsToLoad();

    const contacts = extractContacts();

    showIndicator("success", `Extracted ${contacts.length} contacts`);

    sendResponse({
      status: "success",
      data: { contacts }
    });
  })();

  return true;
});

