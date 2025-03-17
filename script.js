document.addEventListener("DOMContentLoaded", function () {
    const tableContainer = document.getElementById("table-container");
    const dateSelect = document.getElementById("date-select");
    const darkModeToggle = document.querySelector(".toggle-btn");

    // Auto Dark Mode Handling
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedDarkMode === "true" || (savedDarkMode === null && prefersDark)) {
        document.body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    });

    console.log("Fetching CSV file...");
    fetch("shifts.csv")
        .then(response => response.text())
        .then(csvText => {
            console.log("CSV content loaded:");
            console.log(csvText);

            const rows = csvText.split("\n").map(row => row.split(","));
            const headers = rows.shift().map(header => header.trim());
            console.log("CSV Headers:", headers);

            const data = rows.map(row => {
                return headers.reduce((obj, header, index) => {
                    obj[header] = row[index] ? row[index].trim() : "";
                    return obj;
                }, {});
            });

            // Find unique dates for filtering
            const uniqueDates = [...new Set(data.map(entry => entry.Date))].filter(date => date);
            console.log("Unique dates found:", uniqueDates);

            // Populate the date dropdown
            uniqueDates.forEach(date => {
                const option = document.createElement("option");
                option.value = date;
                option.textContent = date;
                dateSelect.appendChild(option);
            });

            // Function to render table based on selected date
            function renderTable(selectedDate) {
                tableContainer.innerHTML = ""; // Clear previous table
                const filteredData = data.filter(entry => entry.Date === selectedDate);

                if (filteredData.length === 0) {
                    tableContainer.innerHTML = "<p>No data available for this date.</p>";
                    return;
                }

                const table = document.createElement("table");
                table.classList.add("schedule-table");

                // Table Header
                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");
                headers.forEach(header => {
                    const th = document.createElement("th");
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Table Body
                const tbody = document.createElement("tbody");
                filteredData.forEach(entry => {
                    const row = document.createElement("tr");
                    headers.forEach(header => {
                        const td = document.createElement("td");
                        td.textContent = entry[header];
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                tableContainer.appendChild(table);
            }

            // Initial Render
            if (uniqueDates.length > 0) {
                renderTable(uniqueDates[0]);
            }

            // Change event for date selection
            dateSelect.addEventListener("change", function () {
                renderTable(this.value);
            });
        })
        .catch(error => console.error("Failed to load CSV:", error));
});
