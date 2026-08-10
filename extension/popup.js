const $ = (id) => document.getElementById(id);

function showMessage(text, kind) {
  const el = $("message");
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("error", kind === "error");
  el.classList.toggle("ok", kind === "ok");
}

function send(type, extra = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...extra }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response || { ok: false, error: "No response" });
    });
  });
}

async function refreshStatus() {
  const status = await send("HIRESCHEMA_GET_STATUS");
  const line = $("status-line");
  const disconnect = $("btn-disconnect");
  if (status.connected) {
    line.textContent = status.email ? `Signed in as ${status.email}` : "Signed in";
    disconnect.classList.remove("hidden");
  } else {
    line.textContent = "Not connected";
    disconnect.classList.add("hidden");
  }
  $("api-base").value = status.apiBase || "";
  $("app-origin").value = status.appOrigin || "";
  $("auto-kit").checked = status.autoPrepareKit !== false;
  return status;
}

async function saveActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) {
    throw new Error("No active tab");
  }
  if (!/^https?:/i.test(tab.url)) {
    throw new Error("Open a job page (http/https) first");
  }

  let payload;
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const text = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
        const titleEl =
          document.querySelector(
            ".job-details-jobs-unified-top-card__job-title, h1, [data-testid='job-title'], .posting-headline h2, .job__title, .ashby-job-posting-header h1"
          ) || null;
        const title =
          (titleEl && titleEl.textContent && titleEl.textContent.trim()) ||
          document.title.replace(/\s*[|\-–].*$/, "").trim() ||
          "Untitled role";
        const company = text(
          ".job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link, .company-name, [data-company-name], .posting-headline .company-name, .job__company, a[data-testid='company-name']"
        );
        const location = text(
          ".job-details-jobs-unified-top-card__tertiary-description-container, .topcard__flavor--bullet, .job-location, [data-testid='job-location'], .location, .job__location"
        );
        const description = (
          text(
            "#job-details, .jobs-description__content, .job-posting-description, #content, #content .content, .posting-page .section-wrapper, [data-qa='job-description']"
          ) || ""
        ).slice(0, 3500);
        return {
          title,
          company,
          location,
          url: window.location.href,
          source_host: window.location.hostname,
          description_snippet: description || null,
        };
      },
    });
    payload = result;
  } catch {
    const u = new URL(tab.url);
    payload = {
      title: tab.title || "Untitled role",
      company: null,
      location: null,
      url: tab.url,
      source_host: u.hostname,
      description_snippet: null,
    };
  }

  const response = await send("HIRESCHEMA_SAVE_JOB", { payload });
  if (!response.ok) {
    const err = new Error(response.error || "Save failed");
    err.code = /sign in|session|connected|AUTH/i.test(String(response.error)) ? "AUTH" : "SAVE";
    throw err;
  }
  return response.result;
}

async function prepareKitForJob(jobId) {
  const response = await send("HIRESCHEMA_PREPARE_KIT", { jobId });
  if (!response.ok) {
    throw new Error(response.error || "Prepare kit failed");
  }
  return response.result;
}

async function openKitInApp(jobId, title, company) {
  const status = await refreshStatus();
  const origin = status.appOrigin || "https://hireschema1.vercel.app";
  const params = new URLSearchParams();
  params.set("kit_job_id", jobId);
  if (title) params.set("kit_title", title);
  if (company) params.set("kit_company", company);
  chrome.tabs.create({ url: `${origin}/dashboard?${params.toString()}` });
}

$("btn-save").addEventListener("click", async () => {
  const btn = $("btn-save");
  btn.disabled = true;
  showMessage("Saving…", null);
  try {
    const result = await saveActiveTab();
    const autoKit = $("auto-kit").checked;
    if (autoKit && result.job_id) {
      showMessage("Saved — preparing application kit…", null);
      await prepareKitForJob(result.job_id);
      showMessage("Saved + kit queued. Opening dashboard…", "ok");
      await openKitInApp(result.job_id, result.title, result.company);
    } else {
      showMessage(result.created ? "Saved to tracker (new job)." : "Saved to tracker.", "ok");
    }
  } catch (err) {
    showMessage(err.message || String(err), "error");
  } finally {
    btn.disabled = false;
  }
});

$("btn-prepare-kit").addEventListener("click", async () => {
  const btn = $("btn-prepare-kit");
  btn.disabled = true;
  showMessage("Saving & preparing kit…", null);
  try {
    const result = await saveActiveTab();
    if (!result.job_id) throw new Error("Save succeeded but no job id returned");
    await prepareKitForJob(result.job_id);
    showMessage("Kit queued — opening dashboard…", "ok");
    await openKitInApp(result.job_id, result.title, result.company);
  } catch (err) {
    showMessage(err.message || String(err), "error");
  } finally {
    btn.disabled = false;
  }
});

$("btn-connect").addEventListener("click", async () => {
  const status = await refreshStatus();
  const origin = status.appOrigin || "https://hireschema1.vercel.app";
  const url = `${origin}/extension/connect?id=${encodeURIComponent(chrome.runtime.id)}`;
  chrome.tabs.create({ url });
});

$("btn-tracker").addEventListener("click", async () => {
  const status = await refreshStatus();
  const origin = status.appOrigin || "https://hireschema1.vercel.app";
  chrome.tabs.create({ url: `${origin}/dashboard?panel=jobs&tab=saved` });
});

$("btn-disconnect").addEventListener("click", async () => {
  await send("HIRESCHEMA_DISCONNECT");
  showMessage("Disconnected.", "ok");
  await refreshStatus();
});

$("auto-kit").addEventListener("change", async () => {
  await chrome.storage.local.set({ autoPrepareKit: $("auto-kit").checked });
});

$("btn-save-settings").addEventListener("click", async () => {
  await chrome.storage.local.set({
    apiBase: $("api-base").value.trim().replace(/\/$/, ""),
    appOrigin: $("app-origin").value.trim().replace(/\/$/, ""),
    autoPrepareKit: $("auto-kit").checked,
  });
  showMessage("Settings saved.", "ok");
  await refreshStatus();
});

refreshStatus();
