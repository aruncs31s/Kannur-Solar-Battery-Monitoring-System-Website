import sqlite3


class Database:
    def __init__(self):
        self.connection = sqlite3.connect("sensor_data.db")
        self.cursor = self.connection.cursor()
        self.create_table()
        print("hello")

    def create_table(self):
        self.cursor.execute(
            """CREATE TABLE IF NOT EXISTS data (
                                id INTEGER PRIMARY KEY  AUTOINCREMENT,
                                battery_voltage REAL,
                                name TEXT NOT NULL,
                                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)"""
        )
        self.connection.commit()

    def add_data(self, name, value):
        self.cursor.execute(
            "INSERT INTO data (name, value) VALUES (?, ?)", (name, value)
        )
        self.connection.commit()

    def query_data(self):
        self.cursor.execute("SELECT * FROM data")
        return self.cursor.fetchall()

    def close(self):
        self.connection.close()


# Example usage:
# db = Database('solar_battery_monitoring.db')
# db.add_data('Battery1', 12.5)
# data = db.query_data()
# print(data)
# db.close()
