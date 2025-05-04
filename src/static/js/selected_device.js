
document.addEventListener("DOMContentLoaded", function () {
  const current_node = document
  .getElementById("current-node")
  .innerHTML.split(":")
  .map((part) => part.trim())[1];
  console.log("Curret node : " + current_node);
  // Ensure the DOM is fully loaded before initializing charts
  if (document.getElementById("chart-battery")) {
    console.log("Initializing charts...");
    const charts = {
      battery: createChart(
        "chart-battery",
        "Battery Voltage Over Time",
        "Voltage (V)",
        "Battery Voltage"
      ),
    };
    let initialChartData = [];
    function updateDashboard() {
      fetch("/api/data?device_id="+current_node)
        .then((response) =>{
          console.log("Response from /api/data:", response);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.length > 0) {
            const latest = data[data.length - 1];
            // Check if battery_voltage exists
            if (latest.hasOwnProperty("battery_voltage")) {
              const batteryElement = document.getElementById("battery");
              if (batteryElement) {
                batteryElement.textContent = latest.battery_voltage;
              } else {
                console.error("Battery element not found in DOM.");
              }
            } else {
              console.error("battery_voltage property is missing in the latest data");
            }

            initialChartData = data.map((reading) => [
              new Date(reading.timestamp).getTime() + new Date().getTimezoneOffset() * -60000,
              reading.battery_voltage,
            ]);

            charts.battery.series[0].setData(initialChartData);
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => console.error("Error fetching data:", error));
    }

    // Use fetch instead of XMLHttpRequest for updating the line graph
    setInterval(() => {
      fetch("/api/data")
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            const latest = data[data.length - 1];
            const x = new Date().getTime() + new Date().getTimezoneOffset() * -60000;
            const y = parseFloat(latest.battery_voltage);

            if (charts.battery.series[0].data.length > 4000) {
              charts.battery.series[0].addPoint([x, y], true, true, true);
            } else {
              charts.battery.series[0].addPoint([x, y], true, false, true);
            }
          } else {
            console.log("No data available for live update.");
          }
        })
        .catch((error) => console.error("Error fetching live data:", error));
    }, 15000);

    updateDashboard();
    setInterval(updateDashboard, 5000);
  } else {
    console.error("Chart container not found in DOM.");
  }
});


function createChart(containerId, title, yAxisTitle, seriesName) {
  return Highcharts.chart(containerId, {
    chart: {
      backgroundColor: "#3b4252",
      type: "line",
    },
    title: {
      text: title,
      style: {
        color: getComputedStyle(document.documentElement).getPropertyValue(
          "--nord4"
        ),
      },
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Time",
        style: {
          color: getComputedStyle(document.documentElement).getPropertyValue(
            "--nord4"
          ),
        },
      },
      labels: {
        style: {
          color: getComputedStyle(document.documentElement).getPropertyValue(
            "--nord4"
          ),
        },
      },
    },
    yAxis: {
      title: {
        text: yAxisTitle,
        style: {
          color: getComputedStyle(document.documentElement).getPropertyValue(
            "--nord4"
          ),
        },
      },
      labels: {
        style: {
          color: getComputedStyle(document.documentElement).getPropertyValue(
            "--nord4"
          ),
        },
      },
    },
    series: [
      {
        name: seriesName,
        data: [],
        color: getComputedStyle(document.documentElement).getPropertyValue(
          "--nord8"
        ),
      },
    ],
    legend: {
      itemStyle: {
        color: getComputedStyle(document.documentElement).getPropertyValue(
          "--nord4"
        ),
      },
    },
    credits: {
      enabled: false,
    },
  });
}