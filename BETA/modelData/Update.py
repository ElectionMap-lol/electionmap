
# Import Statements
import csv

# Define a class that will represent each row as an object
class election:
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
            electionObj = election(**row)  # Convert row dictionary to object
            electionsArray.append(electionObj)  # Add object to list
    
    return electionsArray

def lookupElection(year, state, data, district):
    #print ("Looking up election for year: " + str(year) + ", state: " + state)
    for election in data:
        if election.Year == str(year) and election.State == state and election.District == district:
            return election
    #print ("No matching election found for year: " + str(year) + ", state: " + state)
    return None  # Return None if no matching election is found

# Run Presidential Model
def presidentModel(year, data):
    print("Running Presidential Model for " + str(year))
    # FUTURE FEATURE: ADD LOGIC TO PULL PRESIDENTIAL POLLING AVERAGE FROM POLLING DATA
    presPollingAverage = float(0)

    # Loop through election data and only process if the year matches the input year
    for election in data:
        if election.Year == str(year) and election.District == "President":
            print("Running calculation for Presidential Election in " + str(election.State) + " for year " + str(year))
            # Variables that will be used to calculate the model for the given year

            # Neutral Environment for state in given year, calculated by substracting the national popular vote from the actual election result
            # We only care about elections from 3 years prior to the given year, so we will only calculate the neutral environment for those years
            # Declare variables.  Neutral 1 is the previous election, Neutral 2 is 2 elections prior, Neutral 3 is 3 elections prior.  For example, if the given year is 2020, Neutral 1 is 2016, Neutral 2 is 2012, and Neutral 3 is 2008
            neutral1 = year - 4; neutral2 = year - 8; neutral3 = year - 12
            # List of previous popular vote wins for the last 7 elections, starting with the most recent election. 
            prevPopularVoteWins = {"2024": -1.5, "2020": 4.5, "2016": 2.1, "2012": 3.9, "2008": 7.2, "2004": -2.4, "2000": 0.5}

            # Get Previous Years Result from the State
            prevElection = lookupElection(neutral1, election.State, data, "President")
            prevElection2 = lookupElection(neutral2, election.State, data, "President")
            prevElection3 = lookupElection(neutral3, election.State, data, "President")
            
            print("Result for " + str(neutral1) + " " + str(prevElection.Margin))
            print("Result for " + str(neutral2) + " " + str(prevElection2.Margin))
            print("Result for " + str(neutral3) + " " + str(prevElection3.Margin))
   
            neutralEnvProjectedShift = ((((float(prevElection.Margin) - float(prevPopularVoteWins.get(str(neutral1)))) - (float(prevElection2.Margin) - float(prevPopularVoteWins.get(str(neutral2))))) + ((float(prevElection2.Margin) - float(prevPopularVoteWins.get(str(neutral2)))) - (float(prevElection3.Margin) - float(prevPopularVoteWins.get(str(neutral3))))))) / 2

            print ("Expected State's shift in a neutral environment for " + str(year) + ": " + str(neutralEnvProjectedShift))


            

# Variables
# URL to the CSV File containing the election data
dataUrl = "./BETA/ModelData/ElectionsData.csv"
# electionsData is an array of election objects created from the CSV file that will be manipulated through the script
electionsData = csv_to_objects(dataUrl)

print("====Elections Data Loaded Successfully====")

presidentModel(2024, electionsData)
presidentModel(2028, electionsData)