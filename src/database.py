import csv
import os
import sqlite3
from datetime import datetime
import random
debug = 1
CSV_IP_INDEX = 0
CSV_PLACE_INDEX = 1
CSV_STATUS_INDEX = 2
CSV_MAIN_NODE_INDEX = 3
CSV_NEARBY_NODES_INDEX = 4

# Register the adapter for datetime
sqlite3.register_adapter(datetime, lambda val: val.isoformat())
sqlite3.register_converter(
    "DATETIME", lambda val: datetime.fromisoformat(val.decode("utf-8"))
)


class Database:
    # Creates a database container
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file, detect_types=sqlite3.PARSE_DECLTYPES, check_same_thread=False)
        self.ip_list = []
        #  This function should be only called ones
        self.create_tables()
    def create_tables(self):
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                """
                            CREATE TABLE IF NOT EXISTS device_info (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                ip_address TEXT NOT NULL,
                                assigned_place TEXT NOT NULL,
                                main_node TEXT NOT NULL,
                                created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            )
                            """
            )
            # Create the timeseries_data table
            cursor.execute(
                """
                        CREATE TABLE IF NOT EXISTS timeseries_data (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            device_id TEXT NOT NULL,
                            timestamp DATETIME NOT NULL,
                            voltage REAL NOT NULL,
                            FOREIGN KEY (device_id) REFERENCES device_info (ip_address)
                        )
                        """
            )
            self.conn.commit()
        finally:
            cursor.close()
    # this function is used to insert a device into the list
    def insert_device(self, ip_address, assigned_place, main_node):
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO device_info ( ip_address, assigned_place, main_node)
                VALUES (?, ?, ?)
            """,
                (ip_address, assigned_place, main_node),
            )
            self.conn.commit()
        finally:
            cursor.close()

    # this function takes the csv file and adds to the database only if the device is not previously exist
    def update_device_list(self, csv_file_name):
        with open(csv_file_name, "r") as file:
            reader = csv.reader(file)
            for row in reader:
                print(row)
                if self.device_exists(row[CSV_IP_INDEX]):
                    if debug:
                        print(f"ip: {row[CSV_IP_INDEX]} is already exists")
                else:
                    self.ip_list.append(row[CSV_IP_INDEX])
                    self.insert_device(row[CSV_IP_INDEX], row[CSV_PLACE_INDEX], row[CSV_MAIN_NODE_INDEX])
                    if debug:
                        print(f"ip: {row[CSV_IP_INDEX]} , place: {row[CSV_PLACE_INDEX]} , main_node {row[CSV_MAIN_NODE_INDEX]}")
                    print(f"Device Name: {row[CSV_IP_INDEX]}")
        self.conn.commit()
    
    # helper function for update_device_list
    def device_exists(self, ip_address):
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                """
            SELECT COUNT(*) FROM device_info 
            WHERE ip_address = ?
            """,
                (ip_address,),
            )
            count = cursor.fetchone()[0]
        finally:
            cursor.close()
        return count > 0
        

    # Function to insert timeseries data
    def insert_data(self, device_id, voltage):
        # iam planning to use the ip as the device id .
        timestamp = datetime.now()
        cursor = self.conn.cursor()
        try:
            self.cursor.execute("""
                INSERT INTO timeseries_data (device_id, timestamp, voltage)
                VALUES (?, ?, ?)
            """,
            (device_id, timestamp, voltage),
            )
            self.conn.commit()
        finally:
            cursor.close()

        

    # device id ? 1 try using the ip as the device id??
    def get_data(self, device_id, date):
        _data = {}
        cursor = self.conn.cursor()
        try: 
            cursor.execute(
                """
                SELECT * FROM timeseries_data 
                WHERE device_id = ? AND timestamp >= date(?) ORDER BY timestamp DESC
                LIMIT 1000 
                """,
                (device_id, date),
            )
            _data = cursor.fetchall()
        finally:
            cursor.close()
        return _data
    
    def get_latest_data(self,device_id):
        cursor = self.conn.cursor()
        try:
            cursor.execute('''
                SELECT * FROM timeseries_data
                WHERE device_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 1
                ''', (device_id,))
            row = cursor.fetchone()
            return row
        finally:
            cursor.close()
    def update_random_data(self):
        print("Updating random data")
        for ip in self.ip_list:
            print(f"Updating random data for {ip}")
            round_random_voltage = round(random.uniform(8.7, 12), 2)
            self.insert_data(ip ,round_random_voltage)
        self.conn.commit()

    def get_10_min_interval_data(self, device_id, date):
        _data = {}
        cursor = self.conn.cursor()
        # Select data points where the minute is '00' or '30'
        # Order by the most recent timestamp and limit to 24 results
        try:
            cursor.execute(
                """
                SELECT * FROM timeseries_data 
                WHERE device_id = ? 
                AND timestamp >= date(?) 
                AND strftime('%M', timestamp) IN ('00', '10','20','30','40','50') 
                ORDER BY timestamp DESC
                LIMIT 144
                """,
                (device_id, date),
            )
            _data = cursor.fetchall()
        finally:
            cursor.close()
        return _data
    
    def close(self):
        if self.conn:
            self.conn.close()
            self.conn = None
            print("Database connection closed by Database.close()") # Optional confirmation message
