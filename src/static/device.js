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
                co
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



// Update dashboard every 5 seconds
setInterval(updateDashboard, 5000);
updateDashboard();