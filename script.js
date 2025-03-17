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
            console.log("[Log] CSV content loaded.");

            // Parse CSV content into rows
            const rows = csvContent.trim().split("\n").map(row => row.split(",").map(cell => cell.trim()));
            if (rows.length < 2) {
                console.error("[Error] CSV file is empty or improperly formatted.");
                return;
            }

            // Extract headers & data rows
            const headers = rows.shift();
            console.log("[Log] CSV Headers:", headers);

            // Find the "Date" column index
            const dateIndex = headers.findIndex(header => header.toLowerCase() === "date");
            if (dateIndex === -1) {
                console.error("[Error] 'Date' column not found in CSV.");
                return;
            }

            // Extract unique dates & sort them
            const uniqueDates = [...new Set(rows.map(row => row[dateIndex]))].filter(Boolean).sort();
            console.log("[Log] Unique dates found:", uniqueDates);

            if (uniqueDates.length === 0) {
                console.error("[Error] No valid dates found in the CSV.");
                return;
            }

            // Create date filter dropdown
            let filterHTML = "<label for='dateFilter'>Select Date: </label>";
            filterHTML += "<select id='dateFilter'>";
            uniqueDates.forEach(date => {
                filterHTML += `<option value="${date}">${date}</option>`;
            });
            filterHTML += "</select>";

            // Create the table structure
            let tableHTML = "<table border='1'><thead><tr>";
            headers.forEach(header => tableHTML += `<th>${header}</th>`);
            tableHTML += "</tr></thead><tbody id='tableBody'></tbody></table>";

            // Inject elements into the page
            tableContainer.innerHTML = filterHTML + tableHTML;

            // Function to populate the table based on selected date
            function populateTable(selectedDate) {
                const tableBody = document.getElementById("tableBody");
                tableBody.innerHTML = ""; // Clear previous content

                rows.forEach(row => {
                    if (row[dateIndex] === selectedDate) {
                        let rowHTML = "<tr>";
                        row.forEach(cell => {
                            rowHTML += `<td>${cell}</td>`;
                        });
                        rowHTML += "</tr>";
                        tableBody.innerHTML += rowHTML;
                    }
                });
            }

            // Default to the first date
            populateTable(uniqueDates[0]);

            // Handle dropdown change
            document.getElementById("dateFilter").addEventListener("change", function () {
                populateTable(this.value);
            });
        })
        .catch(error => {
            console.error("[Error] Failed to load CSV:", error);
        });
});
