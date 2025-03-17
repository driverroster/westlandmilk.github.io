document.addEventListener("DOMContentLoaded", function () {
    console.log("[Log] Fetching CSV file...");

    const tableContainer = document.getElementById("table-container");
    if (!tableContainer) {
        console.error("[Error] No element found with id 'table-container'. Ensure your HTML contains <div id='table-container'></div>");
        return;
    }

    fetch("shifts.csv")
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.text();
        })
        .then(csvContent => {
            console.log("[Log] CSV content loaded.");

            // Parse CSV: Handle quoted fields correctly
            const rows = csvContent.trim().split("\n").map(row => {
                return row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(cell => cell.replace(/^"|"$/g, '').trim());
            });

            if (rows.length < 2) {
                console.error("[Error] CSV file is empty or improperly formatted.");
                return;
            }

            const headers = rows.shift();
            console.log("[Log] CSV Headers:", headers);

            const dateIndex = headers.indexOf("Date");
            const shiftIndex = headers.indexOf("Shift");
            if (dateIndex === -1 || shiftIndex === -1) {
                console.error("[Error] Missing 'Date' or 'Shift' column.");
                return;
            }

            // Extract and sort unique dates
            const uniqueDates = [...new Set(rows.map(row => row[dateIndex]))].filter(Boolean).sort();
            console.log("[Log] Unique dates found:", uniqueDates);

            if (uniqueDates.length === 0) {
                console.error("[Error] No valid dates found in the CSV.");
                return;
            }

            // Default to today's schedule
            const today = new Date().toISOString().split("T")[0];
            const defaultDate = uniqueDates.includes(today) ? today : uniqueDates[0];

            // Create date filter dropdown
            let filterHTML = "<label for='dateFilter'>Select Date: </label>";
            filterHTML += "<select id='dateFilter'>";
            uniqueDates.forEach(date => {
                filterHTML += `<option value="${date}" ${date === defaultDate ? "selected" : ""}>${date}</option>`;
            });
            filterHTML += "</select><br><br>";

            tableContainer.innerHTML = filterHTML + "<div id='tables'></div>";

            function renderTables(selectedDate) {
                const tablesDiv = document.getElementById("tables");
                tablesDiv.innerHTML = ""; // Clear previous tables

                const dayShiftRows = rows.filter(row => row[dateIndex] === selectedDate && row[shiftIndex] === "Day");
                const nightShiftRows = rows.filter(row => row[dateIndex] === selectedDate && row[shiftIndex] === "Night");

                if (dayShiftRows.length > 0) {
                    tablesDiv.innerHTML += createTableHTML(dayShiftRows, "Day Shift");
                }
                if (nightShiftRows.length > 0) {
                    tablesDiv.innerHTML += createTableHTML(nightShiftRows, "Night Shift");
                }
            }

            function createTableHTML(data, shiftName) {
                let tableHTML = `<h2>${shiftName}</h2><table border='1'><thead><tr>`;
                headers.forEach(header => tableHTML += `<th>${header}</th>`);
                tableHTML += "</tr></thead><tbody>";

                data.forEach(row => {
                    tableHTML += "<tr>";
                    row.forEach(cell => tableHTML += `<td>${cell}</td>`);
                    tableHTML += "</tr>";
                });

                tableHTML += "</tbody></table><br>";
                return tableHTML;
            }

            // Initial Render
            renderTables(defaultDate);

            // Handle dropdown change
            document.getElementById("dateFilter").addEventListener("change", function () {
                renderTables(this.value);
            });
        })
        .catch(error => {
            console.error("[Error] Failed to load CSV:", error);
        });
});
