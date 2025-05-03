# app.py
import csv
import sqlite3
from datetime import datetime
import time
from flask import Flask, jsonify, render_template, request
import requests
from database import Database
from scraper import get_esp_data
import random
# db = Database()
app = Flask(__name__)
ESP8266_IP = "192.168.58.43"
ESP8266_PORT = 80
# (601, '192.168.1.2', datetime.datetime(2025, 5, 1, 18, 43, 3, 338307), 99.0)
# id , ip , timetamp , voltage -> 3 index 
VOLT_INDEX = 3 
db = Database("the_database.db")

def update_random_data():
    print("Updating random data")
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            ip = row["IP"]
            round_random_voltage = round(random.uniform(8.7, 12), 2)
            db.insert_data(ip ,round_random_voltage)
@app.route("/")
def home():
    devices = []
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            ip = row["IP"]
            print(row["IP"])
            lates_data = db.get_latest_data(ip)
            voltage = lates_data[VOLT_INDEX]
            print("Voltage: " , voltage)
            '''
            eg {'assigned_place': 'Parassini_Kadavu',
              'status': 'Active',
                'ip': '192.168.1.2'}
            '''
            devices.append(
                {
                    "assigned_place": row["Assigned_Place"],
                    "status": row["Status"],
                    "ip": row["IP"],
                    "voltage": voltage,
                }
            )

    # Sort devices by status
    active_devices = [
        device for device in devices if device["status"].lower() == "active"
    ]
    inactive_devices = [
        device for device in devices if device["status"].lower() == "inactive"
    ]
    sorted_devices = active_devices + inactive_devices
    print(sorted_devices)
    return render_template("home.html", devices=sorted_devices)


@app.route("/about/")
def about():
    return render_template("about.html")


@app.route("/devices")
def devices():
    return render_template("devices.html")


@app.route("/device/get_all_nodes/<device>", methods=["GET"])
def get_all_nodes(device):
    # This is used as a central node
    current_node = device
    main_node = ""
    near_all_nodes = []
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Assigned_Place"] == current_node:
                main_node = row["Main_Node"]
                break
    # print(f"main node is {main_node}")
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Main_Node"] == main_node:
                near_all_nodes.append(row["Assigned_Place"])
    # print(f" near nodes {near_all_nodes}")
    print(jsonify({"current_node": current_node, "near_all_nodes": near_all_nodes}))
    return jsonify(
        {
            "current_node": current_node,
            "near_all_nodes": near_all_nodes,
            "main_node": main_node,
        },
        200,
    )


# this api is to get the nearby nodes of the current device.
# TODO: decide if i want to implement recursive search to find the neighbouring devices.


@app.route("/device/get_near_nodes/<device>", methods=["GET"])
def get_near_nodes(device):

    # NOTE: This is used as a central node and other nodes should wrap around this

    current_node = device
    # Just initializing the main_node as a string
    main_node = ""
    # To store the neighbouring nodes
    near_nodes = []

    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Assigned_Place"] == current_node:
                main_node = row["Main_Node"]
                break
    print(f"main node is {main_node}")
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Nearby_Nodes"] == current_node:
                near_nodes.append(row["Assigned_Place"])
    print(f" near nodes {near_nodes}")
    print(jsonify({"current_node": current_node, "near_nodes": near_nodes}))
    return jsonify({"current_node": current_node, "near_nodes": near_nodes})


@app.route("/device/<theDevice>", methods=["GET"])
def devices_page(theDevice):
    device_name = theDevice
    total_devices = []
    nearby_devices = []
    devices_under_main_node = []
    main_node = ""
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Assigned_Place"] == device_name:
                main_node = row["Main_Node"]
                break
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Nearby_Nodes"] == device_name:
                nearby_devices.append(
                    {
                        "assigned_place": row["Assigned_Place"],
                        "status": row["Status"],
                        "ip": row["IP"],
                        "main_node": row["Main_Node"],
                        "nearby_nodes": row["Nearby_Nodes"],
                    }
                )
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Main_Node"] == main_node:
                devices_under_main_node.append(
                    {
                        "assigned_place": row["Assigned_Place"],
                        "status": row["Status"],
                        "ip": row["IP"],
                        "main_node": row["Main_Node"],
                        "nearby_nodes": row["Nearby_Nodes"],
                    }
                )

    total_devices = nearby_devices + devices_under_main_node
    current_device = []
    # Check if this is absolutely necessary
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row["Assigned_Place"] == theDevice:
                current_device.append(
                    {
                        "assigned_place": row["Assigned_Place"],
                        "status": row["Status"],
                        "ip": row["IP"],
                        "main_node": row["Main_Node"],
                        "nearby_nodes": row["Nearby_Nodes"],
                    }
                )
    return render_template(
        "selected_device.html",
        nearby_devices=nearby_devices,
        devices_under_main_node=devices_under_main_node,
        device_name=device_name,
        total_devices=total_devices,
        current_device=current_device,
    )


@app.route("/api/control", methods=["POST"])
def control_esp():
    try:
        data = request.get_json()
        state = data.get("state", False)
        esp_url = f"http://{ESP8266_IP}:{ESP8266_PORT}/data"
        response = requests.post(esp_url, json={"state": state}, timeout=5)
        if response.status_code == 200:
            return jsonify({"status": "success", "state": state}), 200
        else:
            return (
                jsonify(
                    {"status": "error", "message": "Failed to communicate with ESP8266"}
                ),
                500,
            )
    except requests.exceptions.RequestException as e:
        return (
            jsonify({"status": "error", "message": f"Connection error: {str(e)}"}),
            500,
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/data", methods=["POST"])
def receive_data():
    try:
        data = get_esp_data()
        print(data)
        conn = sqlite3.connect("sensor_data.db")
        c = conn.cursor()
        c.execute(
            """INSERT INTO sensor_readings (battery_voltage) VALUES (?)""",
            (data.get("battery_voltage"),),
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def send_top_data():
    i = '192.168.1.2'
    data = db.get_data(i, '2025-02-26')

@app.route("/api/data", methods=["GET"])
def get_data():
    update_random_data()
    print('date_requested to /api/data')
    TIME_INDEX = 2
    BAT_INDEX = 3
    ip = '192.168.1.3'
    # raw_data = db.get_data(ip, date=datetime.datetime.now().strftime("%Y-%m-%d"))
    raw_data = db.get_data(ip,date=datetime.today().date()) 
    print("Raw Data length: " , len(raw_data))
    data = [
        {
            'timestamp': row[TIME_INDEX].strftime("%Y-%m-%d %H:%M:%S"),
            'battery_voltage': row[BAT_INDEX]
        }
        for row in raw_data
    ]
    # print(data)
    return jsonify(data), 200


# def get_data():
#     try:
#         timeframe = request.args.get('timeframe', 'hour')
#         conn = sqlite3.connect('sensor_data.db')
#         c = conn.cursor()
#         if timeframe == 'hour':
#             time_constraint = "datetime('now', '-1 hour')"
#         elif timeframe == 'day':
# time_constraint = "datetime('appnow', '-1 day')"
#         elif timeframe == 'week':
#             time_constraint = "datetime('now', '-7 days')"
#         else:
#             time_constraint = "datetime('now', '-1 hour')"
#         c.execute(f'''SELECT * FROM sensor_readings WHERE timestamp > {time_constraint} ORDER BY timestamp DESC''')
#         rows = c.fetchall()
#         conn.close()

#         data = [{'id': row[0], 'battery_voltage': row[1], 'timestamp': row[2]} for row in rows]
#         return jsonify(data), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/device-click", methods=["POST"])
def device_click():
    try:
        data = request.get_json()
        device_name = data.get("name")
        return jsonify({"status": "success", "device": device_name}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/devices", methods=["GET"])
def get_devices():
    devices = []
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            devices.append(
                {
                    "assigned_place": row["Assigned_Place"],
                    "status": row["Status"],
                    "ip": row["IP"],
                }
            )
    return jsonify(devices), 200


@app.route("/api/measurements", methods=["POST"])
def receive_measurements():
    try:
        data = request.get_json()
        device_id = data.get("device_id")
        measurements = data.get("measurements")
        conn = sqlite3.connect("sensor_data.db")
        c = conn.cursor()
        for measurement in measurements:
            c.execute(
                """INSERT INTO measurements (device_id, parameter1, parameter2, parameter3) VALUES (?, ?, ?, ?)""",
                (
                    device_id,
                    measurement["parameter1"],
                    measurement["parameter2"],
                    measurement["parameter3"],
                ),
            )
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/measurements/<int:device_id>", methods=["GET"])
def get_measurements(device_id):
    try:
        conn = sqlite3.connect("sensor_data.db")
        c = conn.cursor()
        c.execute(
            """SELECT parameter1, parameter2, parameter3, timestamp FROM measurements WHERE device_id = ? ORDER BY timestamp DESC""",
            (device_id,),
        )
        rows = c.fetchall()
        conn.close()
        measurements = [
            {
                "parameter1": row[0],
                "parameter2": row[1],
                "parameter3": row[2],
                "timestamp": row[3],
            }
            for row in rows
        ]
        return jsonify(measurements), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/device/<device_name>", methods=["GET"])
def device_page(device_name):
    # Fetch device-specific data if needed
    return render_template("device.html", device_name=device_name)


@app.route("/api/search", methods=["GET"])
def search_devices():
    query = request.args.get("query", "").lower()
    devices = []
    with open("devices.csv", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if query in row["Assigned_Place"].lower():
                devices.append(
                    {
                        "assigned_place": row["Assigned_Place"],
                        "status": row["Status"],
                        "ip": row["IP"],
                    }
                )
    return jsonify(devices), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
