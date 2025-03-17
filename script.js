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
        // Split rows and handle quoted fields with commas
        const rows = csvText.trim().split("\n").map(row => {
            return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        });

        const headers = rows[0]; // Extract headers
        console.log("CSV Headers:", headers);

        // Map rows to shiftData array
        shiftData = rows.slice(1).map(row => {
            return {
                unit: row[0].trim(), // "Unit" in CSV
                departureTime: row[1].trim(), // "Departure Time" in CSV
                driverName: row[2].trim(), // "Driver Name" in CSV
                run: row[3].trim(), // "Run" in CSV
                offDriver: row[4].trim(), // "Driver (on days off)" in CSV
                shift: row[5].trim(), // "Shift" in CSV
                date: row[6].trim() // "Date" in CSV
            };
        });

        console.log("Processed Data:", shiftData);

        // Get unique dates and populate dropdown
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

        // Add event listener for date selection
        dateSelect.addEventListener("change", () => {
            updateSchedule(dateSelect.value);
        });
    }

    function updateSchedule(selectedDate) {
        console.log("Updating schedule for:", selectedDate);
        scheduleContainer.innerHTML = ""; // Clear existing tables

        // Filter data for the selected date
        let dayShift = shiftData.filter(entry => entry.date === selectedDate && entry.shift === "Day");
        let nightShift = shiftData.filter(entry => entry.date === selectedDate && entry.shift === "Night");

        // Create tables for Day and Night shifts
        if (dayShift.length > 0) {
            scheduleContainer.appendChild(createTable("Day Shift", dayShift));
        }
        if (nightShift.length > 0) {
            scheduleContainer.appendChild(createTable("Night Shift", nightShift));
        }
    }

    function createTable(title, data) {
        let table = document.createElement("table");

        // Create table header
        let thead = document.createElement("thead");
        thead.innerHTML = `<tr>
            <th>Unit</th>
            <th>Departure Time</th>
            <th>Driver Name</th>
            <th>Run</th>
            <th>Driver (on days off)</th>
        </tr>`;
        table.appendChild(thead);

        // Create table body
        let tbody = document.createElement("tbody");
        data.forEach(entry => {
            let row = document.createElement("tr");
            row.innerHTML = `<td>${entry.unit}</td>
                             <td>${entry.departureTime}</td>
                             <td>${entry.driverName}</td>
                             <td>${entry.run}</td>
                             <td>${entry.offDriver}</td>`;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Add title and table to a section
        let section = document.createElement("div");
        section.innerHTML = `<h3>${title}</h3>`;
        section.appendChild(table);
        return section;
    }

    // Dark Mode Toggle
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode"));
    });

    // Load Dark Mode Preference
    if (localStorage.getItem("dark-mode") === "true") {
        document.body.classList.add("dark-mode");
    }
});