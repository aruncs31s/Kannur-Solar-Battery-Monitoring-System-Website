debug = 1;
timeOffset = -60000;
const current_node = document
  .getElementById("current-node")
  .innerHTML.split(":")
  .map((part) => part.trim())[1];
console.log("Curret node : " + current_node);

const charts = {
  battery: createChart(
    "chart-battery",
    "Battery Voltage (Today)", // Updated title
    "Voltage (V)",
    "Battery Voltage",
  ),
  old_battery_1: createChart(
    "chart-battery_prev_1",
    "Battery Voltage (Yesterday)", // Updated title
    "Voltage (V)",
    "Battery Voltage",
  ),
  old_battery_2: createChart(
    "chart-battery_prev_2",
    "Battery Voltage (2 Days Ago)", // Updated title
    "Voltage (V)",
    "Battery Voltage",
  ),
  old_battery_3: createChart(
    "chart-battery_prev_3",
    "Battery Voltage (3 Days Ago)", // Updated title
    "Voltage (V)",
    "Battery Voltage",
  ),
  old_battery_4: createChart(
    "chart-battery_prev_4",
    "Battery Voltage (4 Days Ago)", // Updated title
    "Voltage (V)",
    "Battery Voltage",
  ),
  old_battery_5: createChart(
    "chart-battery_prev_5",
    "Battery Voltage (5 Days Ago)", // Updated title
    "Voltage (V)",
    "Battery Voltage",
  ),
  old_battery_6: createChart(
    "chart-battery_prev_6",
    "Battery Voltage (6 Days Ago)", // Updated title
    "Voltage (V)",
    "Battery Voltage",
  ),
};

// For live graph data (current day)
let initialChartData = [];

// Function to update the main dashboard elements and today's chart
function updateLiveChart() {
  fetch(`/api/data?device_id=${current_node}`) // Fetch today's data
    .then((response) => {
      console.log("Response from /api/data (today):", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (debug) {
        console.log("Inside get , data");
      }
      if (data.length > 0) {
        const latest = data[data.length - 1];
        // Update battery voltage display
        if (latest.hasOwnProperty("battery_voltage")) {
          const batteryElement = document.getElementById(
            "current-battery-value",
          );

          if (batteryElement) {
            batteryElement.textContent = latest.battery_voltage;
            if (debug == 1) {
              console.log("Battery Element Exists");
            }
          } else {
            console.error("Battery element not found in DOM.");
          }
        } else {
          console.error(
            "battery_voltage property is missing in the latest data",
          );
        }

        // Prepare and set data for today's chart only
        initialChartData = data.map((reading) => [
          new Date(reading.timestamp).getTime() +
            new Date().getTimezoneOffset() * -60000,
          reading.battery_voltage,
        ]);
        charts.battery.series[0].setData(initialChartData);
      } else {
        console.log("No data available for today");
        // Optionally clear today's chart or show a message
        // charts.battery.series[0].setData([]);
        const batteryElement = document.getElementById("current-battery-value");
        if (batteryElement) {
          batteryElement.textContent = "N/A";
        }
      }
    })
    .catch((error) => console.error("Error fetching today's data:", error));
}

function updateOldChart_1() {
  fetch(`/api/data/old?device_id=${current_node}&day=1`)
    .then((response) => {
      console.log("Response from /api/data (prev_1):", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const chartData = data.map((reading) => [
          new Date(reading.timestamp).getTime() +
            new Date().getTimezoneOffset() * timeOffset,
          reading.battery_voltage,
        ]);
        charts.old_battery_1.series[0].setData(chartData);
      } else {
        console.log("No data available for prev_1");
        // Optionally clear the chart or show a message
        charts.old_battery_1.series[0].setData([]);
      }
    })
    .catch((error) => console.error("Error fetching data for prev_1:", error));
}

// Fixing the incorrect usage of timeOffset in updateOldChart_* functions
function updateOldChart_2() {
  fetch(`/api/data/old?device_id=${current_node}&day=2`)
    .then((response) => {
      console.log("Response from /api/data (prev_2):", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const chartData = data.map((reading) => [
          new Date(reading.timestamp).getTime(), // Use timestamp directly
          reading.battery_voltage,
        ]);
        charts.old_battery_2.series[0].setData(chartData);
      } else {
        console.log("No data available for prev_2");
        charts.old_battery_2.series[0].setData([]);
      }
    })
    .catch((error) => console.error("Error fetching data for prev_2:", error));
}

// Fixing the incorrect usage of timeOffset in updateOldChart_* functions
function updateOldChart_3() {
  fetch(`/api/data/old?device_id=${current_node}&day=3`)
    .then((response) => {
      console.log("Response from /api/data (prev_3):", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const chartData = data.map((reading) => [
          new Date(reading.timestamp).getTime(), // Use timestamp directly
          reading.battery_voltage,
        ]);
        charts.old_battery_3.series[0].setData(chartData);
      } else {
        console.log("No data available for prev_3");
        charts.old_battery_3.series[0].setData([]);
      }
    })
    .catch((error) => console.error("Error fetching data for prev_3:", error));
}

function updateOldChart_4() {
  fetch(`/api/data/old?device_id=${current_node}&day=4`)
    .then((response) => {
      console.log("Response from /api/data (prev_4):", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const chartData = data.map((reading) => [
          new Date(reading.timestamp).getTime() +
            new Date().getTimezoneOffset() * timeOffset,
          reading.battery_voltage,
        ]);
        charts.old_battery_4.series[0].setData(chartData);
      } else {
        console.log("No data available for prev_4");
        charts.old_battery_4.series[0].setData([]);
      }
    })
    .catch((error) => console.error("Error fetching data for prev_4:", error));
}

function updateOldChart_5() {
  fetch(`/api/data/old?device_id=${current_node}&day=5`)
    .then((response) => {
      console.log("Response from /api/data (prev_5):", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const chartData = data.map((reading) => [
          new Date(reading.timestamp).getTime() +
            new Date().getTimezoneOffset() * timeOffset,
          reading.battery_voltage,
        ]);
        charts.old_battery_5.series[0].setData(chartData);
      } else {
        console.log("No data available for prev_2");
        charts.old_battery_5.series[0].setData([]);
      }
    })
    .catch((error) => console.error("Error fetching data for prev_5:", error));
}

function updateOldChart_6() {
  fetch(`/api/data/old?device_id=${current_node}&day=6`)
    .then((response) => {
      console.log("Response from /api/data (prev_6):", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const chartData = data.map((reading) => [
          new Date(reading.timestamp).getTime() +
            new Date().getTimezoneOffset() * timeOffset,
          reading.battery_voltage,
        ]);
        charts.old_battery_6.series[0].setData(chartData);
      } else {
        console.log("No data available for prev_6");
        charts.old_battery_6.series[0].setData([]);
      }
    })
    .catch((error) => console.error("Error fetching data for prev_6:", error));
}

// Define a generic updateOldChart function to reduce redundancy
async function updateOldChart(day, chart) {
  try {
    const response = await fetch(`/api/data/old?device_id=${current_node}&day=${day}`);
    console.log(`Response from /api/data (prev_${day}):`, response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      const chartData = data.map((reading) => [
        new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * timeOffset,
        reading.battery_voltage,
      ]);
      chart.series[0].setData(chartData);
    } else {
      console.log(`No data available for prev_${day}`);
      chart.series[0].setData([]);
    }
  } catch (error) {
    console.error(`Error fetching data for prev_${day}:`, error);
  }
}

// Fix setInterval for live updates by removing `await`
setInterval(() => {
  fetch(`/api/data?device_id=${current_node}`)
    .then((response) => response.json())
    .then((latest) => {
      if (latest && latest.hasOwnProperty("battery_voltage")) {
        const x = new Date(latest.timestamp).getTime() + new Date().getTimezoneOffset() * -60000;
        const y = parseFloat(latest.battery_voltage);

        if (charts.battery.series[0].data.length > 4000) {
          charts.battery.series[0].addPoint([x, y], true, true, true);
        } else {
          charts.battery.series[0].addPoint([x, y], true, false, true);
        }

        const batteryElement = document.getElementById("battery");
        if (batteryElement) {
          batteryElement.textContent = latest.battery_voltage;
        }
      } else {
        console.log("No new data available for live update.");
      }
    })
    .catch((error) => console.error("Error fetching live data:", error));
}, 15000);

// Remove redundant commented-out code

// Ensure updateAllOldCharts is called after defining updateOldChart
async function updateAllOldCharts() {
  await updateOldChart(1, charts.old_battery_1);
  await updateOldChart(2, charts.old_battery_2);
  await updateOldChart(3, charts.old_battery_3);
  await updateOldChart(4, charts.old_battery_4);
  await updateOldChart(5, charts.old_battery_5);
  await updateOldChart(6, charts.old_battery_6);
}

// Initial call
updateAllOldCharts();

// Adjust interval for dashboard updates if necessary
setInterval(updateLiveChart, 60000); // Update dashboard data every minute
