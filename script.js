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
        const rows = csvText.trim().split("\n").map(row => row.split(","));
        const headers = rows[0]; // Extract headers

        console.log("CSV Headers:", headers);

        shiftData = rows.slice(1).map(row => {
            return {
                unit: row[0],
                departureTime: row[1],
                driverName: row[2],
                run: row[3],
                offDriver: row[4],
                shift: row[5],
                date: row[6]
            };
        });

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
        let table = document.createElement("table");

        let thead = document.createElement("thead");
        thead.innerHTML = `<tr>
            <th>Unit</th>
            <th>Departure Time</th>
            <th>Driver Name</th>
            <th>Run</th>
            <th>Driver (on days off)</th>
        </tr>`;
        table.appendChild(thead);

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
