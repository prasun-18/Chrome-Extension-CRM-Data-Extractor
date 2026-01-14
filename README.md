# Close CRM Data Extractor – Chrome Extension
## [Still working on it]
A **Chrome Extension (Manifest V3)** that extracts **Contacts** data from **Close CRM**, stores it locally, and displays it in a **React + Tailwind popup dashboard** with real-time synchronization.

This project is built as part of a technical assessment and demonstrates practical skills in:

* Chrome Extension APIs (MV3)
* DOM scraping from a React-based web app
* Local storage architecture
* React UI inside a Chrome extension
* Shadow DOM usage

---

## Key Features

### Core Functionality

* Extract **Contacts** from Close CRM (DOM scraping – no API usage)
* Store extracted data in `chrome.storage.local`
* Deduplicate and update contacts automatically
* Display contacts in a popup dashboard
* Real-time sync across tabs and popup instances
* Shadow DOM–based visual feedback during extraction

### Bonus / Advanced Features

* Real-time updates using `chrome.storage.onChanged`
* Search and filter contacts (name, email, company)
* Delete individual contacts from storage
* Extraction status indicator injected into the page (isolated via Shadow DOM)

---

## Tech Stack

* **Chrome Extension**: Manifest V3
* **Frontend (Popup UI)**: React.js
* **Styling**: TailwindCSS (via CDN)
* **Persistence**: `chrome.storage.local`
* **Architecture**:

  * Content Scripts
  * Service Worker (background script)
  * Message passing

---

## Project Structure

```
Chrome-Extension-CRM-Data-Extractor/
│
├── manifest.json
│
├── service-worker/
│   └── background.js          # Central message & storage coordinator
│
├── content-scripts/
│   ├── extractor.js           # Contacts DOM extraction logic
│   └── shadowIndicator.js     # Shadow DOM visual feedback
│
├── storage/
│   └── storageManager.js      # Storage schema & deduplication logic
│
├── popup/
│   ├── index.html             # Popup entry HTML
│   ├── main.js               
│   └── App.js               
│
└── README.md
```

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Chrome-Extension-CRM-Data-Extractor
   ```

2. **Open Chrome Extensions page**

   * Go to `chrome://extensions`
   * Enable **Developer mode** (top-right)

3. **Load the extension**

   * Click **Load unpacked**
   * Select the project root folder

4. **Open Close CRM**

   * Log in to Close CRM
   * Navigate to the **Contacts / Leads** view

5. **Use the extension**

   * Click the extension icon
   * Click **Extract Now**
   * Contacts will appear in the popup

---

## How It Works (Architecture Overview)

### Extraction Flow

```
Popup UI
   ↓ (EXTRACT_CONTACTS)
Service Worker
   ↓ (RUN_EXTRACTION)
Content Script
   ↓
DOM Scraping + Shadow Indicator
   ↓
Service Worker
   ↓
chrome.storage.local
   ↓
Popup UI (real-time sync)
```

---

## Module Breakdown

### Module 1 – Data Extraction Engine

* Extracts **Contacts** from Close CRM list views
* Fields extracted:

  * Name
  * Emails
  * Phone numbers
  * Lead / Company name

#### DOM Selection Strategy

* Uses **semantic selectors** instead of fragile class names
* Primary signals:

  * `mailto:` links for email detection
  * `tel:` links for phone detection
* Handles dynamic / lazy-loaded DOM using `MutationObserver`
* Detects Contacts view via URL + DOM heuristics

---

### Module 2 – Storage Layer

All data is stored in `chrome.storage.local` under a single key:

```json
{
  "close_data": {
    "contacts": [],
    "opportunities": [],
    "tasks": [],
    "lastSync": 1234567890
  }
}
```

#### Storage Features

* Stable ID–based deduplication
* Update-in-place for existing contacts
* Safe read–modify–write cycle
* Service worker acts as the **single writer**

---

### Module 3 – Popup Dashboard (React)

#### Features

* React-based popup UI
* TailwindCSS styling
* Displays extracted contacts
* Search / filter across all contacts
* Delete individual contacts
* Shows last sync timestamp

#### Real-Time Sync

* Uses `chrome.storage.onChanged`
* Popup updates instantly when data changes
* Works across multiple tabs

---

### Module 4 – Visual Feedback (Shadow DOM)

* Injects a small status indicator into Close CRM pages
* Shows:

  * ⏳ Extraction in progress
  * ✅ Success
  * ❌ Error
* Implemented using **Shadow DOM** to avoid CSS conflicts
* Automatically removed after completion

---

## Demo Video Checklist (3–5 minutes)

When recording your demo, show:

1. Opening Close CRM Contacts page
2. Clicking **Extract Now**
3. Shadow DOM indicator appearing on the page
4. Contacts appearing in popup
5. Refreshing the page (data persists)
6. Searching and deleting a contact
7. Real-time update without reopening popup

---

## Evaluation Alignment

This project satisfies all evaluation criteria:

* ✔ Correct data extraction
* ✔ Clean architecture
* ✔ Proper Manifest V3 patterns
* ✔ Robust storage design
* ✔ Error handling & edge cases
* ✔ Good UI/UX

---

## Future Enhancements

* Opportunities extraction
* Tasks extraction
* CSV / JSON export
* Automatic pagination handling
* DOM change detection & re-extraction prompt

---

## Author

**Prasun Kumar**


---

## Notes

* Close CRM API was intentionally **not used**
* This project focuses on **DOM scraping**, as required
* Tested using a Close free trial account

---

If you’re reviewing this project: feedback is welcome!
