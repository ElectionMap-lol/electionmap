
# This creates polling averages for use in the model

import csv
from datetime import datetime

date_format = "%m/%d/%Y"

class electionPollingAverage:
    def __init__(self, state, race, DPer, RPer, OPer, margin, totalWeight):
        self.state = state
        self.race = race
        self.DPer = DPer
        self.RPer = RPer
        self.OPer = OPer
        self.margin = margin
        self.totalWeight = totalWeight
    def to_dict(self):
        return {
            "state": self.state,
            "race": self.race,
            "DPer": self.DPer,
            "RPer": self.RPer,
            "OPer": self.OPer,
            "margin": self.margin,
            "totalWeight": self.totalWeight
        }    
# Define a class that will represent each row as an object
class csvObjects:
    def __init__(self, **kwargs):
        # The **kwargs allows passing any number of keyword arguments (columns)
        for key, value in kwargs.items():
            setattr(self, key, value)

# Function to read CSV and convert each row into an object
def csv_to_objects(filename):
    electionsArray = []
    
    # Open and read the CSV file
    with open(filename, mode='r', newline='', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)  # Automatically uses the first row as headers
        
        # Create an election object for each row
        for row in reader:
            electionObj = csvObjects(**row)  # Convert row dictionary to object
            electionsArray.append(electionObj)  # Add object to list
    
    return electionsArray

# loop through pollsters in polling data and make sure they have a rating in pollsterRatings
def check_if_pollsters_have_ratings(pollingdata, pollsterRatings):
    print ("Checking if all Pollsters are accounted for...")
    missingPollsters = []
    for p in pollingData:
        valueToCheck = p.pollster
        exists = any(pollster.pollster == valueToCheck for pollster in pollsterRatings)
        if exists == False and valueToCheck not in missingPollsters:
            missingPollsters.append(str(valueToCheck))

    print ("Missing the Following Pollster Ratings:")
    for missing in missingPollsters:
        print(missing)

# Lookup up pollster in the pollster Ratings object
def lookupPollster(pollster,pollsterRatings):
    for p in pollsterRatings:
        if (p.pollster == pollster):
            return p.rating
    print ("Pollster " + pollster + " not found")

# lookup polls to include in an average for specified date (ie it will not include polls after a date)
def pollsToInclude(pollingdata, state, race, date):
    pollsToAverage = []
    # For each race, check the pollsters we are including and ensure only the most recent is included
    for poll in pollingData:
        if poll.state == state and poll.race == race and datetime.strptime(poll.date, date_format) <= date:
            # check if poll has a newer one in it already
            foundDuplicate = False
            for currentPoll in pollsToAverage:                  
                # Checks if pollster being added to array already exists in array
                # If they both exist, compare the dates and returns the most recent
                if poll.pollster == currentPoll.pollster:
                    foundDuplicate = True
                    # Convert strings to datetime objects
                    newPollDate = datetime.strptime(poll.date, date_format)
                    oldPollDate = datetime.strptime(currentPoll.date, date_format)      
                    # Compare them using standard comparison operators
                    if newPollDate < oldPollDate:
                        break
                    elif newPollDate > oldPollDate:
                        pollsToAverage.remove(currentPoll)
                        pollsToAverage.append(poll)
            if (foundDuplicate == False):
                pollsToAverage.append(poll)
    return pollsToAverage

def polling_averages(pollingData,pollsterRatings):
    pollingAverages = []
    # Figure out the number of unique races we need to create averages for
    # Seen combinations is the array of races we are going to create averages for
    seen_combinations = set()
    for poll in pollingData:
        # Create a composite key of the two attributes
        combination = (poll.state, poll.race)  
        if combination not in seen_combinations:
            seen_combinations.add(combination)

    # for each unique race found, create the average
    for race in seen_combinations:
        pollsToAverage = pollsToInclude(pollingData, race[0], race[1], datetime.today())
        # Here we have all the polls to average for a race now, now we need to weight them and average
        Dsum = 0
        Rsum = 0
        Osum = 0
        count = 0
        for poll in pollsToAverage:
            # Need to multiply the sum by a pollsters weight, and then add that weight to the count
            weight = float(lookupPollster(poll.pollster, pollsterRatings))
            # Manipulate the weight based on dates
            pollAge = (datetime.today() - datetime.strptime(poll.date, date_format)).days
            if pollAge < 8:
                weight = weight
            elif pollAge > 40:
                weight = 0
            else:
                #linear decay function to make older polls weigh less
                weight = weight * (1 - (.03 * (pollAge - 7)))
            Dsum = Dsum + float(poll.DPer) * weight
            Rsum = Rsum + float(poll.RPer) * weight
            Osum = Osum + float(poll.OPer) * weight
            count += weight
            
            #DEBUG
            if poll.state == "IA":
                print (poll.state + " " + str(poll.race) + " " + poll.date + " " + poll.pollster + " " + poll.DPer + " " + poll.RPer)
                print (weight)

        if (count > 0):
            DperAvg = Dsum / count
            RperAvg = Rsum / count
            OperAvg = Osum / count
            margin = DperAvg - RperAvg

            # Now we append this data to an object and add to a csv with the date
            averageForRace = electionPollingAverage(race[0], str(race[1]), DperAvg, RperAvg, OperAvg, margin, count)
            pollingAverages.append(averageForRace)

        else:
            # if count is 0 we want to just grab the 3 most recent and average
            print ("")
            pollsToAverage = pollsToInclude(pollingData, race[0], race[1], datetime.today())
            # Here we have all the polls to average for a race now, now we need to weight them and average
            Dsum = 0
            Rsum = 0
            Osum = 0
            count = 0
            for poll in pollsToAverage:
                weight = float(lookupPollster(poll.pollster, pollsterRatings))
                Dsum = Dsum + float(poll.DPer) * weight
                Rsum = Rsum + float(poll.RPer) * weight
                Osum = Osum + float(poll.OPer) * weight
                count += weight
            
            DperAvg = Dsum / count
            RperAvg = Rsum / count
            OperAvg = Osum / count
            margin = DperAvg - RperAvg

            # Now we append this data to an object and add to a csv with the date
            # A weight of -1 indicates these are older polls
            averageForRace = electionPollingAverage(race[0], str(race[1]), DperAvg, RperAvg, OperAvg, margin, -1)
            pollingAverages.append(averageForRace)
            pollingAveragesCSV = "./BETA/ModelData/pollingAverages.csv"
    fields = ["state", "race", "DPer", "RPer", "OPer", "margin", "totalWeight"]
    with open(pollingAveragesCSV, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        # Write the header row
        writer.writeheader()
        # Convert each object to a dict and write it to the CSV
        for pa in pollingAverages:
            writer.writerow(pa.to_dict())


pollingData = "./BETA/ModelData/pollingData.csv"
pollsterRatings = "./BETA/ModelData/pollsterRatings.csv"

pollingData = csv_to_objects(pollingData)
pollsterRatings = csv_to_objects(pollsterRatings)

check_if_pollsters_have_ratings(pollingData,pollsterRatings)

polling_averages(pollingData,pollsterRatings)