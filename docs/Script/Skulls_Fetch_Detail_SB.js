async function fetchData(id) {
    const supabaseUrl = "https://rysvmrwyqxfoefnpcuwu.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c3Ztcnd5cXhmb2VmbnBjdXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDUyNzUsImV4cCI6MjA1ODkyMTI3NX0.2_Ub9d2PlSqFVmOdO4jxxkK4nysyYNy-eDkB-tVYJI4";

    const url = `${supabaseUrl}/rest/v1/itm.item?select=*,artists:artist(*,movement:art_movement(*)),prompt:prompt(*),color:color(*),series:series(*),engine:engine(*)&official_id=eq.${id}`;

    try {
        const response = await fetch(url, {
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`
            }
        });
        const data = await response.json();

        if (!data.length) {
            console.log("❌ Kein Eintrag gefunden!");
            return;
        }

        const skull = data[0];
        const artist = skull.artists;
        const movement = artist?.movement || {};
        const prompt = skull.prompt;
        const color = skull.color;
        const engine = skull.engine;

        // Ausgabe in Carrd setzen (wie zuvor)
        document.getElementById("skull-id").innerText = "SITM • " + skull.official_id;
        document.querySelector("#skull-image img").src = skull.item_img_url;
        document.getElementById("skull-prompt").innerText = skull.prompt;
        document.getElementById("skull-number").innerText = skull.number + " / " + skull.series.total_number;
        document.getElementById("skull-creation-date").innerText = new Date(skull.creation_timestamp).toLocaleDateString();
        document.getElementById("skull-color-style").innerText = color?.description ?? "N/A";
        document.getElementById("skull-prompt-style").innerText = prompt?.description ?? "N/A";
        document.getElementById("skull-engine").innerText = engine?.description ?? "N/A";
        document.getElementById("skull-artist").innerText = artist?.name ?? "N/A";
        document.getElementById("skull-artist-alive").innerText = artist?.lifetime ?? "N/A";
        document.getElementById("skull-art-movement").innerText = `${movement.name ?? "N/A"} (${movement.period ?? "?"})`;
        document.getElementById("skull-artist-bio").innerText = artist?.biography ?? "N/A";
        document.querySelector("#skull-artist-link a").href = artist?.wikipedia_url ?? "#";
        document.querySelector("#skull-artist-link a").target = "_blank";

        // ID-Selector deaktivieren oder ersetzen – wenn du keine Varianten hast
        document.getElementById("styleselector").style.display = "none";

    } catch (error) {
        console.error("❌ Fehler beim Laden der Daten:", error);
    }
}
