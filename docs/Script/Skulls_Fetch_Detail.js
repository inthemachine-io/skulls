import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://rysvmrwyqxfoefnpcuwu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c3Ztcnd5cXhmb2VmbnBjdXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDUyNzUsImV4cCI6MjA1ODkyMTI3NX0.2_Ub9d2PlSqFVmOdO4jxxkK4nysyYNy-eDkB-tVYJI4";
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔁 Safe fallback helper
const safe = (val, fallback = "N/A") => (val ? val : fallback);

async function fetchData(id) {
  console.log("🧠 Lade Daten für ID:", id);

  const { data, error } = await supabase
    .from("item")
    .select(
      `
*,
artist:artist_id (
name,
shortname,
lifetime,
biography,
wikipedia_url,
style_desc,
movement:movement_id (
name,
period
)
),
series:series_id (
id,
total_number,
engine:engine_id (
description
)
),
prompt:prompt_id (
description
),
color:color_id (
description
)
`
    )
    .eq("official_id", id)
    .single();

  if (error) {
    console.error("❌ Fehler beim Laden der Supabase-Daten:", error);
    return;
  }

  // 🧠 Ausgabe in Carrd setzen
  document.getElementById("skull-id").innerText =
    "SITM • " + safe(data.official_id);
  document.querySelector("#skull-image img").src = safe(data.item_img_url);
  document.getElementById("skull-prompt").innerText = safe(data.prompt_used);
  document.getElementById("skull-number").innerText =
    safe(data.number) + " / " + safe(data.series?.total_number);
  document.getElementById("skull-creation-date").innerText = new Date(
    data.creation_timestamp
  ).toLocaleDateString();
  document.getElementById("skull-color-style").innerText = safe(
    data.color?.description
  );
  document.getElementById("skull-prompt-style").innerText = safe(
    data.prompt?.description
  );
  document.getElementById("skull-engine").innerText = safe(
    data.series?.engine?.description
  );
  document.getElementById("skull-artist").innerText = safe(data.artist?.name);
  document.getElementById("skull-artist-alive").innerText = safe(
    data.artist?.lifetime
  );
  document.getElementById("skull-art-movement").innerText =
    safe(data.artist?.movement?.name) +
    " (" +
    safe(data.artist?.movement?.period) +
    ")";
  document.getElementById("skull-artist-bio").innerText = safe(
    data.artist?.biography
  );
  document.querySelector("#skull-artist-link a").href = safe(
    data.artist?.wikipedia_url
  );
  document.querySelector("#skull-artist-link a").target = "_blank";

  // 🔁 Zweite Abfrage: Styles desselben Künstlers & derselben Serie
  fetchOtherStyles(data);
}

async function fetchOtherStyles(data) {
  const currentId = data.official_id;
  const artistId = data.artist_id;
  const seriesId = data.series_id;

  const { data: siblings, error } = await supabase
    .from("item")
    .select(
      "official_id, prompt:prompt_id(description), color:color_id(description)"
    )
    .eq("artist_id", artistId)
    .eq("series_id", seriesId);

  if (error) {
    console.error("❌ Fehler beim Laden verwandter Bilder:", error);
    return;
  }

  const variants = {
    "AI-Generated|Monochrome": null,
    "AI-Generated|Color": null,
    "Generic|Monochrome": null,
    "Generic|Color": null,
  };

  siblings.forEach((item) => {
    const key = `${item.prompt.description}|${item.color.description}`;
    if (variants[key] === null) {
      variants[key] = item.official_id;
    }
  });

  // Mapping der Style-Kombinationen zu Button-Klassen
  const styleMap = {
    "AI-Generated|Monochrome": ".n01",
    "AI-Generated|Color": ".n02",
    "Generic|Monochrome": ".n03",
    "Generic|Color": ".n04",
  };

  Object.entries(styleMap).forEach(([key, selector]) => {
    const btn = document.querySelector(`#styleselector ${selector}`);
    const targetId = variants[key];
    if (targetId) {
      btn.href = `https://detail.skulls.inthemachine.io?id=${targetId}`;
      if (targetId === currentId) {
        // Nur visuell deaktivieren
        btn.style.opacity = "0.5";
        btn.style.pointerEvents = "none";
        btn.style.cursor = "default";
      }
    } else {
      btn.href = "#";
      btn.style.opacity = "0.2";
      btn.style.pointerEvents = "none";
      btn.style.cursor = "default";
    }
  });
}

// 🔁 Hilfsfunktion: ID aus URL holen
function getParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 🚀 Start
const id = getParam("id");
if (id) {
  fetchData(id);
} else {
  console.log("⚠️ Keine ID gefunden.");
}
