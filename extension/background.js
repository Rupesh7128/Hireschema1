/**
 * Defaults — override via chrome.storage after install if needed.
 * Production: Vercel proxy so cookies/CORS match the SPA.
 */
const DEFAULTS = {
  apiBase: "https://hireschema1.vercel.app/hireloop-api",
  appOrigin: "https://hireschema1.vercel.app",
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["apiBase", "appOrigin"], (cur) => {
    const patch = {};
    if (!cur.apiBase) patch.apiBase = DEFAULTS.apiBase;
    if (!cur.appOrigin) patch.appOrigin = DEFAULTS.appOrigin;
    if (Object.keys(patch).length) chrome.storage.local.set(patch);
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return false;

  if (message.type === "HIRESCHEMA_EXTENSION_AUTH" && message.accessToken) {
    chrome.storage.local.set(
      {
        accessToken: message.accessToken,
        refreshToken: message.refreshToken || null,
        expiresAt: message.expiresAt || null,
        email: message.email || null,
        connectedAt: Date.now(),
      },
      () => sendResponse({ ok: true })
    );
    return true;
  }

  if (message.type === "HIRESCHEMA_SAVE_JOB") {
    saveJob(message.payload)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((err) => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  if (message.type === "HIRESCHEMA_PREPARE_KIT") {
    prepareKit(message.jobId)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((err) => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  if (message.type === "HIRESCHEMA_GET_STATUS") {
    chrome.storage.local.get(
      ["accessToken", "email", "apiBase", "appOrigin", "autoPrepareKit"],
      (data) => {
        sendResponse({
          connected: Boolean(data.accessToken),
          email: data.email || null,
          apiBase: data.apiBase || DEFAULTS.apiBase,
          appOrigin: data.appOrigin || DEFAULTS.appOrigin,
          autoPrepareKit: data.autoPrepareKit !== false,
        });
      }
    );
    return true;
  }

  if (message.type === "HIRESCHEMA_DISCONNECT") {
    chrome.storage.local.remove(
      ["accessToken", "refreshToken", "expiresAt", "email", "connectedAt"],
      () => sendResponse({ ok: true })
    );
    return true;
  }

  return false;
});

async function getConfig() {
  const data = await chrome.storage.local.get([
    "accessToken",
    "apiBase",
    "appOrigin",
    "autoPrepareKit",
  ]);
  return {
    accessToken: data.accessToken || null,
    apiBase: (data.apiBase || DEFAULTS.apiBase).replace(/\/$/, ""),
    appOrigin: (data.appOrigin || DEFAULTS.appOrigin).replace(/\/$/, ""),
    autoPrepareKit: data.autoPrepareKit !== false,
  };
}

async function saveJob(payload) {
  const { accessToken, apiBase } = await getConfig();
  if (!accessToken) {
    const err = new Error("Not connected — open Sign in from the popup");
    err.code = "AUTH";
    throw err;
  }

  const res = await fetch(`${apiBase}/api/v1/extension/jobs/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    const err = new Error("Session expired — sign in again");
    err.code = "AUTH";
    throw err;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join("; ")
          : `Save failed (${res.status})`;
    throw new Error(msg);
  }
  return body;
}

async function prepareKit(jobId) {
  const { accessToken, apiBase } = await getConfig();
  if (!accessToken) {
    const err = new Error("Not connected — open Sign in from the popup");
    err.code = "AUTH";
    throw err;
  }
  if (!jobId) throw new Error("Missing job id");

  const res = await fetch(`${apiBase}/api/v1/application-kits/jobs/${jobId}/prepare`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    const err = new Error("Session expired — sign in again");
    err.code = "AUTH";
    throw err;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 202) {
    const detail = body.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join("; ")
          : `Prepare kit failed (${res.status})`;
    throw new Error(msg);
  }
  return body;
}
