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
    fetch('http://localhost:5000/device/get_near_nodes/' + current_node)
        .then(response => {
            console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            nearNodesData = data; // Store data in the global variable
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function getTotalNearNodes() {
    console.log('Near nodes data:',nearNodesData['near_nodes']);
    return nearNodesData['near_nodes'].length;
}

document.addEventListener('DOMContentLoaded', function () {
    const current_node = document.getElementById('current-node').innerHTML.split(':').map(part => part.trim())[1];
    console.log(current_node);

    fetchNearNodes(current_node);

    setTimeout(() => {
        const total_near_nodes = getTotalNearNodes();
        console.log('Total near nodes:', total_near_nodes);
    }, 1000); // Delay to ensure data is fetched before accessing
    for (let i = 0; i < total_near_nodes; i++) {
        console.log(nearNodesData['near_nodes'][i]);
    }
    // console.log('DOM fully loaded and parsed');
    Highcharts.chart('graph-container', {
        chart: {
            type: 'networkgraph',
            plotBorderWidth: 1,
            backgroundColor: '#2e3440',
        },
        title: {
            text: null // Disable the title
        },
        plotOptions: {
            networkgraph: {
                keys: ['from', 'to'],
                marker: {
                    radius: 6 // Set the default node size
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

            data: [
                [current_node, 'Iritty'],
                ['Kannur', 'Kannur'],
                ['Kannur', 'Payyannur']
            ],
            nodes: [{
                id: 'Kannur',
                color: 'green', // Change the color to green
                marker: {
                    radius: 15 // Increase the size of the Kannur node
                }
            }, {
                id: 'Iritty',
                color: 'red', // Change the color to red
                marker: {
                    radius: 10 // Set the size of the Iritty node
                }
            }, {
                id: 'Thalasseri',
                color: 'red',
                marker: {
                    radius: 10
                }
            }, {
                id: 'Payyannur',
                color: 'red',
                marker: {
                    radius: 10
                }
            }, {
                id: 'Taliparamba',
                color: 'red',
                marker: {
                    radius: 10
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