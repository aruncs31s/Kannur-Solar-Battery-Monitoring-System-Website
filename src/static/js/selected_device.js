debug = 1;
// Time offset for IST
timeOffset = 19800000;

document.addEventListener("DOMContentLoaded", function () {
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
let chartIsLoaded=false;

async function get_latest_data() {
  try {
    const response = await fetch(`/api/data?device_id=${current_node}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // console.log({data})
    if (data.length > 0) {
      const latest_data = data[data.length - 1];
      console.log("Response from /api/data (latest):", latest_data);
      return latest_data;
    }
}
catch (error) {
  console.error("Error fetching latest data:", error);
}
}
function loadInitialChart() {
  fetch(`/api/data?device_id=${current_node}`)
    .then((response) => {
      if (!response.ok) { //Check if status is not 200
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const latest = data[data.length - 1];
        console.log("Response from /api/data (today):", data);
        console.log("Length of the data is " + (data.length).toString());
        console.log({ latest })
        // Update battery voltage display
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
        }
        // Prepare and set data for today's chart only
        initialChartData = data.map((reading) => [
          new Date(reading.timestamp).getTime() +
          new Date().getTimezoneOffset() * -60000,
          reading.battery_voltage,
        ]);
        charts.battery.series[0].setData(initialChartData);
        chartIsLoaded=true;
      }
      else {
        console.log("No data available for today");
        // Optionally clear today's chart or show a message
        // charts.battery.series[0].setData([]);
        // const batteryElement = document.getElementById("current-battery-value");
        // if (batteryElement) {
        //   batteryElement.textContent = "N/A";
        // }
      }
    })
      .catch((error) => console.error("Error fetching today's data:", error));
}

loadInitialChart();

// New async Functions
async function updateOldChart_a(day, theChart) {
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
        theChart.series[0].setData(chartData);
      } else {
        console.log(`No data available for prev_${day}`);
        theChart.series[0].setData([]);
      }
    } catch (error) {
      console.error(`Error fetching data for prev_1:`, error);
    }
  }



// // Fix setInterval for live updates
// setInterval(async () => {
//   const latest = await get_latest_data();
//   if (latest && latest.hasOwnProperty("battery_voltage")) {
//     const x = new Date(latest.timestamp).getTime() +  timeOffset ;
//     const y = parseFloat(latest.battery_voltage);
//     if (charts.battery.series[0].data.length > 4000) {
//       charts.battery.series[0].addPoint([x, y], true, true, true);
//     } else {
//       charts.battery.series[0].addPoint([x, y], true, false, true);
//     }
//     const batteryElement = document.getElementById("current-battery-value");
//     if (batteryElement) {
//       batteryElement.textContent = latest.battery_voltage;
//     }
//   } else {
//     console.log("No new data available for live update.");
//   }
// }, 15000);

// Remove redundant commented-out code

// Ensure updateAllOldCharts is called after defining updateOldChart
async function updateAllOldCharts() {
//   // a_1 a_2 in the sense that these are async funtions , change later 
//   // updateOldChart_a(day,Chart)
while (chartIsLoaded==false){
  await new Promise(resolve => setTimeout(resolve, 1000));
}
  console.log("Chart is loaded, proceeding to update old charts.");
  await updateOldChart_a(1, charts.old_battery_1);
  await updateOldChart_a(2, charts.old_battery_2);
  await updateOldChart_a(3, charts.old_battery_3);
  await updateOldChart_a(4, charts.old_battery_4);
  await updateOldChart_a(5, charts.old_battery_5);  
  await updateOldChart_a(6, charts.old_battery_6);

}

// Initial call
updateAllOldCharts();

});
