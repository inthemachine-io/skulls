async function fetchData(id) {
    const sheetID = "1T4GWfvQLQOKGPZnIL-CpqHDDYs5u8UwI8ll-wc7Ep0w"; // Deine Google Sheet ID
    const range = "A:Z"; // Bereich mit allen Spalten
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&tq=SELECT * WHERE P='${id}'`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2)); // Google Sheets API Fix

        if (!json.table || !json.table.rows.length) {
            console.log("❌ Kein Eintrag gefunden!");
            return;
        }
        
        // Header-Zeile holen (enthält Spaltennamen)
        const headers = json.table.cols.map(col => col.label); // Holt Spaltennamen aus der API

        // Finde die Spaltenindexe für "Artist_Shortname" und andere
        
        const Index_Skull_Number = headers.indexOf("Skull_Number");
        const Index_Skull_Total = headers.indexOf("Skull_Total");
        const Index_Skull_Artist_Name = headers.indexOf("Skull_Artist_Name");
        const Index_Skull_Artist_Shortname = headers.indexOf("Skull_Artist_Shortname");
        const Index_Skull_Artist_Alive = headers.indexOf("Skull_Artist_Alive");
        const Index_Skull_Artist_Biography = headers.indexOf("Skull_Artist_Biography");
        const Index_Skull_Artist_Wikipedia = headers.indexOf("Skull_Artist_Wikipedia");
        const Index_Skull_Artist_Style = headers.indexOf("Skull_Artist_Style");
        const Index_Skull_Art_Movement = headers.indexOf("Skull_Art_Movement");
        const Index_Skull_Art_Movement_Period = headers.indexOf("Skull_Art_Movement_Period");
        const Index_Skull_Prompt_Style = headers.indexOf("Skull_Prompt_Style");
        const Index_Skull_Prompt = headers.indexOf("Skull_Prompt");
        const Index_Skull_Color_Style = headers.indexOf("Skull_Color_Style");
        const Index_Skull_Generation_DateTime = headers.indexOf("Skull_Generation_DateTime");
        const Index_Skull_EngineUsed = headers.indexOf("Skull_EngineUsed");
        const Index_Skull_ID = headers.indexOf("Skull_ID");
        const Index_Skull_Image = headers.indexOf("Skull_Image");

        // Die erste Datenzeile holen
        const row = json.table.rows[0].c;

        // Zugriff über Spaltennamen
        const Skull_Number = row[Index_Skull_Number].v? row[Index_Skull_Number].v : "N/A";
        const Skull_Total = row[Index_Skull_Total].v? row[Index_Skull_Total].v : "N/A";
        const Skull_Artist_Name = row[Index_Skull_Artist_Name].v? row[Index_Skull_Artist_Name].v : "N/A";
        const Skull_Artist_Shortname = row[Index_Skull_Artist_Shortname].v? row[Index_Skull_Artist_Shortname].v : "N/A";
        const Skull_Artist_Alive = row[Index_Skull_Artist_Alive].v? row[Index_Skull_Artist_Alive].v : "N/A";
        const Skull_Artist_Biography = row[Index_Skull_Artist_Biography].v? row[Index_Skull_Artist_Biography].v : "N/A";
        const Skull_Artist_Wikipedia = row[Index_Skull_Artist_Wikipedia].v? row[Index_Skull_Artist_Wikipedia].v : "N/A";
        const Skull_Artist_Style = row[Index_Skull_Artist_Style].v? row[Index_Skull_Artist_Style].v : "N/A";
        const Skull_Art_Movement = row[Index_Skull_Art_Movement].v? row[Index_Skull_Art_Movement].v : "N/A";
        const Skull_Art_Movement_Period = row[Index_Skull_Art_Movement_Period].v? row[Index_Skull_Art_Movement_Period].v : "N/A";
        const Skull_Prompt_Style = row[Index_Skull_Prompt_Style].v? row[Index_Skull_Prompt_Style].v : "N/A";
        const Skull_Prompt = row[Index_Skull_Prompt].v? row[Index_Skull_Prompt].v : "N/A";
        const Skull_Color_Style = row[Index_Skull_Color_Style].v? row[Index_Skull_Color_Style].v : "N/A";
        const Skull_Generation_DateTime = row[Index_Skull_Generation_DateTime].f? row[Index_Skull_Generation_DateTime].f : "N/A"; // Verwende das formatierte Datum
        const Skull_EngineUsed = row[Index_Skull_EngineUsed].v? row[Index_Skull_EngineUsed].v : "N/A";
        const Skull_ID = row[Index_Skull_ID].v? row[Index_Skull_ID].v : "N/A";
        const Skull_Image = row[Index_Skull_Image].v? row[Index_Skull_Image].v : "N/A";

        // Ausgabe in Carrd setzen
        document.getElementById("skull-id").innerText = "SITM • " + Skull_ID;
        document.querySelector("#skull-image img").src = Skull_Image;
        document.getElementById("skull-prompt").innerText = Skull_Prompt;
        document.getElementById("skull-number").innerText = Skull_Number + " / " + Skull_Total;
        document.getElementById("skull-creation-date").innerText = Skull_Generation_DateTime;
        document.getElementById("skull-color-style").innerText = Skull_Color_Style;
        document.getElementById("skull-prompt-style").innerText = Skull_Prompt_Style;
        document.getElementById("skull-engine").innerText = Skull_EngineUsed;
        document.getElementById("skull-artist").innerText = Skull_Artist_Name + " (" + Skull_Artist_Alive + ")";
        document.getElementById("skull-artist-style").innerText = Skull_Artist_Style;
        document.getElementById("skull-art-movement").innerText = "Part of " + Skull_Art_Movement + "\n(" + Skull_Art_Movement_Period + ")";
        document.getElementById("skull-artist-bio").innerText = Skull_Artist_Biography;
        document.querySelector("#skull-artist-link a").href = Skull_Artist_Wikipedia;
        document.querySelector("#skull-artist-link a").target = "_blank";

    } catch (error) {
        console.error("❌ Fehler beim Laden der Daten:", error);
    }
}

// ID aus URL holen
function getParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const id = getParam("id");
if (id) {
    fetchData(id);
} else {
    console.log("⚠️ Keine ID gefunden.");
}