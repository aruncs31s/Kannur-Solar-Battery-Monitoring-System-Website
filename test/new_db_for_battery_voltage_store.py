




# Create the device_info table






# Example usage
# insert_device('Device1', '1912.168.1.1', 'Location1')
# for i in range(10):
#     insert_timeseries_data(1, i)
#     print(i)
# for i in range(10):
#     insert_timeseries_data(2, i)
#     print(i)
# for i in range(10):
#     insert_timeseries_data(3, i)
#     print(i)

# Implement a function that prints every data of id 2 
def get_timeseries_data(device_id):
    cursor.execute('''
    SELECT * FROM timeseries_data WHERE device_id = ?
    ''', (device_id,))
    rows = cursor.fetchall()
    for row in rows:
        print(row[2])
        # print('hi')

def device_exists(ip_address):
    cursor.execute('''
    SELECT COUNT(*) FROM device_info WHERE ip_address = ?
    ''', (ip_address,))
    count = cursor.fetchone()[0]
    return count > 0

upate_device_list()


# Example usage
ip_address = '192.168.1.2'
if device_exists(ip_address):
    print(f"Device with IP address {ip_address} exists in the database.")
else:
    print(f"Device with IP address {ip_address} does not exist in the database.")

# get_timeseries_data(1)
# print(get_timeseries_data(2))
# Close the connection
conn.close()