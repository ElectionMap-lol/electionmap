
# Import Statements
import csv
import statistics 

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

            # Temp nat polling until there's reliable 2028 polling
            natpolling = 0
            if (year == 2024):
                natpolling = 1.27
            
            # Get the neutral environment of the state based on the polling
            if election.Polls != '' :
                projectNeutralEnvForStatePolling = float(election.Polls) - natpolling
                projectNeutralEnvForState = (projectNeutralEnvForStatePolling + projectNeutralEnvForStateTrends) / 2          
            else : 
                projectNeutralEnvForStatePolling = None
                projectNeutralEnvForState = projectNeutralEnvForStateTrends
            # Now we have the neutral environments for the state and all the data we need.  Now we need to generate some values and see how many wins each

            outcomesArray = []
            
            # Outcomes based on polling averages and a standard polling error 
            if (projectNeutralEnvForStatePolling != None):
                outcomesArray = generateOutcomes(outcomesArray, projectNeutralEnvForStatePolling, 6, natpolling, 3, 2)
            # Outcomes based on the expected state shift
            outcomesArray = generateOutcomes(outcomesArray, projectNeutralEnvForStateTrends, 6, natpolling, 3, 2)

             # Outcomes based on last election
            outcomesArray = generateOutcomes(outcomesArray, float(prevElectionResult.Margin), 4, 0, 3, 1)

            # Outcomes based on the expected shift based on results and polls
            outcomesArray = generateOutcomes(outcomesArray, projectNeutralEnvForState, 12, natpolling, 7, 2)
            
            # Sort Array and Count the numbber times dem wins to get a percentage and a median outcome
            numDWins = 0
            outcomesArray.sort()

            i = 0
            while (i < len(outcomesArray)) :
                if outcomesArray[i] > 0 :
                    numDWins = numDWins + 1
                i = i + 1
           
            percentDWin = numDWins / len(outcomesArray)
            medianOutcome = statistics.median(outcomesArray)

            election.Chance = percentDWin
            election.Median = medianOutcome

            return data
        
def generateOutcomes(outcomesArray, inputBaseline, errorOffset, nationalPoll, nationalPollOffset, weight):
    maxD = inputBaseline + errorOffset
    maxR = inputBaseline - errorOffset
    while maxR < (maxD + 0.1) :
        maxDPopVote = nationalPoll + nationalPollOffset
        maxRPopVote = nationalPoll - nationalPollOffset
        while (maxRPopVote < (maxDPopVote + .1)):
            outcome = maxR + maxRPopVote
            count = 0
            while (count < weight):
                outcomesArray.append(outcome)
                count += 1
            maxRPopVote = maxRPopVote + .5
        maxR = maxR + .5 
    return outcomesArray           


def houseModel(year, data):
    print("")

# Variables
# URL to the CSV File containing the election data
dataUrl = "./BETA/ModelData/ElectionsData.csv"
# electionsData is an array of election objects created from the CSV file that will be manipulated through the script
electionsData = csv_to_objects(dataUrl)

print("====Elections Data Loaded Successfully====")

electionsData = presidentModel(2024, electionsData)
electionsData = presidentModel(2028, electionsData)

csvFile = './BETA/ModelData/ElectionsDataCopy.csv'

data_dict = [
    {"StateA": e.StateA, "State": e.State, "District": e.District, "Year": e.Year, "Dcandidate": e.Dcandidate, "Rcandidate": e.Rcandidate, "Ocandidate": e.Ocandidate, "Dpercent": e.Dpercent, "Rpercent": e.Rpercent, "Opercent": e.Opercent, "IncumbentParty": e.IncumbentParty, "Winner": e.Winner, "Margin": e.Margin, "IncOverPerformance": e.IncOverPerformance, "P2024": e.P2024,"P2020": e.P2020,"P2016": e.P2016,"P2012": e.P2012, "P2008": e.P2008,"P2004": e.P2004,"P2000": e.P2000, "Evs": e.Evs, "Redistricted" : e.Redistricted, "Polls" : e.Polls, "Chance": e.Chance, "Margin": e.Margin, "Median": e.Median} for e in electionsData
]
# Open the CSV file in write mode
with open(csvFile, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=data_dict[0].keys())
    # Write the header (fieldnames)
    writer.writeheader()
    # Write the data
    writer.writerows(data_dict)