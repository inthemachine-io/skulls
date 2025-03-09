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
        console.log("Headers:", headers); // Debug: Zeige die Header an

        // Relevante Spalten-Indexe
        const Index_Skull_Image = headers.indexOf("Skull_Image");
        const Index_Skull_Detail_URL = headers.indexOf("Skull_Detail_URL");
        const Index_Skull_Artist_Name = headers.indexOf("Skull_Artist_Name");

        // Debug: Zeige die Indexe an
        console.log("Index_Skull_Image:", Index_Skull_Image);
        console.log("Index_Skull_Detail_URL:", Index_Skull_Detail_URL);
        console.log("Index_Skull_Artist_Name:", Index_Skull_Artist_Name);

        // Debug: Zeige die Anzahl der zurückgegebenen Zeilen an
        console.log("Anzahl der zurückgegebenen Zeilen:", json.table.rows.length);

        // Debug: Zeige die Werte in der ersten Zeile an
        if (json.table.rows.length > 0) {
            console.log("Erste Zeile:", json.table.rows[0].c);
        }

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

        // Verteile die Bilder auf 10 Galleries mit je 10 Einträgen
        for (let i = 0; i < 10; i++) {
            const gallery = document.getElementById(`gallery${i + 1}`);
            if (!gallery) continue;

            const thumbnails = gallery.querySelectorAll("a.thumbnail");

            for (let j = 0; j < 10; j++) {
                const index = i * 10 + j;
                if (index >= skulls.length) break;

                if (thumbnails[j]) {
                    const img = thumbnails[j].querySelector("span.frame img");
                    if (img) {
                        img.src = skulls[index].image;
                        img.onerror = () => {
                            img.src = "https://inthemachine-io.github.io/skulls/146-991693-AS.png"; // Fallback-Bild
                        };
                    }
                    thumbnails[j].href = skulls[index].detailURL;

                    // Falls du den Künstlernamen auch in die Caption setzen willst:
                    const caption = thumbnails[j].parentElement.querySelector(".caption p");
                    if (caption) {
                        caption.textContent = skulls[index].artist;
                    }
                }
            }
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