// Create a new Chart
function createChart(containerId, title, yAxisTitle, seriesName) {
  return Highcharts.chart(containerId, {
    chart: {
      backgroundColor: "#3b4252",
      // backgroundColor: "#ffffff",

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

// Create a chart
const charts = {
  battery: createChart(
    "chart-battery",
    "Battery Voltage Over Time",
    "Voltage (V)",
    "Battery Voltage"
  ),
};

let initialChartData = [];

// Function to update the dashboard
function updateDashboard() {
  fetch("/api/data")
    .then((response) => {
      // console.log("Response received:", response);
      return response.json();
    })
    .then((data) => {
      // console.log("Data received:", data);
      if (data.length > 0) {
        const latest = data[data.length - 1];
        // console.log("Latest data:", latest);
        // console.log("Battery voltage:", latest.battery_voltage);

        // Check if battery_voltage exists in the latest data
        if (latest.hasOwnProperty("battery_voltage")) {
          // Update current values
          document.getElementById("battery").textContent =
            latest.battery_voltage;
        } else {
          console.error(
            "battery_voltage property is missing in the latest data"
          );
        }

        initialChartData = data.map((reading) => [
          new Date(reading.timestamp).getTime() + 19800000,
          reading.battery_voltage,
        ]);

        charts.battery.series[0].setData(initialChartData);
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// To update the line graph
setInterval(function () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Get Json response
      var data = JSON.parse(this.responseText);
      // console.log("data get", data);
      // Get current time
      var x = new Date().getTime() + 19800000,
        y = parseFloat(data[data.length - 1].battery_voltage);
      // console.log("x", x);
      // Get battery_voltage
      if (charts.battery.series[0].data.length > 4000) {
        charts.battery.series[0].addPoint([x, y], true, true, true);
      } else {
        charts.battery.series[0].addPoint([x, y], true, false, true);
      }
    }
  };
  xhttp.open("GET", "/api/data", true);
  xhttp.send();
}, 1000);






// For Network Graph
// Declare a global variable to store the fetched data
let nearNodesData = [];
let nearAllNodesData = [];
// Function to fetch data and store in the global variable
function fetchNearNodes(current_node) {
  return fetch("http://localhost:5000/device/get_near_nodes/" + current_node)
    .then((response) => {
      // console.log("Response received:", response);
      return response.json();
    })
    .then((data) => {
      // console.log("Data received:", data);
      nearNodesData = data; // Store data in the global variable
      return data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
function fetchAllNodes(current_node) {
  return fetch("http://localhost:5000/device/get_all_nodes/" + current_node)
    .then((response) => {
      console.log("Response received:", response);
      return response.json();
    })
    .then((data) => {
      // console.log("Data received:", data);
      nearAllNodesData = data; // Store data in the global variable
      return data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function getTotalNearNodes(type) {
  if (type === "near_nodes") {
    return nearNodesData["total_near_nodes"];
  } else if (type === "all_nodes") {
    return nearAllNodesData[0]?.near_all_nodes?.length || 0;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // Thanks: https://www.highcharts.com/docs/chart-and-series-types/network-graph
  const current_node = document
    .getElementById("current-node")
    .innerHTML.split(":")
    .map((part) => part.trim())[1];
  console.log(current_node);

  // await fetchNearNodes(current_node);
  await fetchAllNodes(current_node);
  const total_near_nodes = getTotalNearNodes("all_nodes");
  console.log("Total near nodes:", total_near_nodes);

  let near_node_arr = [];
  if (nearAllNodesData[0]?.near_all_nodes) {
    for (let i = 0; i < total_near_nodes; i++) {
      near_node_arr.push([current_node, nearAllNodesData[0]["near_all_nodes"][i]]);
    }
  } else {
    console.error("near_all_nodes data is missing or not properly formatted");
  }
  console.log("nodes");
  console.log(near_node_arr);

  try {
    Highcharts.chart("graph-container", {
      chart: {
        type: "networkgraph",
        plotBorderWidth: 1,
        backgroundColor: "#3b4252",
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null, // Disable the title
      },
      plotOptions: {
        networkgraph: {
          keys: ["from", "to"],
          marker: {
            radius: 7, // Set the default node size
          },
          events: {
            click: function (event) {
              const nodeName = event.point.name;
              console.log("Node clicked:", nodeName);
              window.location.href = "/device/" + nodeName;
            },
          },
        },
      },
      series: [
        {
          layoutAlgorithm: {
            enableSimulation: true,
            initialPositions: function () {
              const chart = this.series[0].chart,
                width = chart.plotWidth,
                height = chart.plotHeight;

              this.nodes.forEach(function (node) {
                // If initial positions were set previously, use that
                // positions. Otherwise use random position:
                node.plotX =
                  node.plotX === undefined ? Math.random() * width : node.plotX;
                node.plotY =
                  node.plotY === undefined ? Math.random() * height : node.plotY;
              });
            },
          },
          name: "K8",
          data: near_node_arr,
          nodes: [
            {
              id: current_node,
              color: "green", // Change the color to green
              marker: {
                radius: 14, // Increase the size of the current node
              },
            },
            {
              id: nearAllNodesData[0]?.main_node,
              color: "red", // Change the color to red
              marker: {
                radius: 10, // Set the size of the main node
              },
            },
          ],
          dataLabels: {
            enabled: true,
            linkFormat: "",
            style: {
              color: "white",
              textOutline: "none",
              fontWeight: "normal",
              fontSize: "14px",
              // color: getComputedStyle(document.documentElement).getPropertyValue('--nord8'),
            },
          },
        },
      ],
    });
    console.log("Highcharts chart initialized");
  } catch (error) {
    console.error("Error initializing Highcharts chart:", error);
  }
  updateDashboard();
});

// Update dashboard every 5 seconds
setInterval(updateDashboard, 5000);
updateDashboard();

function get_data() {
  console.log("date_requested to /api/data");
  const TIME_INDEX = 2;
  const BAT_INDEX = 3;
  const ip = "192.168.1.2";
  const raw_data = db.get_data(ip, (date = datetime.now().date()));
  const top_data = raw_data[raw_data.length - 1];
  const data = {
    time: top_data[TIME_INDEX].strftime("%H:%M:%S"),
    battery_voltage: top_data[BAT_INDEX],
  };
  return jsonify(data), 200;
}
