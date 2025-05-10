const fetch = require("node-fetch"); // Import node-fetch

// Mocking the DOM element for demonstration
const batteryElement = { textContent: "" };

// Replace `current_node` with a hardcoded value or fetch it from a config
const current_node = "Chittariparamba";

fetch(`http://localhost:8000/api/data?device_id=${current_node}`) // Replace with your API URL
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // Parse the response as JSON
  })
  .then((data) => {
    const latest = data[data.length - 1]; // Access the latest data
    console.log(latest); // Log the latest data
  })
  .catch((error) => console.error("Error fetching data:", error));
