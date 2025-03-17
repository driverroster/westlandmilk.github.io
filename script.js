async function loadCSV() {
    const response = await fetch('shifts.csv');
    const csvText = await response.text();
    const rows = csvText.split("\n").slice(1).map(line => line.split(","));

    // Get today's and tomorrow's dates
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Categorize data into shifts
    let todayDayShift = [];
    let todayNightShift = [];
    let tomorrowDayShift = [];
    let tomorrowNightShift = [];

    rows.forEach(row => {
        if (row.length < 7) return; // Skip invalid rows
        const [unit, time, driver, run, off, shift, date] = row.map(item => item.trim());

        if (date === today && shift === "Day") todayDayShift.push(row);
        if (date === today && shift === "Night") todayNightShift.push(row);
        if (date === tomorrowStr && shift === "Day") tomorrowDayShift.push(row);
        if (date === tomorrowStr && shift === "Night") tomorrowNightShift.push(row);
    });

    // Display tables
    document.getElementById("today-day-shift").innerHTML = createTable(todayDayShift);
    document.getElementById("today-night-shift").innerHTML = createTable(todayNightShift);
    document.getElementById("tomorrow-day-shift").innerHTML = createTable(tomorrowDayShift);
    document.getElementById("tomorrow-night-shift").innerHTML = createTable(tomorrowNightShift);
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

window.onload = loadCSV;
