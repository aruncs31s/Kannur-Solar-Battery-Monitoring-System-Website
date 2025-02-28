function updateDate() {
    var selectedDate = document.getElementById('datepicker').value;
    console.log('Selected date:', selectedDate);
    // You can add more code here to handle the selected date
}
var xhr = new XMLHttpRequest();
xhr.open("POST", "/your-server-endpoint", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log('Server response:', xhr.responseText);
    }
};
xhr.send(JSON.stringify({ date: selectedDate }));
