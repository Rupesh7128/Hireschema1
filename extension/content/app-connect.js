/**
 * Relays auth from the Hireschema app connect page into the extension.
 */
(function () {
  function relay(payload) {
    if (!payload || payload.type !== "HIRESCHEMA_EXTENSION_AUTH" || !payload.accessToken) {
      return;
    }
    chrome.runtime.sendMessage(payload, () => {
      // ignore lastError when SW waking
    });
  }

  window.addEventListener("hireschema-extension-auth", (event) => {
    relay(event.detail);
  });

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.source !== "hireschema-app") return;
    relay(event.data);
  });
})();
