(function () {
  if (document.getElementById("hireschema-chip")) return;
  const chip = document.createElement("a");
  chip.id = "hireschema-chip";
  chip.href = "https://hireschema.com/reviewmycv";
  chip.target = "_blank";
  chip.rel = "noreferrer";
  chip.textContent = "Score CV on Hireschema";
  chip.style.cssText =
    "position:fixed;z-index:2147483646;right:16px;bottom:16px;background:#141414;color:#f7f6f2;padding:10px 12px;font:13px/1.2 ui-sans-serif,system-ui,sans-serif;text-decoration:none;border-radius:4px;";
  document.documentElement.appendChild(chip);
})();
