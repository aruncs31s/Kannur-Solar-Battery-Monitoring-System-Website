import csv
import os
import sqlite3
from datetime import datetime
debug = 1
# Register the adapter for datetime
sqlite3.register_adapter(datetime, lambda val: val.isoformat())
sqlite3.register_converter(
    "DATETIME", lambda val: datetime.fromisoformat(val.decode("utf-8"))
)


class Database:
    # Creates a database container
    def __init__(self, databse_name):
        self.conn = sqlite3.connect(databse_name, detect_types=sqlite3.PARSE_DECLTYPES, check_same_thread=False)
        self.cursor = self.conn.cursor()
        #  This function should be only called ones
        self.cursor.execute(
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
        self.cursor.execute(
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

    # this function is used to insert a device into the list
    def insert_device(self, ip_address, assigned_place, main_node):
        self.cursor.execute(
            """
            INSERT INTO device_info ( ip_address, assigned_place, main_node)
            VALUES (?, ?, ?)
        """,
            (ip_address, assigned_place, main_node),
        )
        self.conn.commit()

    # this function takes the csv file and adds to the database only if the device is not previously exist
    def upate_device_list(self, csv_file_name):
        with open(csv_file_name, "r") as file:
            reader = csv.reader(file)
            for row in reader:
                print(row)
                if self.device_exists(row[0]):
                    if debug:
                        print(f"ip: {row[0]} is already exists")
                else:
                    self.insert_device(row[0], row[1], row[4])
                    if debug:
                        print(f"ip: {row[0]} , place: {row[1]} , main_node {row[4]}")
                    print(f"Device Name: {row[0]}")

    # helper function for update_device_list
    def device_exists(self, ip_address):
        self.cursor.execute(
            """
        SELECT COUNT(*) FROM device_info WHERE ip_address = ?
        """,
            (ip_address,),
        )
        count = self.cursor.fetchone()[0]
        return count > 0

    # Function to insert timeseries data
    def insert_data(self, device_id, voltage):
        # iam planning to use the ip as the device id .
        timestamp = datetime.now()
        # print(timestamp)
        self.cursor.execute(
            """
        INSERT INTO timeseries_data (device_id, timestamp, voltage)
        VALUES (?, ?, ?)
        """,
            (device_id, timestamp, voltage),
        )

        self.conn.commit()

    # device id ? 1 try using the ip as the device id??
    def get_data(self, device_id, date):
        data = {}
        self.cursor.execute(
            """
        SELECT * FROM timeseries_data WHERE device_id = ? AND timestamp >= date(?)
        """,
            (device_id, date),
        )
        rows = self.cursor.fetchall()
        return rows
    def get_latest_data(self,device_id):
        self.cursor.execute('''
        SELECT * FROM timeseries_data WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1
        ''', (device_id,))
        row = self.cursor.fetchone()
        return row
