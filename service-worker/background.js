import { upsertContacts } from "../storage/storageManager.js";

/* --------------------------------
   Handle Messages (Central Hub)
----------------------------------*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /* --------------------------------
     Trigger Extraction from Popup
  ----------------------------------*/
  if (message.type === "EXTRACT_CONTACTS") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        sendResponse({ status: "error", message: "No active tab" });
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: "RUN_EXTRACTION" },
        async (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({
              status: "error",
              message: chrome.runtime.lastError.message
            });
            return;
          }

          if (!response || response.status !== "success") {
            sendResponse(response);
            return;
          }

          try {
            const storedContacts = await upsertContacts(
              response.data.contacts
            );

            sendResponse({
              status: "success",
              data: {
                storedCount: storedContacts.length,
                addedOrUpdated: response.data.contacts.length
              }
            });
          } catch (err) {
            sendResponse({
              status: "error",
              message: err.message
            });
          }
        }
      );
    });

    // IMPORTANT: async response
    return true;
  }
});
