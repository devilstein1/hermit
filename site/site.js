const form = document.getElementById("form");
const fileInput = document.getElementById("files");
const drop = document.getElementById("drop");
const dropText = document.getElementById("dropText");
const fileList = document.getElementById("fileList");
const deliveryMode = document.getElementById("deliveryMode");
const telegramFields = document.getElementById("telegramFields");
const checkBtn = document.getElementById("checkBtn");
const checkResult = document.getElementById("checkResult");
const submitBtn = document.getElementById("submitBtn");
const logSection = document.getElementById("log");
const logStatus = document.getElementById("logStatus");
const logLines = document.getElementById("logLines");
const results = document.getElementById("results");

const PLATFORM_LABELS = {
  v7: "32-bit Android",
  v8: "64-bit Android",
  win: "Windows",
  linux: "Linux",
};

/* ── Ambient dot field (crystallizes to ember near cursor) ── */
(function bgField() {
  const canvas = document.getElementById("bg");
  const glow = document.getElementById("glow");
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h, dots = [];
  const spacing = touch ? 44 : 36;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    for (let y = spacing / 2; y < h + spacing; y += spacing) {
      for (let x = spacing / 2; x < w + spacing; x += spacing) {
        dots.push({ x, y, base: x + y });
      }
    }
  }

  let mx = w / 2, my = h / 2;
  if (touch) {
    window.addEventListener("scroll", () => {
      my = (window.scrollY % h);
      if (glow) glow.style.setProperty("--gy", (my / h * 100) + "%");
    }, { passive: true });
  } else {
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (glow) {
        glow.style.setProperty("--gx", (mx / window.innerWidth * 100) + "%");
        glow.style.setProperty("--gy", (my / window.innerHeight * 100) + "%");
      }
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const dx = d.x - mx, dy = d.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const near = touch ? 0 : Math.max(0, 1 - dist / 210);
      const drift = reduce ? 0 : Math.sin(t / 2800 + d.base) * 0.6;
      const r = 1 + near * 1.7;
      ctx.beginPath();
      ctx.arc(d.x, d.y + drift, r, 0, Math.PI * 2);
      ctx.fillStyle = near > 0.05
        ? `rgba(232,161,60,${0.10 + near * 0.4})`
        : "rgba(237,239,243,0.045)";
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  if (reduce) draw(0);
  else requestAnimationFrame(draw);
})();

/* ── State readers ── */
function getVersions() {
  return [...form.querySelectorAll('input[name="versions"]:checked')].map(i => i.value);
}
function getPlatforms() {
  return [...form.querySelectorAll('input[name="platforms"]:checked')].map(i => i.value);
}
function protectionLayers() {
  if (!obfuscate.checked) return [];
  const ids = ["antiSite", "antiDebug"];
  return ids
    .map(id => document.getElementById(id))
    .filter(el => el && el.checked)
    .map(el => el.nextElementSibling.querySelector("b")?.textContent || "");
}

/* ── Topbar matrix ── */
const matrixCount = document.getElementById("matrixCount");
const matrixGrid = document.getElementById("matrixGrid");

function updateMatrix() {
  const n = getVersions().length * getPlatforms().length;
  matrixCount.textContent = n;
  const cells = Math.min(Math.max(n, 0), 16);
  matrixGrid.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("i");
    if (i < cells) cell.classList.add("lit");
    matrixGrid.appendChild(cell);
  }
}

/* ── Live pipeline (hero signature) ── */
function setStage(el, on, meta) {
  el.classList.toggle("on", on);
  const m = el.querySelector(".stage-meta");
  if (m && meta != null) m.textContent = meta;
}
function updatePipeline() {
  const n = getVersions().length * getPlatforms().length;
  const layers = protectionLayers().length;
  const delivery = deliveryMode.querySelector("input:checked").value;

  setStage(document.getElementById("pipeSource"), selectedFiles.length > 0,
    selectedFiles.length ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}` : "no files");
  setStage(document.getElementById("pipeObf"), obfuscate.checked, obfuscate.checked ? "on" : "off");
  setStage(document.getElementById("pipeHarden"), layers > 0,
    `${layers} layer${layers === 1 ? "" : "s"}`);
  setStage(document.getElementById("pipeCompile"), n > 0,
    `${n} target${n === 1 ? "" : "s"}`);
  setStage(document.getElementById("pipeDeliver"), true,
    delivery === "bot" ? "telegram" : "download");
}

/* ── Live build-order manifest ── */
function updateSummary() {
  const versions = getVersions();
  const platforms = getPlatforms();
  const n = versions.length * platforms.length;
  const layers = protectionLayers();
  const bundle = form.querySelector('input[name="bundle_mode"]:checked').value;
  const delivery = deliveryMode.querySelector("input:checked").value;

  const sumCount = document.getElementById("sumCount");
  const sumFiles = document.getElementById("sumFiles");
  const sumObf = document.getElementById("sumObf");
  const sumProtect = document.getElementById("sumProtect");
  const sumTargets = document.getElementById("sumTargets");
  const sumOutput = document.getElementById("sumOutput");
  const sumDelivery = document.getElementById("sumDelivery");
  const sumNote = document.getElementById("sumNote");

  sumCount.textContent = n;

  sumFiles.textContent = selectedFiles.length
    ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}`
    : "No files yet";
  sumFiles.className = selectedFiles.length ? "on-live" : "";

  if (obfuscate.checked) {
    sumObf.textContent = "On";
    sumObf.className = "on-ember";
  } else {
    sumObf.textContent = "Off (not recommended)";
    sumObf.className = "";
  }

  sumProtect.textContent = layers.length ? layers.join(", ") : "None";
  sumProtect.className = layers.length ? "on-ember" : "";

  if (n === 0) {
    sumTargets.textContent = "—";
    sumTargets.className = "mono";
  } else {
    const combos = [];
    for (const v of versions) for (const p of platforms) {
      combos.push(`${v} · ${PLATFORM_LABELS[p] || p}`);
    }
    sumTargets.textContent = combos.length <= 3 ? combos.join("  ·  ") : `${combos.length} combinations`;
    sumTargets.className = "mono";
  }

  sumOutput.textContent = bundle === "zip" ? "Single ZIP" : "Individual files";
  sumDelivery.textContent = delivery === "bot" ? "Telegram" : "Download";

  if (!selectedFiles.length) sumNote.textContent = "Choose your source to begin.";
  else if (n === 0) sumNote.textContent = "Pick at least one version and platform.";
  else sumNote.textContent = `Ready to forge ${n} artifact${n === 1 ? "" : "s"}.`;
}

function refreshAll() {
  updateMatrix();
  updatePipeline();
  updateSummary();
}
form.addEventListener("change", refreshAll);

/* ── File selection ── */
let selectedFiles = [];

function renderFiles() {
  fileList.innerHTML = "";
  for (const f of selectedFiles) {
    const li = document.createElement("li");
    li.textContent = f.name;
    fileList.appendChild(li);
  }
  drop.classList.toggle("loaded", selectedFiles.length > 0);
  dropText.innerHTML = selectedFiles.length
    ? `${selectedFiles.length} file(s) selected — tap to change`
    : "Tap to choose <code>.py</code> files, or drag &amp; drop";
  refreshAll();
}

drop.addEventListener("click", (e) => {
  if (e.target !== fileInput) fileInput.click();
});
fileInput.addEventListener("change", () => {
  selectedFiles = [...fileInput.files].filter(f => f.name.toLowerCase().endsWith(".py"));
  renderFiles();
});
["dragover", "dragleave", "drop"].forEach(evt => {
  drop.addEventListener(evt, (e) => {
    e.preventDefault();
    drop.classList.toggle("dragover", evt === "dragover");
  });
});
drop.addEventListener("drop", (e) => {
  const dropped = [...e.dataTransfer.files].filter(f => f.name.toLowerCase().endsWith(".py"));
  if (dropped.length) {
    selectedFiles = dropped;
    renderFiles();
  }
});

/* ── Segmented active state ── */
for (const seg of document.querySelectorAll(".seg")) {
  seg.addEventListener("change", () => {
    seg.querySelectorAll(".segopt").forEach(o => {
      o.classList.toggle("active", o.querySelector("input").checked);
    });
  });
}

/* ── Conditional sections ── */
const antiSite = document.getElementById("antiSite");
const antiDebug = document.getElementById("antiDebug");
const obfuscate = document.getElementById("obfuscate");
const obfWarn = document.getElementById("obfWarn");
const obfOptions = document.getElementById("obfOptions");
function syncObfOptions() {
  obfWarn.classList.toggle("hidden", obfuscate.checked);
  obfOptions.classList.toggle("hidden", !obfuscate.checked);
}
obfuscate.addEventListener("change", syncObfOptions);
syncObfOptions();

deliveryMode.addEventListener("change", () => {
  const val = deliveryMode.querySelector("input:checked").value;
  telegramFields.classList.toggle("hidden", val !== "bot");
});

document.getElementById("banner").addEventListener("input", (e) => {
  const lines = e.target.value.split("\n");
  if (lines.length > 4) e.target.value = lines.slice(0, 4).join("\n");
});

/* ── Telegram verify ── */
checkBtn.addEventListener("click", async () => {
  const token = document.getElementById("token").value.trim();
  const chatId = document.getElementById("chatId").value.trim();
  checkResult.textContent = "Checking...";
  checkResult.className = "check-result";
  try {
    const r = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, chat_id: chatId }),
    });
    const d = await r.json();
    checkResult.textContent = d.ok ? "Verified" : (d.error || "Failed");
    checkResult.className = "check-result " + (d.ok ? "ok" : "bad");
  } catch (e) {
    checkResult.textContent = "Network error";
    checkResult.className = "check-result bad";
  }
});

/* ── Console helpers ── */
function addLine(text, cls) {
  const div = document.createElement("div");
  if (cls) div.className = cls;
  div.textContent = text;
  logLines.appendChild(div);
  logLines.scrollTop = logLines.scrollHeight;
}

function addResultLink(url, name) {
  const a = document.createElement("a");
  a.className = "btn primary";
  a.href = url;
  a.textContent = `Download ${name}`;
  a.setAttribute("download", name);
  results.appendChild(a);
}

let timerId = null;
function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}
function startTimer() {
  const t0 = Date.now();
  stopTimer();
  const tick = () => setStatus(`building · ${fmtElapsed(Date.now() - t0)}`, "run");
  tick();
  timerId = setInterval(tick, 1000);
}
function stopTimer() {
  if (timerId) { clearInterval(timerId); timerId = null; }
}

function setStatus(text, cls) {
  logStatus.textContent = text;
  logStatus.className = "log-status" + (cls ? " " + cls : "");
}

/* ── Submit / build ── */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedFiles.length) {
    alert("Choose at least one .py file");
    return;
  }
  const versions = getVersions();
  const platforms = getPlatforms();
  if (!versions.length) { alert("Select at least one Python version"); return; }
  if (!platforms.length) { alert("Select at least one platform"); return; }

  const bundleMode = form.querySelector('input[name="bundle_mode"]:checked').value;
  const delivery = deliveryMode.querySelector("input:checked").value;

  const fd = new FormData();
  for (const f of selectedFiles) fd.append("files", f);
  fd.append("versions", versions.join(","));
  fd.append("platforms", platforms.join(","));
  fd.append("bundle_mode", bundleMode);

  fd.append("c_level_obf", "0");
  if (obfuscate.checked) {
    fd.append("obfuscate", "1");
    fd.append("strings", "None");
    fd.append("name_prefix", "l");
    fd.append("min_length", "3");
    fd.append("max_length", "7");
    fd.append("coding", ["chinese", "l", "o"][Math.floor(Math.random() * 3)]);
    if (antiSite.checked) fd.append("anti_site", "1");
    if (antiDebug.checked) fd.append("anti_debug", "1");
    fd.append("stein_best", "1");
  }
  fd.append("banner", document.getElementById("banner").value);

  let endpoint = "/api/download";
  if (delivery === "bot") {
    const token = document.getElementById("token").value.trim();
    const chatId = document.getElementById("chatId").value.trim();
    if (!token || !chatId) { alert("Enter bot token and chat ID"); return; }
    fd.append("token", token);
    fd.append("chat_id", chatId);
    endpoint = "/api/encrypt";
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Building…";
  logSection.classList.remove("hidden");
  startTimer();
  logLines.innerHTML = "";
  results.innerHTML = "";
  logSection.scrollIntoView({ behavior: "smooth", block: "nearest" });

  let failed = false;
  try {
    const resp = await fetch(endpoint, { method: "POST", body: fd });
    if (!resp.ok || !resp.body) {
      const d = await resp.json().catch(() => ({}));
      addLine(d.error || `Request failed (${resp.status})`, "err");
      failed = true;
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const events = buf.split("\n\n");
      buf = events.pop();
      for (const raw of events) {
        const line = raw.trim();
        if (!line || line.startsWith(":")) continue;
        if (!line.startsWith("data:")) continue;
        const payload = JSON.parse(line.slice(5).trim());
        if (payload.type === "progress") addLine(payload.message);
        else if (payload.type === "error") { addLine(payload.message, "err"); failed = true; }
        else if (payload.type === "file_ready") {
          addLine(`Ready: ${payload.name}`, "ok");
          addResultLink(payload.download_url, payload.name);
        } else if (payload.type === "done") {
          addLine(payload.message || "Done", "ok");
          if (payload.download_url) addResultLink(payload.download_url, payload.name);
        }
      }
    }
  } catch (err) {
    addLine("Connection lost: " + err.message, "err");
    failed = true;
  } finally {
    stopTimer();
    submitBtn.disabled = false;
    submitBtn.textContent = "Run build";
    setStatus(failed ? "failed" : "sealed", failed ? "fail" : "done");
  }
});

/* ── Init ── */
refreshAll();