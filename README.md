# Close CRM Data Extractor – Chrome Extension

## Project Overview

**Close CRM Data Extractor** is a **Chrome Extension (Manifest V3)** that extracts **Contacts, Opportunities, and Tasks** directly from the **Close CRM web interface**, stores the data locally using Chrome’s storage APIs, and displays it in a **React-based popup dashboard**.

This project demonstrates:

* Chrome Extension architecture (MV3)
* DOM scraping of complex, dynamic web applications
* Message passing between content scripts and service workers
* Local data persistence and synchronization
* Clean UI design using React and TailwindCSS

⚠️ Close CRM APIs are intentionally **not used**. All data is extracted via DOM inspection, as required.

---

## Assignment Objectives Mapping

| Assignment Module            | Implemented | Notes                                 |
| ---------------------------- | ----------- | ------------------------------------- |
| Data Extraction Engine       | ✅           | Content-script based DOM scraping     |
| Storage Layer                | ✅           | `chrome.storage.local` with schema    |
| Popup Dashboard              | ✅           | React + Tailwind UI                   |
| Visual Feedback (Shadow DOM) | ✅           | Injected status indicator             |
| Real-time Sync               | ✅           | `chrome.storage.onChanged`            |
| Bonus Features               | ⚠️ Partial  | Some optional bonuses not implemented |

---

## Technology Stack

### Core

* **Chrome Extension – Manifest V3**
* **JavaScript (ES6+)**
* **React (CDN-based)**
* **Tailwind CSS**

### Chrome APIs

* `chrome.runtime`
* `chrome.tabs`
* `chrome.storage.local`
* `chrome.storage.onChanged`

### Architecture Concepts

* Content Scripts
* Service Worker (Background)
* Message Passing
* Shadow DOM isolation

---

## Project Structure

```
Chrome-Extension-CRM-Data-Extractor/
│
├── manifest.json
│
├── service-worker/
│   └── background.js
│
├── popup/
│   ├── index.html
│   ├── App.js
│   ├── main.js
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   └── tailwind.js
│
├── storage/
│   └── storageManager.js
│
├── utils/
│   └── domHelpers.js
│
└── README.md
```

---

## Chrome Extension Architecture

### 1. Content Script

Responsibilities:

* Runs on Close CRM pages
* Detects which Close view is active
* Extracts data using DOM selectors
* Sends extracted payloads to the service worker

### 2. Service Worker (Background)

Responsibilities:

* Receives messages from popup and content scripts
* Triggers extraction on the active tab
* Coordinates storage updates
* Prevents race conditions

### 3. Storage Layer

Responsibilities:

* Centralized data persistence
* Deduplication and merging
* Update and delete operations
* Cross-tab synchronization

### 4. Popup UI (React)

Responsibilities:

* Displays extracted data
* Search and filter
* Delete records
* Trigger extraction manually

---

## Data Extraction Engine (Detailed)

### Supported Views

* **Contacts / Leads View**
* **Opportunities Pipeline View**
* **Tasks View**

The content script automatically determines the current view before extracting data.

---

### DOM Selection Strategy

**Primary Approach: CSS Selectors**

Reasons:

* Faster and more readable than XPath
* Easier to maintain
* Better compatibility with modern SPAs

**Fallback Strategies**:

* Structural DOM traversal
* Text-based matching when attributes are unavailable

 Absolute XPath expressions are intentionally avoided due to fragility.

---

### Handling Dynamic & Lazy-Loaded Content

Close CRM heavily uses dynamic rendering.

Mitigation techniques used:

* DOM mutation observation
* Re-runs extraction when DOM stabilizes

---

### View Detection Logic

The script determines the active view using:

* URL pattern inspection
* Presence of view-specific DOM nodes

This ensures the correct extraction logic runs for each page type.

---

## Storage Layer

All data is persisted using `chrome.storage.local`.

### Storage Schema

```json
{
  "close_data": {
    "contacts": [
      {
        "id": "uuid",
        "name": "John Doe",
        "emails": ["john@company.com"],
        "phones": ["+91xxxxxxxx"],
        "lead": "Company Name"
      }
    ],
    "opportunities": [
      {
        "id": "uuid",
        "name": "Deal Name",
        "value": 10000,
        "status": "Open",
        "closeDate": "2025-02-01"
      }
    ],
    "tasks": [
      {
        "id": "uuid",
        "description": "Follow up call",
        "dueDate": "2025-01-20",
        "assignee": "User",
        "done": false
      }
    ],
    "lastSync": 1736947200000
  }
}
```

---

### Data Integrity Handling

* **Deduplication**: ID-based merging
* **Updates**: Existing records overwritten
* **Deletions**: Explicit removal from storage
* **Race Conditions**: Controlled through centralized updates

---

## Popup Dashboard (React)

### Features

* Tab-based navigation

  * Contacts
  * Opportunities
  * Tasks
* Global search across records
* Delete individual records
* "Extract Now" button
* Displays last sync timestamp

### Real-Time Sync

The popup listens to:

```js
chrome.storage.onChanged
```

This ensures updates from other tabs reflect instantly.

---

## Visual Feedback (Shadow DOM)

When extraction runs:

* A lightweight status indicator is injected into the Close page
* Uses **Shadow DOM** to avoid CSS conflicts
* Displays:

  * Extracting
  * Success
  * Failure

---

## Installation & Usage

### Install (Developer Mode)

1. Clone this repository
2. Open Chrome → `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the project root folder

---

### How to Use

1. Log in to Close CRM
2. Navigate to Contacts / Opportunities / Tasks
3. Click the extension icon
4. Click **Extract Now**
5. View data in the popup dashboard

---

## Known Limitations

* DOM selectors may break if Close CRM UI changes
* No API-based fallback (intentional per assignment)
* CSV/JSON export not implemented (bonus feature)


---

## Author

**Prasun Kumar**

---

## References

* Close CRM Help Center
* Close Leads & Contacts Docs
* Close Opportunities Docs
* Close Tasks Docs
