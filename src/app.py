# app.py
from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime
import requests
import csv

app = Flask(__name__)

ESP8266_IP = ""  
ESP8266_PORT = 80 


def init_db():
    conn = sqlite3.connect('sensor_data.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS sensor_readings
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  temperature REAL,
                  humidity REAL,
                  light_sensor_value REAL,
                  battery_voltage REAL,
                  led_relay_state TEXT,
                  rain_volume REAL,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

init_db()


@app.route('/api/control', methods=['POST'])
def control_esp():
    try:
        data = request.get_json()
        state = data.get('state', False)
        
        # Send command to ESP8266
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


@app.route('/')
def home():
    devices = []
    with open('devices.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        print("hi")
        for row in reader:
            devices.append({'name': row['Assigned_Place'], 'status': row['Status'] , 'ip': row['IP']})
    return render_template('home.html', devices=devices)

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
        
        c.execute('''INSERT INTO sensor_readings 
                    (temperature, humidity, light_sensor_value, 
                     battery_voltage, led_relay_state, rain_volume)
                    VALUES (?, ?, ?, ?, ?, ?)''',
                    (data.get('temperature'),
                     data.get('humidity'),
                     data.get('light_sensor_value'),
                     data.get('battery_voltage'),
                     data.get('led_relayState'),
                     data.get('rain_volume')))
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
        
        c.execute(f'''SELECT * FROM sensor_readings 
                     WHERE timestamp > {time_constraint}
                     ORDER BY timestamp DESC''')
        
        rows = c.fetchall()
        conn.close()
        
        data = []
        for row in rows:
            data.append({
                'id': row[0],
                'temperature': row[1],
                'humidity': row[2],
                'light_sensor_value': row[3],
                'battery_voltage': row[4],
                'led_relay_state': row[5],
                'rain_volume': row[6],
                'timestamp': row[7]
            })
        
        return jsonify(data), 200
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/device-click', methods=['POST'])
def device_click():
    try:
        data = request.get_json()
        device_name = data.get('name')
        # Handle the device click information here
        print(f"Device clicked: {device_name}")
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)