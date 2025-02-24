# Source
# https://github.com/aruncs31s/Solar-Battery-Meter-Scraper/blob/master/src/scraper.py
# Date : 23-2-2025

#!/bin/env python3
"""
- Author : Arun CS
- Date : 2024-10-03
- for v0.0.2
"""
import os
import time
from datetime import datetime

import requests

# Get time and date
# For Sorting
date = datetime.now().strftime("%Y-%m-%d")

time_now = datetime.now().strftime("%H:%M:%S")

current_date = datetime.now().strftime("%Y-%m-%d")

# esp32/esp8266 web server link
# esp_url = "http://192.168.246.50/data"
# This ip will keep changeing 
esp_url = "http://192.168.58.43/data"


def get_esp_data():
    try:
        esp_response = requests.get(esp_url)
        data_json = esp_response.json()
        # TODO: Make it as object with {}
        data = [
            
            # data_json["temperature"],
            # data_json["humidity"],
            data_json["battery_voltage"],
            # data_json["light_sensor_value"],
            data_json["led_relayState"],
            # data_json["rain_volume"],
        ]
        return data
    except Exception as e:
        print(f"An error occurred: {e}")
        time.sleep(5)
        get_esp_data()


# def measure(date):
#     output_file = f"readings/normal/{date}_log.txt"
#     output_file_csv = f"readings/csv/{date}_log.csv"
#     while True:
#         try:
#             timestamp = datetime.now().strftime("%H:%M:%S")
#             data = get_esp_data()
#             if data is None:
#                 print("Data is None")
#                 time.sleep(1)
#                 continue
#             # Find if this is necceary
#             time_now = datetime.now().strftime("%H:%M:%S")
#             timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#             print(f"{time_now} Battery Voltage {data[0]} - Relay State {data[1]} \n")
#             # if int(datetime.now().strftime("%M")) % 5 == 0:
#             # Save to file
#             is_file_exists = os.path.isfile(output_file)
#             with open(output_file, "a") as f:
#                 # Check if the file exists
#                 if not is_file_exists:
#                     f.write("Time , Battery Voltage ,  Relay State \n")
#                 f.write(
#                     f"{timestamp} Battery Voltage  {data[0]} Relay State {data[1]} \n"
#                 )
#             is_file_exists = os.path.isfile(output_file_csv)
#             with open(output_file_csv, "a") as f:
#                 # Check if the file exists
#                 if not is_file_exists:
#                     f.write("Time ,Battery Voltage ,Relay Status \n")
#                 f.write(f"{time_now},{data[0]},{data[1]}\n")
#             time.sleep(1)
#         except Exception as e:
#             print(f"An error occurred: {e}")
#         new_date = datetime.now().strftime("%Y-%m-%d")
#         if new_date != date:
#             measure(new_date)


# while True:
#     try:
#         measure(date)
#     except Exception as e:
#         print(f"An error occurred in the main loop: {e}")
#         time.sleep(10)
        # measure(date)

if __name__ == "__main__":
    print(get_esp_data())
    # measure(date)