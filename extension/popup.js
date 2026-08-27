const fileInput = document.getElementById("file");
const run = document.getElementById("run");
const status = document.getElementById("status");
const out = document.getElementById("out");

run.addEventListener("click", async () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) {
    status.textContent = "Pick a PDF or DOCX first.";
    return;
  }
  status.textContent = "Scoring…";
  out.hidden = true;
  const buf = await file.arrayBuffer();
  chrome.runtime.sendMessage(
    {
      type: "review-cv",
      name: file.name,
      mime: file.type,
      bytes: Array.from(new Uint8Array(buf)),
    },
    (res) => {
      if (chrome.runtime.lastError) {
        status.textContent = chrome.runtime.lastError.message;
        return;
      }
      if (!res || !res.ok) {
        status.textContent =
          (res && res.data && res.data.detail) ||
          (res && res.error) ||
          `Request failed (${res && res.status})`;
        return;
      }
      const scores = (res.data && res.data.scores) || {};
      const overall = scores.overall != null ? scores.overall : "?";
      const headline = res.data.headline || "Review ready";
      status.textContent = `Overall ${overall}/100`;
      out.hidden = false;
      out.textContent = `${headline}\n\nFull page: https://hireschema.com/reviewmycv`;
    },
  );
});
