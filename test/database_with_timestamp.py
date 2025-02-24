import os
import sqlite3
from datetime import datetime

# Create a connection to the SQLite3 database
conn = sqlite3.connect(os.getcwd() + "example.db")
cursor = conn.cursor()

# Create a table with the timestamp column if it doesn't exist
cursor.execute(
    """CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)"""
)


def insert_user(name, age):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """INSERT INTO users (name, age, timestamp) VALUES (?, ?, ?)""",
        (name, age, timestamp),
    )
    print(f"Inserted user {name} with age {age} at {timestamp}")
    conn.commit()


insert_user("Alice", 30)
insert_user("Bob", 25)
insert_user("Charlie", 35)


def get_users():
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute(
        """SELECT * FROM users WHERE DATE(timestamp) = ? ORDER BY timestamp ASC""",
        (today,),
    )
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Age: {row[2]}, Timestamp: {row[3]}")

def upate_device_list():
    with open('./devices.csv', 'r') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header row
        for row in reader:
            ip_address = row[0]
            assigned_place = row[1]
            main_node = row[4]
            if not device_exists(ip_address):
                insert_device(ip_address, assigned_place, main_node)
                print(f"Inserted device with IP address {ip_address}")
            else:
                print(f"Device with IP address {ip_address} already exists")

# Example usage
upate_device_list()
# Retrieve and print the data
get_users()

# Close the connection
conn.close()
