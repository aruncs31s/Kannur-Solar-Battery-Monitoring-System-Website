# app.py
from flask import Flask, request, jsonify, render_template
import sqlite3
import csv
from database import Database

db = Database()
app = Flask(__name__)
ESP8266_PORT = 80

@app.route('/')
def home():
    devices = []
    with open('devices.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            devices.append({'name': row['Assigned_Place'], 'status': row['Status'], 'ip': row['IP']})
    return render_template('home.html', devices=devices)


@app.route('/api/control', methods=['POST'])
def control_esp():
    try:
        data = request.get_json()
        state = data.get('state', False)
        esp_url = f"http://{ESP8266_IP}:{ESP8266_PORT}/control"
        response = requests.post(esp_url, json={'state': state}, timeout=5)
        if response.status_code == 200:
            return jsonify({"status": "success", "state": state}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to communicate with ESP8266"}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": f"Connection error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/devices', methods=['GET'])
def devices_page():
    devices = []
    with open('devices.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            devices.append({'name': row['Assigned_Place'], 'status': row['Status'], 'ip': row['IP']})
    return render_template('devices.html', devices=devices)

@app.route('/api/data', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()
        conn = sqlite3.connect('sensor_data.db')
        c = conn.cursor()
        c.execute('''INSERT INTO sensor_readings (battery_voltage) VALUES (?)''', (data.get('battery_voltage'),))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        timeframe = request.args.get('timeframe', 'hour')
        conn = sqlite3.connect('sensor_data.db')
        c = conn.cursor()
        if timeframe == 'hour':
            time_constraint = "datetime('now', '-1 hour')"
        elif timeframe == 'day':
            time_constraint = "datetime('now', '-1 day')"
        elif timeframe == 'week':
            time_constraint = "datetime('now', '-7 days')"
        else:
            time_constraint = "datetime('now', '-1 hour')"
        c.execute(f'''SELECT * FROM sensor_readings WHERE timestamp > {time_constraint} ORDER BY timestamp DESC''')
        rows = c.fetchall()
        conn.close()
        data = [{'id': row[0], 'battery_voltage': row[1], 'timestamp': row[2]} for row in rows]
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/device-click', methods=['POST'])
def device_click():
    try:
        data = request.get_json()
        device_name = data.get('name')
        return jsonify({"status": "success", "device": device_name}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/devices', methods=['GET'])
def get_devices():
    devices = []
    with open('devices.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            devices.append({'name': row['Assigned_Place'], 'status': row['Status'], 'ip': row['IP']})
    return jsonify(devices), 200

@app.route('/api/measurements', methods=['POST'])
def receive_measurements():
    try:
        data = request.get_json()
        device_id = data.get('device_id')
        measurements = data.get('measurements')
        conn = sqlite3.connect('sensor_data.db')
        c = conn.cursor()
        for measurement in measurements:
            c.execute('''INSERT INTO measurements (device_id, parameter1, parameter2, parameter3) VALUES (?, ?, ?, ?)''',
                      (device_id, measurement['parameter1'], measurement['parameter2'], measurement['parameter3']))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/measurements/<int:device_id>', methods=['GET'])
def get_measurements(device_id):
    try:
        conn = sqlite3.connect('sensor_data.db')
        c = conn.cursor()
        c.execute('''SELECT parameter1, parameter2, parameter3, timestamp FROM measurements WHERE device_id = ? ORDER BY timestamp DESC''', (device_id,))
        rows = c.fetchall()
        conn.close()
        measurements = [{'parameter1': row[0], 'parameter2': row[1], 'parameter3': row[2], 'timestamp': row[3]} for row in rows]
        return jsonify(measurements), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/device/<device_name>', methods=['GET'])
def device_page(device_name):
    # Fetch device-specific data if needed
    return render_template('device.html', device_name=device_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)