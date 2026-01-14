export function isContactsView() {
  const url = window.location.href;

  if (url.includes("/leads") || url.includes("/contacts")) {
    return true;
  }

  // Fallback: detect email fields in list rows
  const emailElements = document.querySelectorAll('a[href^="mailto:"]');
  return emailElements.length > 0;
}
