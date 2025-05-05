import csv

class ESP_DEVICES:
        def __init__(self,csvfile):
                self.csvfile = csvfile
                self.device_list = []
                self.all_details = []
                try: 
                    with open(self.csvfile, newline="") as csvFile:
                        reader = csv.DictReader(csvFile)
                        for row in reader:
                            self.device_list.append(row["IP"])
                            self.all_details.append( { 
                                "assigned_place": row["Assigned_Place"],
                                "status": row["Status"],
                                "ip": row["IP"],    
                            })
                            # print(row["IP"])
                except Exception as e :
                      print("Error occured in Esp.py" , e)
        def get_esp_ip(self):
            return self.device_list
        def get_esp_details(self):
             return self.all_details
        def get_ip_of_the_node(self,current_node):
            for device in self.all_details:
                if device["assigned_place"] == current_node:
                    return device["ip"]
                
            return None
if __name__ == "__main__":
    esp_devices = ESP_DEVICES("devices.csv")
    # print(esp_devices.get_esp_ip())
    print(esp_devices.get_esp_details())
