/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */
function isTargetView() {
  const url = window.location.href;
  return url.includes("/leads") || url.includes("/contacts") || 
         url.includes("/opportunities") || url.includes("/tasks");
}

function generateId(prefix, seed) {
  const str = `${prefix}-${seed}`.replace(/\s+/g, '-').toLowerCase();
  return `${prefix}_${btoa(unescape(encodeURIComponent(str)))}`;
}

/* ---------------------------------------------------------
   EXTRACTION ENGINE
--------------------------------------------------------- */
function extractData() {
  const results = { contacts: [], opportunities: [], tasks: [] };
  const rows = document.querySelectorAll('tr, [role="row"], .ContactListRow, .list-row');

  rows.forEach((row) => {
    // 1. CONTACTS
    const emailEls = row.querySelectorAll('a[href^="mailto:"]');
    if (emailEls.length > 0) {
      const nameEl = row.querySelector('td:first-child a, [data-testid*="name"], .ContactName');
      const name = nameEl?.innerText?.trim() || "Unknown Contact";
      
      if (name !== "Name" && name !== "Unknown Contact") {
          results.contacts.push({ 
            id: generateId('con', name + (emailEls[0]?.innerText || Math.random())), 
            name, 
            emails: Array.from(emailEls).map(e => e.innerText.trim()), 
            phones: Array.from(row.querySelectorAll('a[href^="tel:"]')).map(p => p.innerText.trim()), 
            lead: row.querySelector('td:nth-child(2), .lead')?.innerText?.trim() || ""
          });
      }
      return; 
    }

    // 2. OPPORTUNITIES
    const valueEl = row.querySelector('[data-testid*="value"], .opportunity-value, .OpportunityValue');
    if (valueEl) {
      const oppName = row.querySelector('.opp-name, [data-testid*="title"], .OpportunityTitle')?.innerText?.trim() || "Opportunity";
      results.opportunities.push({
        id: generateId('opp', oppName),
        name: oppName,
        value: valueEl.innerText.trim(),
        status: row.querySelector('.status, .OpportunityStatus')?.innerText?.trim() || "Active",
        closeDate: row.querySelector('.date, .ExpectedCloseDate')?.innerText?.trim() || ""
      });
      return;
    }

    // 3. TASKS
    const taskText = row.querySelector('.description, .TaskDescription, [data-testid*="task"]');
    if (taskText) {
      results.tasks.push({
        id: generateId('task', taskText.innerText.trim()),
        description: taskText.innerText.trim(),
        dueDate: row.querySelector('.due-date, .TaskDueDate')?.innerText?.trim() || "No date",
        assignee: "Me",
        done: !!row.querySelector('[type="checkbox"]:checked')
      });
    }
  });

  return results;
}

/* ---------------------------------------------------------
   MESSAGE LISTENER
--------------------------------------------------------- */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RUN_EXTRACTION") {
    (async () => {
      try {
        if (!isTargetView()) {
          sendResponse({ status: "error", message: "Navigate to a list view in Close" });
          return;
        }
        const data = extractData();
        sendResponse({ status: "success", data: data });
      } catch (err) {
        sendResponse({ status: "error", message: err.message });
      }
    })();
    return true; 
  }
});