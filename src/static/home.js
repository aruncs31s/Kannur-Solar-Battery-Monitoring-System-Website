document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('search-input').addEventListener('input', searchDevices);
    document.querySelector('.search-bar button:nth-child(2)').addEventListener('click', sortDevices);
});
// Make the ? first
let sortAscending = true;

function sendDeviceInfo(deviceName) {
    fetch('/device-click', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: deviceName })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.href = `/device/${deviceName}`;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function sortDevices() {
    const deviceList = document.getElementById('device-list');
    const devices = Array.from(deviceList.getElementsByTagName('li'));

    devices.sort((a, b) => {
        const statusA = a.classList.contains('active-device') ? 0 : 1;
        const statusB = b.classList.contains('active-device') ? 0 : 1;
        return sortAscending ? statusA - statusB : statusB - statusA;
    });

    devices.forEach(device => deviceList.appendChild(device));
    sortAscending = !sortAscending;
}

function searchDevices() {
    const query = document.getElementById('search-input').value;
    fetch(`/api/search?query=${query}`)
        .then(response => response.json())
        .then(data => {
            const deviceList = document.getElementById('device-list');
            deviceList.innerHTML = '';
            data.forEach(device => {
                const li = document.createElement('li');
                li.innerHTML = `<button onclick="sendDeviceInfo('${device.name}')">${device.name}</button>
                            <span>Status: ${device.status} - IP: ${device.ip}</span>`;
                deviceList.appendChild(li);
            });
            sortDevices();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
