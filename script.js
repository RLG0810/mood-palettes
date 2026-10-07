
const MOOD_PALETTES = {
  feliz: [
    ["#F9D976", "#F7B267", "#F2876D", "#F2A0A8", "#FFF3C4"],
    ["#FFE29A", "#FFB284", "#F28C8C", "#F7C49A", "#FFF8EE"],
    ["#F9D976", "#F5A65B", "#EE7B6E", "#F2B5C0", "#FCE8B2"],
  ],
  melancolico: [
    ["#8F7FB8", "#A99BC9", "#CDB3E0", "#7A86A8", "#E5D9F0"],
    ["#6E7CA0", "#8F7FB8", "#B8A6D4", "#D9C6E8", "#5B5E7E"],
    ["#9A8BB8", "#C4B0D8", "#7E8CAE", "#E0D4EE", "#8A7BA8"],
  ],
  energico: [
    ["#F2876D", "#F5A65B", "#E85D4A", "#F9D976", "#D9455F"],
    ["#FF8C42", "#F25C54", "#F9C74F", "#EE6C4D", "#FFB284"],
    ["#E85D4A", "#F2876D", "#FFC15E", "#F3722C", "#F9D976"],
  ],
  relajado: [
    ["#A8C4D9", "#C9DCE8", "#DCEAF3", "#B8D0C4", "#F3EEE4"],
    ["#9FBDD4", "#C4DAE8", "#E4F0F6", "#CDB3E0", "#FDF4E7"],
    ["#B0CBDD", "#D6E7F0", "#A8C9B8", "#EAF3F7", "#DCCFE8"],
  ],
};

const moodsEl = document.getElementById("moods");
const generateBtn = document.getElementById("generate");
const regenBtn = document.getElementById("regen");
const loadingEl = document.getElementById("loading");
const resultEl = document.getElementById("result");
const paletteEl = document.getElementById("palette");
const copiedEl = document.getElementById("copied");

let currentMood = "feliz";
let lastIndex = -1;
let generating = false;

/* ===== Selección de mood ===== */
moodsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".mood");
  if (!btn) return;
  document.querySelectorAll(".mood").forEach((m) => {
    m.classList.remove("selected");
    m.setAttribute("aria-pressed", "false");
  });
  btn.classList.add("selected");
  btn.setAttribute("aria-pressed", "true");
  currentMood = btn.dataset.mood;
});


function pickPalette(mood) {
  const options = MOOD_PALETTES[mood];
  let i;
  do { i = Math.floor(Math.random() * options.length); } while (options.length > 1 && i === lastIndex);
  lastIndex = i;
  // Baraja una copia para variar el orden
  return [...options[i]].sort(() => Math.random() - 0.5);
}

function renderPalette(colors) {
  paletteEl.innerHTML = "";
  colors.forEach((hex) => {
    const sw = document.createElement("button");
    sw.className = "swatch";
    sw.style.background = hex;
    sw.setAttribute("aria-label", "Copiar " + hex);
    sw.innerHTML = `<span>${hex}</span>`;
    sw.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(hex); } catch (_) {}
      copiedEl.textContent = hex + " copiado ✦";
      copiedEl.classList.add("show");
      setTimeout(() => copiedEl.classList.remove("show"), 1200);
    });
    paletteEl.appendChild(sw);
  });
}

function generate() {
  if (generating) return;
  generating = true;
  generateBtn.disabled = true;
  resultEl.classList.remove("visible");
  loadingEl.classList.add("visible");

  setTimeout(() => {
    loadingEl.classList.remove("visible");
    renderPalette(pickPalette(currentMood));
    resultEl.classList.add("visible");
    generateBtn.disabled = false;
    generating = false;
  }, 900 + Math.random() * 500);
}

generateBtn.addEventListener("click", generate);
regenBtn.addEventListener("click", generate);

/* ===== Modal de código fuente ===== */
const sourceBtn = document.getElementById("sourceBtn");
const sourceModal = document.getElementById("sourceModal");
const modalClose = document.getElementById("modalClose");
const modalCloseX = document.getElementById("modalCloseX");
const codeArea = document.getElementById("codeArea");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const downloadBtn = document.getElementById("downloadBtn");

async function openModal() {
  try {
    const res = await fetch(location.href, { cache: "no-store" });
    const text = await res.text();
    codeArea.value = text;
  } catch (err) {
    codeArea.value = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  }
  sourceModal.classList.add("visible");
  sourceModal.setAttribute("aria-hidden", "false");
  codeArea.focus();
}

function closeModal() {
  sourceModal.classList.remove("visible");
  sourceModal.setAttribute("aria-hidden", "true");
  sourceBtn.focus();
}

sourceBtn.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
modalCloseX.addEventListener("click", closeModal);
sourceModal.addEventListener("click", (e) => {
  if (e.target === sourceModal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sourceModal.classList.contains("visible")) closeModal();
});

copyCodeBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeArea.value);
    copiedEl.textContent = "¡Código copiado!";
    copiedEl.classList.add("show");
    setTimeout(() => copiedEl.classList.remove("show"), 1500);
  } catch (_) {
    copiedEl.textContent = "Error al copiar";
    copiedEl.classList.add("show");
    setTimeout(() => copiedEl.classList.remove("show"), 1500);
  }
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([codeArea.value], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "index.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});