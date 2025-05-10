import csv
import time

from database import Database

db_file = "../../the_database.db"
csv_file_name = "../../test/devices.csv"
db = Database(db_file)

# with open(csv_file_name, "r") as file:
# reader = csv.reader(file)
# for row in reader:
# print(row)
# db.insert_device(row[0], row[1], row[2])
db.update_device_list(csv_file_name)

while True:
    db.update_random_data()
    time.sleep(2)
