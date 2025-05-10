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

// New async Functions
async function updateOldChart_a_1() {
  try {
    const response = await fetch(`/api/data/old?device_id=${current_node}&day=1`);
    console.log(`Response from /api/data (prev_1):`, response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      const chartData = data.map((reading) => [
        new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * timeOffset,
        reading.battery_voltage,
      ]);
      charts.old_battery_1.series[0].setData(chartData);
    } else {
      console.log(`No data available for prev_1`);
      charts.old_battery_1.series[0].setData([]);
    }
  } catch (error) {
    console.error(`Error fetching data for prev_1:`, error);
  }
}
async function updateOldChart_a_2() {
  try {
    const response = await fetch(`/api/data/old?device_id=${current_node}&day=2`);
    console.log(`Response from /api/data (prev_2):`, response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      const chartData = data.map((reading) => [
        new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * timeOffset,
        reading.battery_voltage,
      ]);
      charts.old_battery_2.series[0].setData(chartData);
    } else {
      console.log(`No data available for prev_2`);
      charts.old_battery_2.series[0].setData([]);
    }
  } catch (error) {
    console.error(`Error fetching data for prev_2:`, error);
  }
}
async function updateOldChart_a_3() {
  try {
    const response = await fetch(`/api/data/old?device_id=${current_node}&day=3`);
    console.log(`Response from /api/data (prev_3):`, response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      const chartData = data.map((reading) => [
        new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * timeOffset,
        reading.battery_voltage,
      ]);
      charts.old_battery_3.series[0].setData(chartData);
    } else {
      console.log(`No data available for prev_3`);
      charts.old_battery_3.series[0].setData([]);
    }
  } catch (error) {
    console.error(`Error fetching data for prev_3:`, error);
  }
}
async function updateOldChart_a_4() {
  try {
    const response = await fetch(`/api/data/old?device_id=${current_node}&day=4`);
    console.log(`Response from /api/data (prev_4):`, response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      const chartData = data.map((reading) => [
        new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * timeOffset,
        reading.battery_voltage,
      ]);
      charts.old_battery_4.series[0].setData(chartData);
    } else {
      console.log(`No data available for prev_4`);
      charts.old_battery_4.series[0].setData([]);
    }
  } catch (error) {
    console.error(`Error fetching data for prev_4:`, error);
  }
}
async function updateOldChart_a_5() {
  try {
    const response = await fetch(`/api/data/old?device_id=${current_node}&day=5`);
    console.log(`Response from /api/data (prev_5):`, response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      const chartData = data.map((reading) => [
        new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * timeOffset,
        reading.battery_voltage,
      ]);
      charts.old_battery_5.series[0].setData(chartData);
    } else {
      console.log(`No data available for prev_5`);
      charts.old_battery_5.series[0].setData([]);
    }
  } catch (error) {
    console.error(`Error fetching data for prev_5:`, error);
  }
}
async function updateOldChart_a_6() {
  try {
    const response = await fetch(`/api/data/old?device_id=${current_node}&day=6`);
    console.log(`Response from /api/data (prev_6):`, response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      const chartData = data.map((reading) => [
        new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * timeOffset,
        reading.battery_voltage,
      ]);
      charts.old_battery_6.series[0].setData(chartData);
    } else {
      console.log(`No data available for prev_6`);
      charts.old_battery_6.series[0].setData([]);
    } 
  } catch (error) {
    console.error(`Error fetching data for prev_6:`, error);
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
  // a_1 a_2 in the sense that these are async funtions , change later 
  await updateOldChart_a_1();
  await updateOldChart_a_2();
  await updateOldChart_a_3();
  await updateOldChart_a_4();
  await updateOldChart_a_5();
  await updateOldChart_a_6();
}

// Initial call
updateAllOldCharts();

// Adjust interval for dashboard updates if necessary
// setInterval(updateLiveChart, 60000); // Update dashboard data every minute
