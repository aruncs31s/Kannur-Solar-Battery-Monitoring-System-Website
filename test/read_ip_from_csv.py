import csv
with open('devices.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['Assigned_Place'] == 'Parassini_Kadavu':
            print(row['IP'])


