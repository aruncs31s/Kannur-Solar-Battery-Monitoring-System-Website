// Create a new Chart
function createChart(containerId, title, yAxisTitle, seriesName) {
    return Highcharts.chart(containerId, {
        chart: {
            backgroundColor: '#3b4252',
            type: 'line'
        },
        title: {
            text: title,
            style: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--nord4')
            }
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Time',
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--nord4')
                }
            },
            labels: {
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--nord4')
                }
            }
        },
        yAxis: {
            title: {
                text: yAxisTitle,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--nord4')
                }
            },
            labels: {
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--nord4')
                }
            }
        },
        series: [{
            name: seriesName,
            data: [],
            color: getComputedStyle(document.documentElement).getPropertyValue('--nord8')
        }],
        legend: {
            itemStyle: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--nord4')
            }
        },
        credits: {
            enabled: false
        }
    });
}

// Create a chart 
const charts = {
    battery: createChart('chart-battery', 'Battery Voltage Over Time', 'Voltage (V)', 'Battery Voltage')
};

// Function to update the dashboard
function updateDashboard() {
    fetch('/api/data')  
        .then(response => {
            console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            if (data.length > 0) {
                const latest = data[0];
                console.log('Latest data:', latest);
                console.log('Battery voltage:', latest.battery_voltage);

                // Check if battery_voltage exists in the latest data
                if (latest.hasOwnProperty('battery_voltage')) {
                    // Update current values
                    document.getElementById('battery').textContent = latest.battery_voltage;
                } else {
                    console.error('battery_voltage property is missing in the latest data');
                }

                // Update charts
                // const chartData = data.reverse().map(reading => ({
                //     battery: [new Date(reading.timestamp).getTime(), reading.battery_voltage]
                // }));

                // charts.battery.series[0].setData(chartData.map(d => d.battery));
            } else {
                console.log('No data available');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

setInterval(function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Get Json response
            var data = JSON.parse(this.responseText);

            // Get current time
            var x = (new Date()).getTime(),
                // Get battery_voltage
                y = parseFloat(data[0]);
                // y = parseFloat(data.battery_voltage);
            if (charts.battery.series[0].data.length > 4000) {
                charts.battery.series[0].addPoint([x, y], true, true, true);
            } else {
                charts.battery.series[0].addPoint([x, y], true, false, true);
            }
        }
    };
    xhttp.open("GET", "/data", true);
    xhttp.send();
}, 1000);

// For Network Graph
// Declare a global variable to store the fetched data
let nearNodesData = [];

// Function to fetch data and store in the global variable
function fetchNearNodes(current_node) {
    return fetch('http://localhost:5000/device/get_near_nodes/' + current_node)
        .then(response => {
            console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            nearNodesData = data; // Store data in the global variable
            return data;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function getTotalNearNodes() {
    console.log('Near nodes data:', nearNodesData['near_nodes']);
    return nearNodesData['near_nodes'].length;
}

document.addEventListener('DOMContentLoaded', async function () {
    // Thanks: https://www.highcharts.com/docs/chart-and-series-types/network-graph 
    const current_node = document.getElementById('current-node').innerHTML.split(':').map(part => part.trim())[1];
    console.log(current_node);

    await fetchNearNodes(current_node);

    const total_near_nodes = getTotalNearNodes();
    console.log('Total near nodes:', total_near_nodes);

    let near_node_arr = [];
    for (let i = 0; i < total_near_nodes; i++) {
        near_node_arr.push([current_node, nearNodesData['near_nodes'][i]]);
    }
    console.log('nodes');
    console.log(near_node_arr);

    Highcharts.chart('graph-container', {
        chart: {
            type: 'networkgraph',
            plotBorderWidth: 1,
            backgroundColor: '#3b4252',
        },
        credits: {
            enabled: false
        },
        title: {
            text: null // Disable the title
        },
        plotOptions: {
            networkgraph: {
                keys: ['from', 'to'],
                marker: {
                    radius: 7 // Set the default node size
                },
                events: {
                    click: function (event) {
                        const nodeName = event.point.name;
                        console.log('Node clicked:', nodeName);
                        window.location.href = '/device/' + nodeName;
                    }
                }
            }
        },
        series: [{
            layoutAlgorithm: {
                enableSimulation: true,
                initialPositions: function () {
                    const chart = this.series[0].chart,
                        width = chart.plotWidth,
                        height = chart.plotHeight;

                    this.nodes.forEach(function (node) {
                        // If initial positions were set previously, use that
                        // positions. Otherwise use random position:
                        node.plotX = node.plotX === undefined ?
                            Math.random() * width : node.plotX;
                        node.plotY = node.plotY === undefined ?
                            Math.random() * height : node.plotY;
                    });
                }
            },
            name: 'K8',
            data: near_node_arr,
            nodes: [{
                id: current_node,
                color: 'green', // Change the color to green
                marker: {
                    radius: 14 // Increase the size of the current node
                }
            }],
            dataLabels: {
                enabled: true,
                linkFormat: '',
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--nord8')
                }
            }
        }]
    });
    console.log('Highcharts chart initialized');
});

// Update dashboard every 5 seconds
setInterval(updateDashboard, 5000);
updateDashboard();