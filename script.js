async function loadCSV() {
    try {
        console.log("Fetching CSV file...");
        const response = await fetch('shifts.csv');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log("CSV content loaded:", csvText);

        // Parse CSV correctly (ignoring commas inside quotes)
        const rows = csvText.trim().split("\n").slice(1).map(line => {
            const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
                .map(v => v.replace(/^"|"$/g, '')); // Remove surrounding quotes

            return values.length === 7 ? values : null; // Ensure correct columns
        }).filter(row => row !== null);

        // Debugging: Check the first few parsed rows
        console.log("Parsed CSV rows:", rows.slice(0, 5));

        // Extract unique dates from the **correct column (index 6)**
        let uniqueDates = [...new Set(rows.map(row => row[6]?.trim()))]
            .filter(date => date.match(/^\d{4}-\d{2}-\d{2}$/)) // Ensure valid date format
            .sort();

        console.log("Extracted Unique Dates:", uniqueDates);

        // Get the container where tables will be added
        const container = document.getElementById("schedule-container");
        container.innerHTML = ""; // Clear previous content

        // Generate tables for each date dynamically
        uniqueDates.forEach(date => {
            let dayShifts = rows.filter(row => row[6]?.trim() === date && row[5]?.trim() === "Day");
            let nightShifts = rows.filter(row => row[6]?.trim() === date && row[5]?.trim() === "Night");

            console.log(`Shifts for ${date}: Day - ${dayShifts.length}, Night - ${nightShifts.length}`);

            container.innerHTML += `
                <h2>Shifts for ${date}</h2>
                <h3>Day Shift</h3>
                ${createTable(dayShifts)}
                <h3>Night Shift</h3>
                ${createTable(nightShifts)}
            `;
        });

        console.log("Schedule updated successfully.");
    } catch (error) {
        console.error("Error loading CSV:", error);
    }
}

function createTable(data) {
    if (data.length === 0) return "<p>No shifts available.</p>";

    let table = "<table><tr><th>Unit</th><th>Departure Time</th><th>Driver Name</th><th>Run</th><th>Driver (on days off)</th></tr>";
    data.forEach(row => {
        table += `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td></tr>`;
    });
    table += "</table>";
    return table;
}

// Run the script after the page loads
window.onload = loadCSV;
