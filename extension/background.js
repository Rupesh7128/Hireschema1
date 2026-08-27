const API =
  "https://hireschema.com/hireloop-api/api/v1/public/review-cv";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "review-cv") return false;
  const bytes = new Uint8Array(message.bytes);
  const blob = new Blob([bytes], { type: message.mime || "application/pdf" });
  const form = new FormData();
  form.append("resume", blob, message.name || "resume.pdf");
  fetch(API, { method: "POST", body: form })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      sendResponse({ ok: res.ok, status: res.status, data });
    })
    .catch((err) => {
      sendResponse({ ok: false, status: 0, error: String(err).slice(0, 200) });
    });
  return true;
});
