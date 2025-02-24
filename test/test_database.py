from database import Database

'''
1. Define from where the device details should get
2. Create a Database object 
3. Call the update_device_list method
'''


csvFile = 'devices.csv'
db = Database('battery_radings.db')
db.upate_device_list(csvFile)

