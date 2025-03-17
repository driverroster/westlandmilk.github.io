document.addEventListener("DOMContentLoaded", function () {
    const dateSelect = document.getElementById("date-select");
    const scheduleContainer = document.getElementById("schedule-container");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    
    let shiftData = [];
    
    // Fetch CSV
    fetch("shifts.csv")
        .then(response => response.text())
        .then(csvText => processCSV(csvText))
        .catch(error => console.error("Failed to load CSV:", error));
    
    function processCSV(csvText) {
        // Handle quoted fields and split properly
        const rows = csvText.trim().split("\n").map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        const headers = rows[0];
        
        shiftData = rows.slice(1).map(row => ({
            unit: row[0].trim(),
            departureTime: row[1].trim(),
            driverName: row[2].trim(),
            run: row[3].trim(),
            offDriver: row[4].trim(),
            shift: row[5].trim(),
            date: row[6].trim()
        }));
        
        // Populate date dropdown
        const uniqueDates = [...new Set(shiftData.map(entry => entry.date))].sort();
        uniqueDates.forEach(date => {
            let option = document.createElement("option");
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
        });
        
        if (uniqueDates.length > 0) {
            updateSchedule(uniqueDates[0]); // Default to first date
        }
    }
    
    function updateSchedule(selectedDate) {
        scheduleContainer.innerHTML = "";

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
    
    dateSelect.addEventListener("change", () => {
        updateSchedule(dateSelect.value);
    });

    // Dark Mode Handling
    function applyDarkMode() {
        document.body.classList.toggle("dark-mode", localStorage.getItem("dark-mode") === "true");
    }
    
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode"));
    });

    applyDarkMode();
});
