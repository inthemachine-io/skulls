import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const supabase = createClient(
  "https://rysvmrwyqxfoefnpcuwu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c3Ztcnd5cXhmb2VmbnBjdXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDUyNzUsImV4cCI6MjA1ODkyMTI3NX0.2_Ub9d2PlSqFVmOdO4jxxkK4nysyYNy-eDkB-tVYJI4"
);

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const rawCstyle = params.get("cstyle") || "Monochrome";
  const rawPstyle = params.get("pstyle") || "AI-Generated";

  // Absicherung gegen _ oder LEERSTELLEN
  const cstyle = rawCstyle.replace(/[_\s]+/g, "-");
  const pstyle = rawPstyle.replace(/[_\s]+/g, "-");

  return { cstyle, pstyle };
}

function normalize(str) {
  return str?.toLowerCase().replace(/[_\s]+/g, "-");
}

function updateStyleButtons(cstyle, pstyle) {
  const baseURL = window.location.pathname;

  const buttons = [
    { selector: ".n01", group: "pstyle", value: "AI-Generated" },
    { selector: ".n02", group: "pstyle", value: "Generic" },
    { selector: ".n03", group: "cstyle", value: "Monochrome" },
    { selector: ".n04", group: "cstyle", value: "Color" },
  ];

  buttons.forEach(({ selector, group, value }) => {
    const el = document.querySelector(`#buttons14 ${selector}`);
    if (!el) return;

    const currentValue = group === "pstyle" ? pstyle : cstyle;
    const isActive = normalize(currentValue) === normalize(value);

    // Setze neue URL mit aktualisiertem Parameter
    const params = new URLSearchParams(window.location.search);
    params.set(group, value);
    el.href = `${baseURL}?${params.toString()}`;

    // Button deaktivieren oder aktivieren
    el.style.opacity = isActive ? "0.5" : "1";
    el.style.pointerEvents = isActive ? "none" : "auto";
    el.style.cursor = isActive ? "default" : "pointer";
  });
}

async function fetchSkulls() {
  const { cstyle, pstyle } = getQueryParams();
  updateStyleButtons(cstyle, pstyle);

  try {
    console.log("📥 Lade Galerie mit:", { cstyle, pstyle });

    // Prompt-ID holen
    const { data: promptData, error: promptError } = await supabase
      .from("prompt")
      .select("id")
      .eq("description", pstyle)
      .single();
    if (promptError) throw promptError;

    // Color-ID holen
    const { data: colorData, error: colorError } = await supabase
      .from("color")
      .select("id")
      .eq("description", cstyle)
      .single();
    if (colorError) throw colorError;

    // Series-ID holen
    const { data: seriesData, error: seriesError } = await supabase
      .from("series")
      .select("id")
      .order("name", { ascending: true })
      .limit(1);
    if (seriesError) throw seriesError;
    const firstSeriesId = seriesData[0].id;

    // Items laden
    const { data: items, error } = await supabase
      .from("item")
      .select(
        `
item_img_url,
page_url,
artist (
name,
art_movement (
name,
period
)
),
prompt_id,
color_id
`
      )
      .eq("series_id", firstSeriesId)
      .eq("prompt_id", promptData.id)
      .eq("color_id", colorData.id)
      .limit(100);
    if (error) throw error;

    console.log("🧠 Items geladen:", items.length);
    console.table(
      items.map((i) => ({
        prompt_id: i.prompt_id,
        color_id: i.color_id,
        artist: i.artist?.name,
      }))
    );

    // Sortierung nach Epoche
    items.sort((a, b) => {
      const periodA = a.artist?.art_movement?.period || "";
      const periodB = b.artist?.art_movement?.period || "";
      return periodA.localeCompare(periodB, "en", { numeric: true });
    });

    // Lazy Load
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.onerror = () => {
              img.src =
                "https://inthemachine-io.github.io/skulls/146-991693-AS.png";
            };
            obs.unobserve(img);
          }
        });
      },
      {
        rootMargin: "0px 0px 50px 0px",
        threshold: 0.01,
      }
    );

    // Bildverteilung in Galerien
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

    console.log("✅ Galerie gerendert:", cstyle, "+", pstyle);
  } catch (err) {
    console.error("❌ Fehler beim Laden der Galerie:", err);
  }
}

document.addEventListener("DOMContentLoaded", fetchSkulls);
