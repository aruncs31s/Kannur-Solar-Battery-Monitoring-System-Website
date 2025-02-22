import sqlite3
import matplotlib.pyplot as plt

conn = sqlite3.connect('example.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL
)
''')
cursor.execute('''
CREATE TABLE IF NOT EXISTS battery_readings (
    id INTEGER PRIMARY KEY,
    voltage REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Insert data
cursor.execute('''
INSERT INTO users (name, age) VALUES
('Alice', 30),
('Bob', 25),
('Charlie', 35)
''')
cursor.execute('''
INSERT INTO battery_readings (voltage) VALUES
(3.7),
(3.8),
(3.9),
(4.0),
(4.1)
''')
conn.commit()

# Fetch and print user data
cursor.execute('SELECT * FROM users')
rows = cursor.fetchall()
for row in rows:
    print(row)

# Fetch battery readings
cursor.execute('SELECT voltage, timestamp FROM battery_readings')
data = cursor.fetchall()
conn.close()

# Extract data for plotting
voltages = [row[0] for row in data]
timestamps = [row[1] for row in data]

# Plot the data
plt.figure()
plt.plot(timestamps, voltages, marker='o')
plt.xlabel('Timestamp')
plt.ylabel('Voltage (V)')
plt.title('Battery Voltage Readings')
plt.grid(True)

# Save the plot as an image file
plt.savefig('/path/to/your/project/static/voltage_plot.png')
plt.close()