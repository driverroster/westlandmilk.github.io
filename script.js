document.addEventListener("DOMContentLoaded", function () {
    console.log("[Log] Fetching CSV file...");

    fetch("your_data.csv") // Replace with the actual CSV file path
        .then(response => response.text())
        .then(data => {
            console.log("[Log] CSV content loaded:");
            console.log(data);

            const rows = data.trim().split("\n").map(line => line.split(",").map(cell => cell.trim()));
            
            // Extract header row
            const headers = rows.shift();
            console.log("[Log] CSV Headers:", headers);

            // Extract unique dates correctly
            let uniqueDates = [...new Set(rows.map(row => row[6]?.trim()))]
                .filter(date => date.match(/^\d{4}-\d{2}-\d{2}$/)) // Ensure valid date format
                .sort();

            console.log("[Log] Unique dates found:", uniqueDates);

            updateScheduleTable(rows, uniqueDates);
        })
        .catch(error => console.error("[Error] Failed to load CSV:", error));
});

function updateScheduleTable(rows, uniqueDates) {
    const tableContainer = document.getElementById("scheduleTable");
    tableContainer.innerHTML = ""; // Clear previous content

    uniqueDates.forEach(date => {
        let tableHTML = `<h3>Schedule for ${date}</h3>`;
        tableHTML += `<table border="1">
            <thead>
                <tr>
                    <th>Unit</th>
                    <th>Departure Time</th>
                    <th>Driver Name</th>
                    <th>Run</th>
                    <th>Driver (on days off)</th>
                    <th>Shift</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>`;

        rows
            .filter(row => row[6] === date) // Filter by date column
            .forEach(row => {
                tableHTML += `<tr>
                    <td>${row[0]}</td>
                    <td>${row[1]}</td>
                    <td>${row[2]}</td>
                    <td>${row[3]}</td>
                    <td>${row[4]}</td>
                    <td>${row[5]}</td>
                    <td>${row[6]}</td>
                </tr>`;
            });

        tableHTML += "</tbody></table><br>";
        tableContainer.innerHTML += tableHTML;
    });

    console.log("[Log] Schedule updated successfully.");
}
