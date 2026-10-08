
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
    for election in data:
        if election.Year == str(year) and election.State == state and election.District == district:
            return election
    return None  # Return None if no matching election is found

# Run Presidential Model
def presidentModel(year, data):
    #print("Running Presidential Model for " + str(year))
    # FUTURE FEATURE: ADD LOGIC TO PULL PRESIDENTIAL POLLING AVERAGE FROM POLLING DATA
    presPollingAverage = float(0)

    # Loop through election data and only process if the year matches the input year
    for election in data:
        if election.Year == str(year) and election.District == "President":
            # Neutral Environment for state in last 3 years , calculated by substracting the national popular vote from the actual election result
            # Neutral 1 is the previous election, Neutral 2 is 2 elections prior, Neutral 3 is 3 elections prior.  For example, if the given year is 2020, Neutral 1 is 2016, Neutral 2 is 2012, and Neutral 3 is 2008
            prevElection1 = year - 4; prevElection2 = year - 8; prevElection3 = year - 12
            # List of previous popular vote wins for the last 7 elections, starting with the most recent election. 
            prevPopularVoteWins = {"2024": -1.5, "2020": 4.5, "2016": 2.1, "2012": 3.9, "2008": 7.2, "2004": -2.4, "2000": 0.5}

            # Get Previous Years Result from the State
            prevElectionResult = lookupElection(prevElection1, election.State, data, "President")
            prevElectionResult2 = lookupElection(prevElection2, election.State, data, "President")
            prevElectionResult3 = lookupElection(prevElection3, election.State, data, "President")     

            # Get the neutral environment for the state and project how it will be in the next election based on the previous 3 elections.  This is calculated by taking the difference between the state result and the national popular vote for each of the last 3 elections, and then averaging the difference between those differences to project how the state will perform in the next election.
            neutralEnvProjectedShift = (((float(prevElectionResult.Margin) - float(prevPopularVoteWins.get(str(prevElection1)))) - (float(prevElectionResult2.Margin) - float(prevPopularVoteWins.get(str(prevElection2))))) + ((float(prevElectionResult2.Margin) - float(prevPopularVoteWins.get(str(prevElection2)))) - (float(prevElectionResult3.Margin) - float(prevPopularVoteWins.get(str(prevElection3)))))) / 2    
            projectNeutralEnvForStateTrends = (float(prevElectionResult.Margin) - float(prevPopularVoteWins.get(str(prevElection1)))) + neutralEnvProjectedShift
            

            if election.Polls != None :
                projectNeutralEnvForStatePolling = election.Polls# - natPolling
                projectNeutralEnvForState = (projectNeutralEnvForStatePolling + projectNeutralEnvForStateTrends) / 2          
            else : 
                projectNeutralEnvForState = projectNeutralEnvForStateTrends
                

            

# Variables
# URL to the CSV File containing the election data
dataUrl = "./BETA/ModelData/ElectionsData.csv"
# electionsData is an array of election objects created from the CSV file that will be manipulated through the script
electionsData = csv_to_objects(dataUrl)

print("====Elections Data Loaded Successfully====")

presidentModel(2024, electionsData)
presidentModel(2028, electionsData)