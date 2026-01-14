function App() {
  const { useState, useEffect } = React;

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Initial load + real-time sync
  useEffect(() => {
    chrome.storage.local.get(["close_data"], (res) => {
      const data = res.close_data || {};
      setContacts(data.contacts || []);
      setLastSync(data.lastSync || null);
    });

    const onStorageChange = (changes, area) => {
      if (area !== "local") return;
      if (!changes.close_data) return;

      const newData = changes.close_data.newValue || {};
      setContacts(newData.contacts || []);
      setLastSync(newData.lastSync || null);
    };

    chrome.storage.onChanged.addListener(onStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(onStorageChange);
    };
  }, []);

  const extractNow = () => {
    if (loading) return;

    setLoading(true);
    chrome.runtime.sendMessage({ type: "EXTRACT_CONTACTS" }, () => {
      setLoading(false);
    });
  };

  const deleteContact = (id) => {
    chrome.storage.local.get(["close_data"], (res) => {
      const data = res.close_data || {
        contacts: [],
        opportunities: [],
        tasks: [],
        lastSync: null
      };

      data.contacts = data.contacts.filter((c) => c.id !== id);
      data.lastSync = Date.now();

      chrome.storage.local.set({ close_data: data });
    });
  };

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.lead || "").toLowerCase().includes(q) ||
      (c.emails || []).join(" ").toLowerCase().includes(q)
    );
  });

  return React.createElement(
    "div",
    { className: "p-3 font-sans" },
    React.createElement(
      "h1",
      { className: "text-lg font-bold mb-2" },
      "Close CRM Extractor"
    ),

    React.createElement(
      "button",
      {
        onClick: extractNow,
        disabled: loading,
        className:
          "px-3 py-1 rounded text-sm text-white " +
          (loading ? "bg-gray-400" : "bg-blue-600")
      },
      loading ? "Extracting..." : "Extract Now"
    ),

    React.createElement(
      "p",
      { className: "text-xs mt-2 text-gray-500" },
      "Last Sync: ",
      lastSync ? new Date(lastSync).toLocaleString() : "Never"
    ),

    React.createElement("input", {
      type: "text",
      placeholder: "Search contacts...",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "w-full border px-2 py-1 text-sm rounded my-2"
    }),

    React.createElement(
      "div",
      { className: "space-y-2 max-h-[320px] overflow-y-auto" },
      filteredContacts.length === 0
        ? React.createElement(
            "p",
            { className: "text-sm text-gray-500 mt-4" },
            "No contacts found"
          )
        : filteredContacts.map((c) =>
            React.createElement(
              "div",
              {
                key: c.id,
                className:
                  "border rounded p-2 flex justify-between items-start"
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "p",
                  { className: "font-medium" },
                  c.name
                ),
                React.createElement(
                  "p",
                  { className: "text-xs" },
                  (c.emails || []).join(", ")
                ),
                React.createElement(
                  "p",
                  { className: "text-xs text-gray-500" },
                  c.lead
                )
              ),
              React.createElement(
                "button",
                {
                  onClick: () => deleteContact(c.id),
                  className: "text-red-500 text-xs"
                },
                "Delete"
              )
            )
          )
    )
  );
}
