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


def get_esp_data(esp_url):
    try:
        # the endpoint must be /data otherwise the link will return the server page instead of the json data
        http_esp_url = "http://" + esp_url + "/data"
        esp_response = requests.get(esp_url)
        data_json = esp_response.json()
        # TODO: Make it as object with {} ✅ 
        data = {
            "battery_voltage": data_json["battery_voltage"],
            "led_relayState": data_json["led_relayState"],
        }
        return data
    except Exception as e:
        print(f"An error occurred: {e}")
        _retry_count = 5

        # check if the loop will exit if the return is executed. 
        for i in range(_retry_count + 1 ):
            get_esp_data(esp_url)
            time.sleep(1)

if __name__ == "__main__":
    # for test
    esp_url = "http://192.168.58.43/data"
    print(get_esp_data())