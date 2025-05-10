"""
Author: Arun CS
Repo: https://github.com/aruncs31s/Kannur-Solar-Battery-Monitoring-System-Website
main_repo: https://github.com/aruncs31s/Kannur-Solar-Battery-Monitoring-System
"""

import csv

# Imports
import json
import sqlite3
import time
from datetime import datetime, timedelta

import requests
from flask import Flask, jsonify, render_template, request

from database import Database
from esp import ESP_DEVICES
from scraper import get_esp_data

# read the configuration file
config_file = "config.json"
try:
    with open(config_file) as f:
        config = json.load(f)
except FileNotFoundError:
    print("Configuration file not found.")
    config_file = "src/config.json"
    with open(config_file) as f:
        config = json.load(f)

test = True
debug = config.get("debug", 1)
CSV_FILE = config["csv"]["file"]
DB_FILE = config["database"]["file"]
ESP8266_PORT = str(config["esp"]["port"])
ESP8266_IP = config["esp"]["test_ip"]


app = Flask(__name__)


# get details and ip of the esp devices
esp_devices = ESP_DEVICES(CSV_FILE)
esp_ips = esp_devices.get_esp_ip()

CSV_IP_INDEX = 0
CSV_PLACE_INDEX = 1
CSV_STATUS_INDEX = 2
CSV_MAIN_NODE_INDEX = 3
CSV_NEARBY_NODES_INDEX = 4
VOLT_INDEX = 3
TIME_INDEX = 2
BAT_INDEX = 3


# timestamp format for highcharts
highcharts_timestamp_format = config["highcharts"]["timestamp_format"]


db = Database(DB_FILE, esp_ips)


@app.route("/")
def home():
    # Example format
    """
    {
        "assigned_place": row["Assigned_Place"],
        "status": row["Status"],
        "ip": row["IP"],
    }
    """

    devices_details = esp_devices.get_esp_details()
    devices = []
    for row in devices_details:
        device_ip = row["ip"]

        latest_data = db.get_latest_data(device_ip)
        if latest_data: 
            voltage = latest_data[VOLT_INDEX]
        else:
            print(f"Latest data for {device_ip} not found.")
            voltage = None
        print("Voltage: ", voltage)
        """
        eg {'assigned_place': 'Parassini_Kadavu',
            'status': 'Active',
            'ip': '192.168.1.2'}
        """
        device_details_json = {
            "assigned_place": row["assigned_place"],
            "status": row["status"],
            "ip": row["ip"],
            "voltage": voltage,
        }
        devices.append(device_details_json)
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


@app.errorhandler(404)
def not_found_error(error):
    return render_template("404.html"), 404


@app.route("/about/")
def about():
    return render_template("about.html")


@app.route("/readings/")
def readings():
    return render_template("devices.html")


@app.route("/contacts")
def contacts():
    return render_template("devices.html")


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
    # total_devices = []
    # nearby_devices = []
    # devices_under_main_node = []
    # main_node = ""
    # with open("devices.csv", newline="") as csvfile:
    #     reader = csv.DictReader(csvfile)
    #     for row in reader:
    #         if row["Assigned_Place"] == device_name:
    #             main_node = row["Main_Node"]
    #             break
    # with open("devices.csv", newline="") as csvfile:
    #     reader = csv.DictReader(csvfile)
    #     for row in reader:
    #         if row["Nearby_Nodes"] == device_name:
    #             nearby_devices.append(
    #                 {
    #                     "assigned_place": row["Assigned_Place"],
    #                     "status": row["Status"],
    #                     "ip": row["IP"],
    #                     "main_node": row["Main_Node"],
    #                     "nearby_nodes": row["Nearby_Nodes"],
    #                 }
    #             )
    # with open("devices.csv", newline="") as csvfile:
    #     reader = csv.DictReader(csvfile)
    #     for row in reader:
    #         if row["Main_Node"] == main_node:
    #             devices_under_main_node.append(
    #                 {
    #                     "assigned_place": row["Assigned_Place"],
    #                     "status": row["Status"],
    #                     "ip": row["IP"],
    #                     "main_node": row["Main_Node"],
    #                     "nearby_nodes": row["Nearby_Nodes"],
    #                 }
    #             )

    # total_devices = nearby_devices + devices_under_main_node
    # current_device = []
    # # Check if this is absolutely necessary
    # with open("devices.csv", newline="") as csvfile:
    #     reader = csv.DictReader(csvfile)
    #     for row in reader:
    #         if row["Assigned_Place"] == theDevice:
    #             current_device.append(
    #                 {
    #                     "assigned_place": row["Assigned_Place"],
    #                     "status": row["Status"],
    #                     "ip": row["IP"],
    #                     "main_node": row["Main_Node"],
    #                     "nearby_nodes": row["Nearby_Nodes"],
    #                 }
    #             )
    return render_template(
        "selected_device.html",
        # nearby_devices=nearby_devices,
        # devices_under_main_node=devices_under_main_node,
        device_name=device_name,
        # total_devices=total_devices,
        # current_device=current_device,
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


@app.route("/api/data/old", methods=["GET"])
def get_old_data():
    if test:
        db.update_random_data()
    current_node, day = (request.args.get("device_id"), request.args.get("day"))
    if day is None:
        return jsonify({"status": "error", "message": "Day is required"}), 400
    if current_node is None:
        return jsonify({"status": "error", "message": "Device ID is required"}), 400
    if debug:
        print(f"current_node: {current_node}, day: {day}")
    current_node_ip = esp_devices.get_ip_of_the_node(current_node)
    if current_node_ip is None:
        return jsonify({"status": "error", "message": "Device not found"}), 404
    the_date = (datetime.now() - timedelta(days=int(day))).strftime("%Y-%m-%d")
    # raw_data = db.get_data(current_node_ip,date=the_date)
    raw_data = db.get_10_min_interval_data(device_id=current_node_ip, date=the_date)
    if debug:
        print("Raw Data length: ", len(raw_data))
    data = [
        {
            "timestamp": row[TIME_INDEX].strftime(highcharts_timestamp_format),
            "battery_voltage": row[BAT_INDEX],
        }
        for row in raw_data
    ]
    # print(data)
    return jsonify(data), 200


# TODO: Check if this works and only use the previous method only when the page fist loads
@app.route("/api/data/live", methods=["GET"])
def get_live_data():
    current_node = request.args.get("device_id")
    current_node_ip = esp_devices.get_ip_of_the_node(current_node)
    live_data = get_esp_data(current_node_ip)
    data = [
        {
            "timestamp": datetime.today().strftime(highcharts_timestamp_format),
            "battery_voltage": live_data["battery_voltage"],
        }
    ]
    return jsonify(data), 200


@app.route("/api/data", methods=["GET"])
def get_data():
    if debug:
        print("date_requested to /api/data (GET)")
    db.update_random_data()
    # Get the current node from the request
    current_node = request.args.get("device_id")
    # check if the current node is provided in the request
    if current_node is None:
        return jsonify({"status": "error", "message": "Device ID is required"}), 400
    if debug:
        print("Current node is ", current_node)
    # Get the IP address of the current node
    current_node_ip = esp_devices.get_ip_of_the_node(current_node)
    if current_node_ip is None:
        return jsonify({"status": "error", "message": "Device not found"}), 404
    if debug:
        print("Current node ip is ", current_node_ip)
    # get the current date format = 2025-05-05
    date_now = datetime.today().date()
    raw_data = db.get_data(current_node_ip, date=date_now)
    if debug:
        print("Raw Data length: ", len(raw_data))
    data = [
        {
            "timestamp": row[TIME_INDEX].strftime(highcharts_timestamp_format),
            "battery_voltage": row[BAT_INDEX],
        }
        for row in raw_data
    ]
    # print(data)
    return jsonify(data), 200


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
    try:
        update_device_list = db.update_device_list(CSV_FILE)
        if debug:
            print("Device list updated successfully.")
        app.run(host="0.0.0.0", port=5000, debug=True)
    except KeyboardInterrupt:
        db.close()
        print("Server stopped by user.")
    except Exception as e:
        print(f"An error occurred: {e}")
        print("Server Restarting in 10 seconds...")
        time.sleep(10)
        app.run(host="0.0.0", port=5000, debug=True)
    finally:
        print("Server stopped.")
        db.close()
        print("Database connection closed.")
