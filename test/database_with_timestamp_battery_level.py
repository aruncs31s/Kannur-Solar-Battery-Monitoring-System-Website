import os
import sqlite3
from datetime import datetime

# Create a connection to the SQLite3 database
conn = sqlite3.connect(os.getcwd() + "/battery_level.db")
cursor = conn.cursor()

cursor.execute(
    """CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY,
    device TEXT NOT NULL,
    battery_level INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)"""
)


def insert_user(device, battery_level):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """INSERT INTO readings (device, battery_level, timestamp) VALUES (?, ?, ?)""",
        (device, battery_level, timestamp),
    )
    print(f"Inserted user {device} with age {battery_level} at {timestamp}")
    conn.commit()


insert_user("Alice", 30)
insert_user("Bob", 25)
insert_user("Charlie", 35)



def get_users():
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute(
        """SELECT * FROM readings WHERE DATE(timestamp) = ? ORDER BY timestamp ASC""",
        (today,),
    )
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Age: {row[2]}, Timestamp: {row[3]}")


# Retrieve and print the data
get_users()

# Close the connection
conn.close()
