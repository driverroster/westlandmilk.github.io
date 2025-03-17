document.addEventListener("DOMContentLoaded", function () {
    console.log("[Log] Fetching CSV file...");

    // Ensure the target container exists
    const tableContainer = document.getElementById("table-container");
    if (!tableContainer) {
        console.error("[Error] No element found with id 'table-container'. Ensure your HTML contains <div id='table-container'></div>");
        return;
    }

    // Fetch CSV file
    fetch("shifts.csv")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvContent => {
            console.log("[Log] CSV content loaded:", csvContent);

            // Parse CSV data
            const rows = csvContent.trim().split("\n").map(row => row.split(","));
            if (rows.length === 0) {
                console.error("[Error] CSV file appears empty.");
                return;
            }

            // Extract headers and log them
            const headers = rows.shift().map(header => header.trim());
            console.log("[Log] CSV Headers:", headers);

            // Extract unique dates for filtering
            const dateIndex = headers.indexOf("Date");
            if (dateIndex === -1) {
                console.error("[Error] CSV does not contain a 'Date' column.");
                return;
            }

            const uniqueDates = [...new Set(rows.map(row => row[dateIndex].trim()))];
            console.log("[Log] Unique dates found:", uniqueDates);

            // Create dropdown filter for dates
            let filterHTML = "<label for='dateFilter'>Select Date: </label>";
            filterHTML += "<select id='dateFilter'>";
            uniqueDates.forEach(date => {
                filterHTML += `<option value="${date}">${date}</option>`;
            });
            filterHTML += "</select>";

            // Create table and populate headers
            let tableHTML = "<table border='1'><thead><tr>";
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            tableHTML += "</tr></thead><tbody id='tableBody'></tbody></table>";

            // Insert the filter and table into the page
            tableContainer.innerHTML = filterHTML + tableHTML;

            // Function to populate the table based on selected date
            function populateTable(selectedDate) {
                const tableBody = document.getElementById("tableBody");
                tableBody.innerHTML = ""; // Clear existing rows

                rows.forEach(row => {
                    if (row[dateIndex].trim() === selectedDate) {
                        let rowHTML = "<tr>";
                        row.forEach(cell => {
                            rowHTML += `<td>${cell.trim()}</td>`;
                        });
                        rowHTML += "</tr>";
                        tableBody.innerHTML += rowHTML;
                    }
                });
            }

            // Default to the first date available
            populateTable(uniqueDates[0]);

            // Add event listener to dropdown
            document.getElementById("dateFilter").addEventListener("change", function () {
                populateTable(this.value);
            });
        })
        .catch(error => {
            console.error("[Error] Failed to load CSV:", error);
        });
});
