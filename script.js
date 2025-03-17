document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const tableBody = document.getElementById("table-body");
    const dateSelect = document.getElementById("date-select");

    let scheduleData = [];

    // Load CSV data
    function loadCSV() {
        console.log("Fetching CSV file...");
        fetch("schedule.csv")
            .then(response => response.text())
            .then(data => {
                console.log("CSV content loaded:");
                console.log(data);

                scheduleData = parseCSV(data);
                populateDateDropdown();
                updateTable();
            })
            .catch(error => console.error("Error loading CSV:", error));
    }

    // Parse CSV into structured data
    function parseCSV(csv) {
        const rows = csv.split("\n").map(row => row.split(","));
        const headers = rows.shift(); // Remove header row

        return rows.map(row => {
            return {
                Unit: row[0],
                DepartureTime: row[1],
                DriverName: row[2],
                Run: row[3],
                DriverOff: row[4],
                Shift: row[5],
                Date: row[6]
            };
        });
    }

    // Populate date dropdown
    function populateDateDropdown() {
        const uniqueDates = [...new Set(scheduleData.map(item => item.Date))].sort();
        dateSelect.innerHTML = uniqueDates.map(date => `<option value="${date}">${date}</option>`).join("");
        dateSelect.addEventListener("change", updateTable);
    }

    // Update table with selected date
    function updateTable() {
        const selectedDate = dateSelect.value;
        const filteredData = scheduleData.filter(item => item.Date === selectedDate);

        tableBody.innerHTML = filteredData.map(item => `
            <tr>
                <td>${item.Unit}</td>
                <td>${item.DepartureTime}</td>
                <td>${item.DriverName}</td>
                <td>${item.Run}</td>
                <td>${item.DriverOff}</td>
                <td>${item.Shift}</td>
                <td>${item.Date}</td>
            </tr>
        `).join("");
    }

    // Dark mode handling
    function applyDarkModePreference() {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const savedDarkMode = localStorage.getItem("darkMode");

        if (savedDarkMode === "enabled" || (savedDarkMode === null && prefersDark)) {
            document.body.classList.add("dark-mode");
        }
    }

    applyDarkModePreference();

    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });

    // Initial load
    loadCSV();
});
