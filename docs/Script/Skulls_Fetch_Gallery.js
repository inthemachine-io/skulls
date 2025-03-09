async function fetchData() {
    const sheetID = "1T4GWfvQLQOKGPZnIL-CpqHDDYs5u8UwI8ll-wc7Ep0w"; // Deine Google Sheet ID
    const query = encodeURIComponent("SELECT * WHERE P='AI Generated' AND Q='Monochrome'");
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&tq=${query}`;

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

        // Daten extrahieren (max. 100 Einträge)
        const skulls = json.table.rows.slice(0, 100).map(row => ({
            image: row[Index_Skull_Image]?.v || "",
            detailURL: row[Index_Skull_Detail_URL]?.v || "#"
        }));

        if (skulls.length === 0) {
            console.log("⚠️ Keine passenden Daten verfügbar.");
            return;
        }

        // Verteile die Bilder auf 10 Galleries mit je 10 Einträgen
        for (let i = 0; i < 10; i++) {
            const gallery = document.getElementById(`gallery0${i + 1}`);
            if (!gallery) continue;

            const thumbnails = gallery.querySelectorAll("a.thumbnail");

            for (let j = 0; j < 10; j++) {
                const index = i * 10 + j;
                if (index >= skulls.length) break;

                if (thumbnails[j]) {
                    const img = thumbnails[j].querySelector("span.frame img");
                    if (img) {
                        img.src = skulls[index].image;
                    }
                    thumbnails[j].href = skulls[index].detailURL;
                }
            }
        }

        console.log("✅ Daten erfolgreich geladen und in die Galerien eingefügt!");
    } catch (error) {
        console.error("❌ Fehler beim Laden der Daten:", error);
    }
}

// Starte den Fetch-Prozess beim Laden der Seite
fetchData();
