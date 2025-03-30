<script type="module">
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const supabase = createClient(
"https://rysvmrwyqxfoefnpcuwu.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c3Ztcnd5cXhmb2VmbnBjdXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDUyNzUsImV4cCI6MjA1ODkyMTI3NX0.2_Ub9d2PlSqFVmOdO4jxxkK4nysyYNy-eDkB-tVYJI4"
);

function getQueryParams() { 
    const params = new URLSearchParams(window.location.search);
    const cstyle = params.get("cstyle") || "Monochrome";
const pstyle = params.get("pstyle") || "AI-Generated";
return { cstyle, pstyle };
}

function updateStyleButtons(cstyle, pstyle) {
const baseURL = window.location.pathname;

const combinations = [
{ c: "Monochrome", p: "AI-Generated", btn: ".n01" },
{ c: "Monochrome", p: "Generic", btn: ".n02" },
{ c: "Color", p: "AI-Generated", btn: ".n03" },
{ c: "Color", p: "Generic", btn: ".n04" },
];

combinations.forEach(({ c, p, btn }) => {
const el = document.querySelector(`#buttons14 ${btn}`);
if (!el) return;
const isActive = c === cstyle && p === pstyle;
el.href = `${baseURL}?cstyle=${c}&pstyle=${p}`;
el.style.opacity = isActive ? "0.5" : "1";
el.style.pointerEvents = isActive ? "none" : "auto";
el.style.cursor = isActive ? "default" : "pointer";
});
}

async function fetchSkulls() {
const { cstyle, pstyle } = getQueryParams();
updateStyleButtons(cstyle, pstyle);

try {
const { data: seriesData, error: seriesError } = await supabase
.from("series")
.select("id")
.order("name", { ascending: true })
.limit(1);
if (seriesError) throw seriesError;
const firstSeriesId = seriesData[0].id;

const { data: items, error } = await supabase
.from("item")
.select(`
item_img_url,
page_url,
artist(
name,
art_movement(name, period)
),
prompt(description),
color(description)
`)
.eq("series_id", firstSeriesId)
.eq("prompt.description", pstyle)
.eq("color.description", cstyle)
.limit(100);

if (error) throw error;

// Nach Epoche sortieren
items.sort((a, b) => {
const periodA = a.artist?.art_movement?.period || "";
const periodB = b.artist?.art_movement?.period || "";
return periodA.localeCompare(periodB, "en", { numeric: true });
});

// Lazy Load
const observer = new IntersectionObserver((entries, obs) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const img = entry.target;
img.src = img.dataset.src;
img.onerror = () => {
img.src = "https://inthemachine-io.github.io/skulls/146-991693-AS.png";
};
obs.unobserve(img);
}
});
}, {
rootMargin: "0px 0px 50px 0px",
threshold: 0.01
});

// Bilder in 10 Galerien
for (let i = 0; i < items.length; i++) {
const item = items[i];
const galleryIndex = Math.floor(i / 10);
const gallery = document.getElementById(`gallery${galleryIndex + 1}`);
if (!gallery) continue;

const thumbnailIndex = i % 10;
const thumbnail = gallery.querySelectorAll("a.thumbnail")[thumbnailIndex];
if (!thumbnail) continue;

const img = thumbnail.querySelector("span.frame img");
if (img) {
img.dataset.src = item.item_img_url;
observer.observe(img);
}

thumbnail.href = item.page_url || "#";

const caption = thumbnail.parentElement.querySelector(".caption p");
if (caption) {
caption.textContent = item.artist?.name || "Unknown Artist";
}
}

console.log("✅ Galerie geladen:", cstyle, "+", pstyle);
} catch (err) {
console.error("❌ Fehler beim Laden der Galerie:", err);
}
}

document.addEventListener("DOMContentLoaded", fetchSkulls);
</script>