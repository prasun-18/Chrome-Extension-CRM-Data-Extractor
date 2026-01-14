import { upsertData } from "../storage/storageManager.js";

/* --------------------------------
   Handle Messages (Central Hub)
----------------------------------*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_CONTACTS") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        sendResponse({ status: "error", message: "No active tab found" });
        return;
      }

      // 1. Trigger extraction in the content script
      chrome.tabs.sendMessage(tab.id, { type: "RUN_EXTRACTION" }, async (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: "error", message: chrome.runtime.lastError.message });
          return;
        }

        if (response && response.status === "success") {
          try {
            // 2. Save all extracted data (Contacts, Opps, Tasks) to storage
            await upsertData(response.data);
            sendResponse({ status: "success", data: response.data });
          } catch (err) {
            sendResponse({ status: "error", message: "Storage failed: " + err.message });
          }
        } else {
          sendResponse(response || { status: "error", message: "Extraction failed" });
        }
      });
    });
    return true; // Keep message channel open for async response
  }
});