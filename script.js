document.addEventListener("DOMContentLoaded", function () {
    console.log("Fetching CSV file...");

    const dateSelect = document.getElementById("date-select");
    const scheduleContainer = document.getElementById("schedule-container");
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    let shiftData = []; // Store CSV data

    // Fetch and process the CSV file
    fetch("shifts.csv")
        .then(response => response.text())
        .then(csvText => {
            console.log("CSV content loaded:");
            processCSV(csvText);
        })
        .catch(error => console.error("Failed to load CSV:", error));

    function processCSV(csvText) {
        const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });

        shiftData = parsedData.data.map(row => ({
            unit: row["Unit"],
            departureTime: row["Departure Time"],
            driverName: row["Driver Name"],
            run: row["Run"],
            offDriver: row["Driver (on days off)"],
            shift: row["Shift"],
            date: row["Date"]
        }));

        const uniqueDates = [...new Set(shiftData.map(entry => entry.date))].sort();
        console.log("Unique dates found:", uniqueDates);

        if (uniqueDates.length > 0) {
            uniqueDates.forEach(date => {
                let option = document.createElement("option");
                option.value = date;
                option.textContent = date;
                dateSelect.appendChild(option);
            });

            updateSchedule(uniqueDates[0]); // Load first date by default
        }

        dateSelect.addEventListener("change", () => {
            updateSchedule(dateSelect.value);
        });
    }

    function updateSchedule(selectedDate) {
        console.log("Updating schedule for:", selectedDate);
        scheduleContainer.innerHTML = ""; // Clear existing tables

        let dayShift = shiftData.filter(entry => entry.date === selectedDate && entry.shift === "Day");
        let nightShift = shiftData.filter(entry => entry.date === selectedDate && entry.shift === "Night");

        if (dayShift.length > 0) {
            scheduleContainer.appendChild(createTable("Day Shift", dayShift));
        }
        if (nightShift.length > 0) {
            scheduleContainer.appendChild(createTable("Night Shift", nightShift));
        }
    }

    function createTable(title, data) {
        let section = document.createElement("div");
        section.innerHTML = `<h3>${title}</h3>`;

        let table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Unit</th>
                    <th>Departure Time</th>
                    <th>Driver Name</th>
                    <th>Run</th>
                    <th>Driver (on days off)</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(entry => `
                    <tr>
                        <td>${entry.unit}</td>
                        <td>${entry.departureTime}</td>
                        <td>${entry.driverName}</td>
                        <td>${entry.run}</td>
                        <td>${entry.offDriver}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        section.appendChild(table);
        return section;
    }

    // Dark Mode Toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode"));
        });

        // Load Dark Mode Preference
        if (localStorage.getItem("dark-mode") === "true") {
            document.body.classList.add("dark-mode");
        }
    }
});
