/**
 * Shadow DOM Status Indicator
 * ---------------------------
 * Shows extraction progress without CSS conflicts
 */

let indicatorHost = null;
let hideTimeout = null;

export function showIndicator(status, message) {
  // Remove existing indicator if any
  removeIndicator();

  indicatorHost = document.createElement("div");
  indicatorHost.style.position = "fixed";
  indicatorHost.style.bottom = "20px";
  indicatorHost.style.right = "20px";
  indicatorHost.style.zIndex = "999999";

  const shadowRoot = indicatorHost.attachShadow({ mode: "open" });

  shadowRoot.innerHTML = `
    <style>
      .box {
        font-family: system-ui, sans-serif;
        background: #111827;
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .success { color: #22c55e; }
      .error { color: #ef4444; }
    </style>

    <div class="box">
      ${status === "loading" ? `<div class="spinner"></div>` : ""}
      <span class="${status}">
        ${message}
      </span>
    </div>
  `;

  document.body.appendChild(indicatorHost);

  if (status !== "loading") {
    hideTimeout = setTimeout(removeIndicator, 2500);
  }
}

export function removeIndicator() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (indicatorHost) {
    indicatorHost.remove();
    indicatorHost = null;
  }
}
