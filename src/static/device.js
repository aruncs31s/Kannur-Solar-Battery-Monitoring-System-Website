function createChart(containerId, title, yAxisTitle, seriesName) {
    return Highcharts.chart(containerId, {
        // color: {
            
        //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        //     stops: [
        //     [  0, '#003399'],
        //             [1, '#3366AA']
        //                 ]
        //     }, 
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

// Initialize charts
const charts = {
    battery: createChart('chart-battery', 'Battery Voltage', 'Voltage (V)', 'Battery')
};

const controlButton = document.getElementById('controlButton');
const buttonStatus = document.getElementById('buttonStatus');
let isActive = false;

controlButton.addEventListener('click', function() {
    isActive = !isActive;
    controlButton.classList.toggle('active');
    
    fetch('/api/control', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            state: isActive
        })
    })
    .then(response => response.json())
    .then(data => {
        buttonStatus.textContent = `Status: ${isActive ? 'Active' : 'Inactive'}`;
        if (data.error) {
            alert('Error: ' + data.error);
            isActive = !isActive; // Revert state on error
            controlButton.classList.toggle('active');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send command to ESP8266');
        isActive = !isActive; // Revert state on error
        controlButton.classList.toggle('active');
    });
});

function updateDashboard() {
    fetch('/api/data?timeframe=hour')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const latest = data[0];
                
                // Update current values
                document.getElementById('battery').textContent = latest.battery_voltage;

                // Update charts
                const chartData = data.reverse().map(reading => ({
                    battery: [new Date(reading.timestamp).getTime(), reading.battery_voltage]
                }));

                charts.battery.series[0].setData(chartData.map(d => d.battery));
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function updateDeviceStatus() {
    fetch('/api/devices')
        .then(response => response.json())
        .then(devices => {
            const deviceList = document.getElementById('deviceList');
            deviceList.innerHTML = '';
            devices.forEach(device => {
                const li = document.createElement('li');
                li.textContent = `${device.name} - ${device.status}`;
                deviceList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching device status:', error));
}

// Update dashboard every 5 seconds
setInterval(updateDashboard, 5000);
updateDashboard();  // Initial update

// Update device status every 10 seconds
setInterval(updateDeviceStatus, 10000);
updateDeviceStatus();  // Initial update

document.addEventListener('DOMContentLoaded', function() {
    const deviceName = document.querySelector('h2').innerText.split(': ')[1];
    fetchDeviceStatus(deviceName);
});

function fetchDeviceStatus(deviceName) {
    fetch(`/api/devices`)
        .then(response => response.json())
        .then(data => {
            const deviceList = document.getElementById('deviceList');
            deviceList.innerHTML = '';
            data.forEach(device => {
                if (device.name === deviceName) {
                    const li = document.createElement('li');
                    li.innerHTML = `Name: ${device.name}, Status: ${device.status}, IP: ${device.ip}`;
                    deviceList.appendChild(li);
                }
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
