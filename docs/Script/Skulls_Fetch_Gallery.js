async function fetchData(cstyle, pstyle) {
    pstyle = pstyle.replace(/_/g, ' '); // Ersetze Unterstriche durch Leerzeichen
    
    const sheetID = "1T4GWfvQLQOKGPZnIL-CpqHDDYs5u8UwI8ll-wc7Ep0w"; // Deine Google Sheet ID
    const range = "A:Z"; // Bereich mit allen Spalten
    const statement = `SELECT * WHERE K='${pstyle}' AND M='${cstyle}'`;
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&tq=${statement}&range=${range}`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2)); // Google Sheets API Fix
    
        if (!json.table || !json.table.rows.length) {
            console.log("❌ Keine passenden Einträge gefunden!");
            return;
        }
    
        // Header-Zeile holen (enthält Spaltennamen)
        const headers = json.table.cols.map(col => col.label);
    
        // Relevante Spalten-Indexe
        const Index_Skull_Image = headers.indexOf("Skull_Image");
        const Index_Skull_Detail_URL = headers.indexOf("Skull_Detail_URL");
        const Index_Skull_Artist_Name = headers.indexOf("Skull_Artist_Name");
    
        const skulls = json.table.rows.map(row => {
            const cells = row.c;
            return {
                image: cells[Index_Skull_Image]?.v ? String(cells[Index_Skull_Image].v) : "https://inthemachine-io.github.io/skulls/146-991693-AS.png",
                detailURL: cells[Index_Skull_Detail_URL]?.v ? String(cells[Index_Skull_Detail_URL].v) : "#",
                artist: cells[Index_Skull_Artist_Name]?.v ? String(cells[Index_Skull_Artist_Name].v) : "Unknown Artist",
            };
        });
    
        if (skulls.length === 0) {
            console.log("⚠️ Keine passenden Daten verfügbar.");
            return;
        }
    
        // IntersectionObserver für Lazy Loading
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onerror = () => {
                        img.src = "https://inthemachine-io.github.io/skulls/146-991693-AS.png"; // Fallback-Bild
                    };
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: "0px 0px 50px 0px",
            threshold: 0.01
        });
    
        // Verteile die Bilder auf 10 Galleries mit je 10 Einträgen
        for (let i = 0; i < skulls.length; i++) {
            const galleryIndex = Math.floor(i / 10);
            const gallery = document.getElementById(`gallery${galleryIndex + 1}`);
            if (!gallery) continue;
    
            const thumbnailIndex = i % 10;
            const thumbnail = gallery.querySelectorAll("a.thumbnail")[thumbnailIndex];
    
            if (thumbnail) {
                const img = thumbnail.querySelector("span.frame img");
                if (img) {
                    img.dataset.src = skulls[i].image;
                    observer.observe(img);
                }
                thumbnail.href = skulls[i].detailURL;
    
                // Falls du den Künstlernamen auch in die Caption setzen willst:
                const caption = thumbnail.parentElement.querySelector(".caption p");
                if (caption) {
                    caption.textContent = skulls[i].artist;
                }
            }
        }
    
        document.getElementById("prompt-color-style").innerHTML = pstyle + " - " + cstyle;
    
        if (pstyle == "AI Generated") {
            let button = document.querySelector("#buttons14 .n01");
            button.style.opacity = "0.5";
            button.style.pointerEvents = "none";
            button.style.cursor = "default"; // Verhindert den Hand-Cursor
        }
    
        if (pstyle == "Generic") {
            let button = document.querySelector("#buttons14 .n02");
            button.style.opacity = "0.5";
            button.style.pointerEvents = "none";
            button.style.cursor = "default"; // Verhindert den Hand-Cursor
        }
    
        if (cstyle == "Monochrome") {
            let button = document.querySelector("#buttons14 .n03");
            button.style.opacity = "0.5";
            button.style.pointerEvents = "none";
            button.style.cursor = "default"; // Verhindert den Hand-Cursor
        }
    
        if (cstyle == "Color") {
            let button = document.querySelector("#buttons14 .n04");
            button.style.opacity = "0.5";
            button.style.pointerEvents = "none";
            button.style.cursor = "default"; // Verhindert den Hand-Cursor
        }
    
        console.log("✅ Daten erfolgreich geladen und in die Galerien eingefügt!");
    } catch (error) {
        console.error("❌ Fehler beim Laden der Daten:", error);
    }
}
    
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const cstyle = params.get('cstyle');
    const pstyle = params.get('pstyle');
    return { cstyle, pstyle };
}
    
// Stelle sicher, dass fetchData erst nach dem vollständigen Laden des DOMs ausgeführt wird
document.addEventListener("DOMContentLoaded", () => {
    const { cstyle, pstyle } = getQueryParams();
    fetchData(cstyle, pstyle);
});
console.log("🚀 Galerie-Script gestartet!");