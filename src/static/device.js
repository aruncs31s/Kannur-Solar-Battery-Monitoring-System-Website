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
const battery = createChart('chart-battery', 'Battery Voltage Over Time', 'Voltage (V)', 'Battery Voltage');

// Function to update the dashboard
function updateDashboard() {
    fetch('/api/data')  
        .then(response => {
            // console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            // console.log('Data received:', data);
            if (data.length > 0) {
                const latest = data[0];
                console.log('Latest data:', latest);
                console.log('Battery voltage:', latest.battery_voltage);
                // Update current values
                // document.getElementById('battery').textContent = latest.battery_voltage;
                
                document.getElementById('charts.battery').textContent = latest;

                // Update charts
                const chartData = data.reverse().map(reading => ({
                    battery: [new Date(reading.timestamp).getTime(), reading.battery_voltage]
                }));

                charts.battery.series[0].setData(chartData.map(d => d.battery));
            } else {
                console.log('No data available');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Update dashboard every 5 seconds
setInterval(updateDashboard, 5000);
updateDashboard();