from database import Database

'''
1. Define from where the device details should get
2. Create a Database object 
3. Call the update_device_list method
after finishing this the database to store the device list is finised , now i have to find a way to map the timeseries data to the device id
'''


# @block 

csvFile = 'devices.csv'
db = Database('battery_radings.db')
db.upate_device_list(csvFile)

