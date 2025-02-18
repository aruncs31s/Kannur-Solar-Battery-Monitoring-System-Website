import sqlite3 
import os 
from datetime import datetime

# Create a connection to the SQLite3 database
conn = sqlite3.connect(os.getcwd() +  '/test/example.db')
cursor = conn.cursor()

# Create a table with the timestamp column if it doesn't exist
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)''')

def insert_user(name, age):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''INSERT INTO users (name, age, timestamp) VALUES (?, ?, ?)''', (name, age, timestamp))
    print(f"Inserted user {name} with age {age} at {timestamp}")
    conn.commit()

insert_user('Alice', 30)
insert_user('Bob', 25)
insert_user('Charlie', 35)

def get_users():
    today = datetime.now().strftime('%Y-%m-%d')
    cursor.execute('''SELECT * FROM users WHERE DATE(timestamp) = ? ORDER BY timestamp ASC''', (today,))
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Age: {row[2]}, Timestamp: {row[3]}")

# Retrieve and print the data
get_users()

# Close the connection
conn.close()