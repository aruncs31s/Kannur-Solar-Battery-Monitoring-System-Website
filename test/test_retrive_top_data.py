import time
from datetime import datetime

from database import Database

# TODO: remove all magic numbers and define them like time_index,bat_index etc at the top of the file , bcz if there is a change in the data arrangement it would mess up the pg.
db = Database("battery_radings.db")
ip = "192.168.1.2"
data = []
rows = db.get_data(ip, datetime.now().date())
# for i in range(len(rows)):
#     # source : https://www.restack.io/p/datetime-manipulation-techniques-knowledge-datetime-format-without-milliseconds
#     print(
#         f" time: {rows[i][2].time().strftime('%H:%M:%S')}  battery_radings: {rows[i][3]} "
#     )
#     time.sleep(1)
#
print(rows)
COLUMN_INDEX = 3
for column in rows:
    print(column[COLUMN_INDEX])
