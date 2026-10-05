import csv
import statistics

# Define a class that will represent each row as an object
class election:
    def __init__(self, **kwargs):
        # The **kwargs allows passing any number of keyword arguments (columns)
        for key, value in kwargs.items():
            setattr(self, key, value)



#class stateElection:
#    def __init__(self, state, district, year, dcandidate, rcandidate, ocandidate, dpercent, rpercent, opercent, incumbent, winner, margin, incOverPerf, p2024, p2020, p2016, p2012, p2008, p2004, p2000, Evs, Redistricted):
#        # The **kwargs allows passing any number of keyword arguments (columns)
#        for key, value in kwargs.items():
#            setattr(self, key, value)

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

def runPresidentialModel(electionData, year):
    natPolling = 0
    for d in electionData :
        if d.District == 'President' and d.Year == year : 
            # Set the national polling average
            if d.Year != '2028' and d.State == 'National' :
                
                natPolling = float(d.Polls)
                maxDPopVote = natPolling + 3
                maxRPopVote = natPolling - 3

            if d.Year == '2028' and d.State == 'National' :
                natPolling = 0
                maxDPopVote = natPolling + 3
                maxRPopVote = natPolling - 3

            #Get Neutral Environment for state for each year to see predicted shift         

            neutral2000 = float(d.P2000) - 0.5
            neutral2004 = float(d.P2004) + 2.4
            neutral2008 = float(d.P2008) - 7.2
            neutral2012 = float(d.P2012) - 3.9
            neutral2016 = float(d.P2016) - 2.1
            neutral2020 = float(d.P2020) - 4.5

            if d.Year == '2028' : 
                neutral2024 = float(d.P2024) + 1.5

            # Get Polling Average
            if d.Polls == '' :             
                statePolls = None
            else :
                statePolls = float(d.Polls)
            
            #Get Projected shift for state in a neutral environment
            if (d.Year == '2012') :
                # Get projected shift based on past elections
                shift1 = neutral2008 - neutral2004
                shift2 = neutral2004 - neutral2000
                neutralProjectedOnShift = neutral2008 + ((shift1 + shift2) / 2)   
            if (d.Year == '2016') :
                # Get projected shift based on past elections
                shift1 = neutral2012 - neutral2008
                shift2 = neutral2008 - neutral2004
                neutralProjectedOnShift = neutral2012 + ((shift1 + shift2) / 2)              
            if (d.Year == '2020') :
                # Get projected shift based on past elections
                shift1 = neutral2016 - neutral2012
                shift2 = neutral2012 - neutral2008
                neutralProjectedOnShift = neutral2016 + ((shift1 + shift2) / 2)   
            
            if (d.Year == '2024') :
                # Get projected shift based on past elections
                shift1 = neutral2020 - neutral2016
                shift2 = neutral2016 - neutral2012
                neutralProjectedOnShift = neutral2020 + ((shift1 + shift2) / 2)

            if (d.Year == '2028') :
                # Get projected shift based on past elections
                shift1 = neutral2024 - neutral2020
                shift2 = neutral2020 - neutral2016
                neutralProjectedOnShift = neutral2024 + ((shift1 + shift2) / 2)     

            if (d.State == "Florida" or d.State == "Wisconsin" or d.State == "Kansas"):
                print ("====" + str(d.State) + "====")
                print(shift1)
                print(shift2)
                print ((shift1 + shift2) / 2)   
                print ("Expected State's neutral environment for " + str(year) + ": " + str(neutralProjectedOnShift))
            
            # Get projected shift based on polls, and then average that with the neutralProjectedOnShift
            if statePolls != None :
                neutralProjectedonPolls = statePolls - natPolling
                neutralProjected = (neutralProjectedOnShift + neutralProjectedonPolls) / 2
            else : 
                neutralProjectedonPolls = None
                neutralProjected = neutralProjectedOnShift
                

            # ---------------------------------------------------
            # Get all projected results (this is the main model)
            # ----------------------------------------------------
            outcomesArray = []

            # Outcomes based on polling averages and a standard polling error 

            if statePolls != None :
                
                maxD = neutralProjectedonPolls + 6
                maxR = neutralProjectedonPolls - 6
                while maxR < (maxD + 0.1) :
                    maxDNat = maxDPopVote
                    maxRNat = maxRPopVote
                    while (maxRNat < (maxDNat + .1)):
                        outcome = maxR + maxRNat
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxRNat = maxRNat + .5
                    maxR = maxR + .5

            # Outcomes based on the expected state shift
            maxD = neutralProjectedOnShift + 6
            maxR = neutralProjectedOnShift - 6

            while maxR < (maxD + 0.1) :
                maxDNat = maxDPopVote
                maxRNat = maxRPopVote
                while (maxRNat < (maxDNat + .1)) :
                    outcome = maxR + maxRNat
                    outcomesArray.append(outcome)
                    outcomesArray.append(outcome)
                    maxRNat = maxRNat + .5
                maxR = maxR + .5

            # Outcomes based on last election
            if d.Year == '2012' :
                maxD = float(d.P2008) + 4
                maxR = float(d.P2008) - 4
                while maxR < (maxD + 0.1) :
                    maxDNat = 3
                    maxRNat = -3
                    while (maxRNat < (maxDNat + .1)) :
                        outcome = maxR + maxRNat
                        outcomesArray.append(outcome)
                        maxRNat = maxRNat + .5
                    maxR = maxR + .5
            if d.Year == '2016' :
                maxD = float(d.P2012) + 4
                maxR = float(d.P2012) - 4
                while maxR < (maxD + 0.1) :
                    maxDNat = 3
                    maxRNat = -3
                    while (maxRNat < (maxDNat + .1)) :
                        outcome = maxR + maxRNat
                        outcomesArray.append(outcome)
                        maxRNat = maxRNat + .5
                    maxR = maxR + .5
            if d.Year == '2020' :
                maxD = float(d.P2016) + 4
                maxR = float(d.P2016) - 4
                while maxR < (maxD + 0.1) :
                    maxDNat = 3
                    maxRNat = -3
                    while (maxRNat < (maxDNat + .1)) :
                        outcome = maxR + maxRNat
                        outcomesArray.append(outcome)
                        maxRNat = maxRNat + .5
                    maxR = maxR + .5
            if d.Year == '2024' :
                maxD = float(d.P2020) + 4
                maxR = float(d.P2020) - 4
                while maxR < (maxD + 0.1) :
                    maxDNat = 3
                    maxRNat = -3
                    while (maxRNat < (maxDNat + .1)) :
                        outcome = maxR + maxRNat
                        outcomesArray.append(outcome)
                        maxRNat = maxRNat + .5
                    maxR = maxR + .5
            if d.Year == '2028' :
                maxD = float(d.P2024) + 4
                maxR = float(d.P2024) - 4
                while maxR < (maxD + 0.1) :
                    maxDNat = 3
                    maxRNat = -3
                    while (maxRNat < (maxDNat + .1)) :
                        outcome = maxR + maxRNat
                        outcomesArray.append(outcome)
                        maxRNat = maxRNat + .5
                    maxR = maxR + .5

            # Outcomes based on the expected shift based on results and polls
            maxD = neutralProjected + 12
            maxR = neutralProjected - 12

            while maxR < (maxD + 0.1) :
                maxDNat = maxDPopVote + 4
                maxRNat = maxRPopVote - 4
                while (maxRNat < (maxDNat + .1)) :
                    outcome = maxR + maxRNat
                    outcomesArray.append(outcome)
                    outcomesArray.append(outcome)
                    maxRNat = maxRNat + .5
                maxR = maxR + .5

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

            d.Chance = percentDWin
            d.Median = medianOutcome
    return natPolling, electionData

def runSenateModel(electionData, year):
    pollingError = 4
    # Get generic ballot average, eventually make this a function
    if (year == '2018'):
        pollingA = 7.3
    elif (year == '2020'):
        pollingA = 6.8     
    elif (year == '2022'):
        pollingA = -2.5      
    elif (year == '2024'):
        pollingA = -.3   
    elif (year == '2026'):
        pollingA = 9.6
    maxDemocratResult = pollingA + pollingError
    maxRepublicanResult = pollingA - pollingError
    for d in electionData : 
        # Only Look at Senate Data for the current year
       
        if d.Year == year and (d.District == 'C1' or d.District == 'C2' or d.District == 'C3'):
            incOverperformance = 0
            
            # Get an array of elections that the candidate has been in previously and calculate Overperformance
            if (d.IncumbentParty != 'OPEN') : 
                pastElections = []
                if (d.IncumbentParty == 'D') :
                    incumbent = d.Dcandidate 
                    pastElections = findElectionsWithCandidate (electionData, d.IncumbentParty, incumbent, 'S', year)
                elif d.IncumbentParty == 'R': 
                    incumbent = d.Rcandidate
                    pastElections = findElectionsWithCandidate (electionData, d.IncumbentParty, incumbent, 'S', year)
                else : 
                    incumbent = d.Ocandidate
                    pastElections = findElectionsWithCandidate (electionData, d.IncumbentParty, incumbent, 'S', year)
                # Take past elections and calculate their overperformance            
                sum = 0

                for p in pastElections :
 
                    if (p.Year == '2024' and p.Margin != "R/NA") :
                        incPerformance = float(p.Margin) - float(p.P2024)    
                        sum = sum + incPerformance            
                    if (p.Year == '2022' and p.Margin != "R/NA") :
                        neutral2022Senate = float(p.Margin) + 2.7
                        neutral2020President = float(p.P2020) - 4.5
                        incPerformance = neutral2022Senate - neutral2020President
                        sum = sum + incPerformance
                    if (p.Year == '2020' and p.Margin != "R/NA") :
                        incPerformance = float(p.Margin) - float(p.P2020)    
                        sum = sum + incPerformance
                    if ((p.Year == '2018' or p.Year == '2017') and p.Margin != "R/NA") :
                        neutral2018Senate = float(p.Margin) - 8.6
                        neutral2016President = float(p.P2016) - 2.1
                        incPerformance = neutral2018Senate - neutral2016President
                        sum = sum + incPerformance
                    if (p.Year == '2016' and p.Margin != 'RN/A') : 
                        incPerformance = float(p.Margin) - float(p.P2016)
                        sum = sum + incPerformance 
                    if ((p.Year == '2014' or p.Year == '2013') and p.Margin != "R/NA") :
                        neutral2014Senate = float(p.Margin) + 5.7
                        neutral2012President = float(p.P2012) - 3.9
                        incPerformance = neutral2014Senate - neutral2012President   
                        sum = sum + incPerformance                      
                    if (p.Year == '2012' and p.Margin != "R/NA") :
                        incPerformance = float(p.Margin) - float(p.P2012)
                        sum = sum + incPerformance                  
                    if (p.Year == '2010' and p.Margin != "RN/A") :  
                        neutral2010Senate = float(p.Margin) + 6.8
                        neutral2008President = float(p.P2008) - 7.9
                        incPerformance = neutral2010Senate - neutral2008President
                        sum = sum + incPerformance                            
                    if (p.Year == '2008' and p.Margin != "R/NA") :
                        incPerformance = float(p.Margin) - float(p.P2008)
                        sum = sum + incPerformance                           
                    if (p.Year == '2006' and p.Margin != "R/NA") :
                        neutral2006Senate = float(p.Margin) - 8
                        neutral2004President = float(p.P2004) + 2.4
                        incPerformance = neutral2006Senate - neutral2004President
                        sum = sum + incPerformance
                    # Average the performances
                incOverperformance = sum / len(pastElections) 
                d.IncOverPerformance = incOverperformance  
                                                                        
            else : 
                incOverperformance = 0
            

            # Standard Incumbent Bonus
            incumbentBonus = 0
            if (d.IncumbentParty == 'D' or d.IncumbentParty == 'ID') :
                incumbentBonus = 3
            elif (d.IncumbentParty == 'R') :
                incumbentBonus = -3
            
            # Get state data for presidential level
            presidentialState = None

            if d.State.endswith("- Special"):
                dState = d.State[:-10]  # Removes the last 2 characters ('-S')
            else:
                dState = d.State       
            for p in electionData :
              # if an election year               
                if year == '2020' or year == '2024' :
                    if dState == p.State and d.Year == p.Year and p.District == 'President':
                        presidentialState = p
                # Midterms
                elif year == '2018' :
                    if dState == p.State and '2016' == p.Year and p.District == 'President':
                        
                        presidentialState = p
                elif year == '2022' : 
                    if dState == p.State and '2020' == p.Year and p.District == 'President':
                        presidentialState = p
                elif year == '2026' : 
                    if dState == p.State and '2024' == p.Year and p.District == 'President':
                        presidentialState = p


            #Run the model ---------------------------------
            outcomesArray = []
            # Basic Polling
            if d.Polls != '' :
                maxD = float(d.Polls) + 5
                maxR = float(d.Polls) - 5
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5  
            
            # Presidential Year Model
            if d.Year == '2020' or d.Year == '2024' :   
                # Presidential + normal Incumbent Bonus
                maxD = float(presidentialState.Median) + 5
                maxR = float(presidentialState.Median) - 5
                
                if (incumbentBonus == 3) :
                    maxD = maxD + incumbentBonus
                else :
                    maxR = maxR + incumbentBonus
                    
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5    

                # Presidential Results + Past  Incumbent Strength
                maxD = float(presidentialState.Median) + incOverperformance + 5
                maxR = float(presidentialState.Median) + incOverperformance - 5
                if (incumbentBonus == 3) :
                    maxD = maxD + incumbentBonus
                else :
                    maxR = maxR + incumbentBonus
                                 
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5     

                # Basic State Polling Average gen ballot
                maxD = float(presidentialState.Median) + 6
                maxR = float(presidentialState.Median) - 6

                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        maxNatR = maxNatR + .5
                    maxR = maxR + .5               

            # Midterm based on the last presidential neutral results (as it doesnt correlate as much)
            if d.Year == '2022' or d.Year == '2018' or d.Year == '2026' :
                presidentNeutral = None
                if d.Year == '2026' :
                    presidentNeutral = float(presidentialState.Margin) + 1.5
                if d.Year == '2022' :
                    presidentNeutral = float(presidentialState.Margin) - 4.5
                if d.Year == '2018' :
                    presidentNeutral = float(presidentialState.Margin) - 2.1

                # Presidential + normal Incumbent Bonus
                maxD = presidentNeutral + incOverperformance + 5
                maxR = presidentNeutral + incOverperformance - 5
                
                if (incumbentBonus == 3) :
                    maxD = maxD + incumbentBonus
                else :
                    maxR = maxR + incumbentBonus
                    
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5    
                
                 # Basic State Polling Average  gen bballot
                    maxD = presidentNeutral + 6
                    maxR = presidentNeutral - 6

                    while (maxR < (maxD + .1)) :
                        maxNatD = maxDemocratResult
                        maxNatR = maxRepublicanResult
                        while (maxNatR < (maxNatD + .1)) :
                            outcome = maxR + maxNatR
                            outcomesArray.append(outcome)
                            
                            maxNatR = maxNatR + .5
                        maxR = maxR + .5


            # Based on last presidential
            if d.Year == '2024' or d.Year == '2022' :   
                # Presidential + normal Incumbent Bonus
                maxD = float(d.P2020) + 3
                maxR = float(d.P2020) - 3
                              
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5    
            if d.Year == '2018' or d.Year == '2016' :   
                # Presidential + normal Incumbent Bonus
                maxD = float(d.P2016) + 3
                maxR = float(d.P2016) - 3
                              
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5   
            if d.Year == '2026' or d.Year == '2028' :   
                # Presidential + normal Incumbent Bonus
                maxD = float(d.P2024) + 3
                maxR = float(d.P2024) - 3
                              
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5   


            # Sort Array and Count the numbber times dem wins to get a percentage and a median outcome
            numDWins = 0          
            i = 0
            while (i < len(outcomesArray)) :
                if outcomesArray[i] > 0 :
                    numDWins = numDWins + 1
                i = i + 1
        
            percentDWin = numDWins / len(outcomesArray)
            medianOutcome = statistics.median(outcomesArray)
        
            d.IncOverPerformance = incOverperformance
            d.Chance = percentDWin
            d.Median = medianOutcome

    return electionData

def runHouseModel (electionData, year) :
    pollingError = 4
    # Get generic ballot average, eventually make this a function
    if (year == '2024'):
        pollingAverage = .27
    elif (year == '2026'):
        pollingAverage = 9.6

    maxDemocratResult = pollingAverage + pollingError
    maxRepublicanResult = pollingAverage - pollingError

    for d in electionData :
        # Go through house districts for year
        if (d.State == 'House' and d.Year == year):
            prevElectionResult = 0

            # Get Previous election result 
            if (d.Redistricted == 'R') :
                prevElectionResult = 'N/A'
            else :
                # Get Previous election Result
                previousElectionYear = int(year) - 2
                for e in electionData :
                 
                    if (int(e.Year) == previousElectionYear and d.District == e.District) :
                        prevElectionResult = e.Margin


            # Incumbent Bonus
            incumbentBonus = 0
            if (d.IncumbentParty == 'D' or d.IncumbentParty == 'ID') :
                incumbentBonus = 3
            elif (d.IncumbentParty == 'R') :
                incumbentBonus = -3


            p2020Neutral = float(d.P2020) - 4.5
            p2016Neutral = float(d.P2016) - 2.1
            p2012Neutral = float(d.P2012) - 3.9

            if (year == '2026') :
                p2024Neutral = float(d.P2024) + 1.5
            
            projectedDistrictNeutral = 0
            
            # This is a variable for comparing candidate to the presidential level for overperformance
            prevElectionIfPresidential = 0

            # Get Neutral Environment for 2024
            if (year == '2024') :
                projectedDistrictNeutral = p2020Neutral + (((p2020Neutral - p2016Neutral) + (p2016Neutral - p2012Neutral)) / 2)
                projectedDistrictNeutral2 = p2020Neutral + (p2020Neutral - p2016Neutral)
                prevElectionIfPresidential = p2020Neutral - 2.7
            # Get Projected Neutral Environment for 2026 (going to cut the shifts in half because midterm year)
            if (year == '2026') : 
                projectedDistrictNeutral = (p2024Neutral + (((p2024Neutral - p2020Neutral) + (p2020Neutral - p2016Neutral)) / 2)) / 2
                projectedDistrictNeutral2 = (p2024Neutral + (p2024Neutral - p2020Neutral)) / 2
                prevElectionIfPresidential = float(d.P2024)

            #Calculate the incumbents strength
            incumbentOverperformance = 0
            if (d.IncumbentParty != 'OPEN') :
                if (prevElectionResult != 'RN/A' and prevElectionResult != 'DN/A' and prevElectionResult != 'N/A') :
                    incumbentOverperformance = float(prevElectionResult) - prevElectionIfPresidential
            
            #print (d.District)
            #print (d.Year)
            #print (d.IncumbentParty)
            if (d.Redistricted == 'R' and (d.IncumbentParty != 'OPEN')):

                if (d.IncumbentParty == 'D') :
                    incumbent =  d.Dcandidate
                if (d.IncumbentParty == 'R') :
                    incumbent =  d.Rcandidate

                
                incumbentOverperformance = findHouseCandidatesPreviousElectionIfRedistricted (electionData, incumbent, d.IncumbentParty, year) 
                if (d.District == "OH10") :
                    print (d.District)
                    print (incumbentOverperformance)

            #Run the model ---------------------------------
            outcomesArray = []

            # Basic District Fundamentals
            maxD = projectedDistrictNeutral + 6
            maxR = projectedDistrictNeutral - 6

            while (maxR < (maxD + .1)) :
                maxNatD = maxDemocratResult
                maxNatR = maxRepublicanResult
                while (maxNatR < (maxNatD + .1)) :
                    outcome = maxR + maxNatR
                    outcomesArray.append(outcome)
                    maxNatR = maxNatR + .5
                maxR = maxR + .5
            
            # Basic District Fundamentals 2
            maxD = projectedDistrictNeutral2 + 6
            maxR = projectedDistrictNeutral2 - 6

            while (maxR < (maxD + .1)) :
                maxNatD = maxDemocratResult
                maxNatR = maxRepublicanResult
                while (maxNatR < (maxNatD + .1)) :
                    outcome = maxR + maxNatR
                    outcomesArray.append(outcome)
                    maxNatR = maxNatR + .5
                maxR = maxR + .5

            # Fundamentals of District last election Numbers
            if (year == '2024') :
                maxD = p2020Neutral + 6
                maxR = p2020Neutral - 6

                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxNatR = maxNatR + .5
                    maxR = maxR + .5            
            if (year == '2026'):
                maxD = p2024Neutral + 6
                maxR = p2024Neutral - 6

                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxNatR = maxNatR + .5
                    maxR = maxR + .5    

            #Fundamentals + Incumbents overpeformance
            maxD = projectedDistrictNeutral + 6 + incumbentOverperformance
            maxR = projectedDistrictNeutral - 6 + incumbentOverperformance

            while (maxR < (maxD + .1)) :
                maxNatD = maxDemocratResult
                maxNatR = maxRepublicanResult
                while (maxNatR < (maxNatD + .1)) :
                    outcome = maxR + maxNatR
                    outcomesArray.append(outcome)
                    maxNatR = maxNatR + .5
                maxR = maxR + .5
            maxD = projectedDistrictNeutral2 + 6 + incumbentOverperformance
            maxR = projectedDistrictNeutral2 - 6 + incumbentOverperformance

            while (maxR < (maxD + .1)) :
                maxNatD = maxDemocratResult
                maxNatR = maxRepublicanResult
                while (maxNatR < (maxNatD + .1)) :
                    outcome = maxR + maxNatR
                    outcomesArray.append(outcome)
                    maxNatR = maxNatR + .5
                maxR = maxR + .5            

            # Fundamentals of District last election Numbers + incumbbent Overperformance
            if (year == '2024') :
                maxD = p2020Neutral + 6 + incumbentOverperformance
                maxR = p2020Neutral - 6 + incumbentOverperformance

                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxNatR = maxNatR + .5
                    maxR = maxR + .5            
            if (year == '2026'):
                maxD = p2024Neutral + 6 + incumbentOverperformance
                maxR = p2024Neutral - 6 + incumbentOverperformance

                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxNatR = maxNatR + .5
                    maxR = maxR + .5  

            #Fundamentals + Incumbents Bonus
            maxD = projectedDistrictNeutral + 6 + incumbentBonus
            maxR = projectedDistrictNeutral - 6 + incumbentBonus

            while (maxR < (maxD + .1)) :
                maxNatD = maxDemocratResult
                maxNatR = maxRepublicanResult
                while (maxNatR < (maxNatD + .1)) :
                    outcome = maxR + maxNatR
                    outcomesArray.append(outcome)
                    maxNatR = maxNatR + .5
                maxR = maxR + .5
            maxD = projectedDistrictNeutral2 + 6 + incumbentBonus
            maxR = projectedDistrictNeutral2 - 6 + incumbentBonus

            while (maxR < (maxD + .1)) :
                maxNatD = maxDemocratResult
                maxNatR = maxRepublicanResult
                while (maxNatR < (maxNatD + .1)) :
                    outcome = maxR + maxNatR
                    outcomesArray.append(outcome)
                    maxNatR = maxNatR + .5
                maxR = maxR + .5   

            # Fundamentals of District last election Numbers + incumbbent Overperformance
            if (year == '2024') :
                maxD = p2020Neutral + 6 + incumbentBonus
                maxR = p2020Neutral - 6 + incumbentBonus

                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxNatR = maxNatR + .5
                    maxR = maxR + .5            
            if (year == '2026'):
                maxD = p2024Neutral + 6 + incumbentBonus
                maxR = p2024Neutral - 6 + incumbentBonus

                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        maxNatR = maxNatR + .5
                    maxR = maxR + .5  

            # Previous House Election
            if (d.Redistricted != 'R' and prevElectionResult != 'DN/A' and prevElectionResult != 'RN/A') : 
                maxD = float(prevElectionResult) + 4
                maxR = float(prevElectionResult) - 4
   
                while (maxR < (maxD + .1)) :
                    maxNatD = maxDemocratResult
                    maxNatR = maxRepublicanResult
                    while (maxNatR < (maxNatD + .1)) :
                        outcome = maxR + maxNatR
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)

                        maxNatR = maxNatR + .5
                    maxR = maxR + .5            
            outcomesArray.sort()
        
            i = 0
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


        
            d.IncOverPerformance = incumbentOverperformance     
            d.Chance = percentDWin
            d.Median = medianOutcome

    return electionData

def runGovModel (electionData, year) :

    for d in electionData :
        # Go through house districts for year
        if (d.District == 'Gov' and float(d.Year) > 2016):
            outcomesArray = []

            prevGov = ''
            # Previous Governor
            prevGovs = []
            for i in electionData :       
                if (i.District == 'Gov' and i.StateA == d.StateA and i.Year < d.Year):
                    prevGovs.append(i)
            prevGov = max(prevGovs, key=lambda x: int(x.Year)) 

            
   
            maxD = float(prevGov.Margin) + 9
            maxR = float(prevGov.Margin) - 9
            while maxR < (maxD + 0.1) :
                maxDVariation = 6
                maxRVariation = -6
                while (maxRVariation < (maxDVariation + .1)):
                    outcome = maxR + maxRVariation
                    outcomesArray.append(outcome)
                    if (d.IncumbentParty == 'D' or d.IncumbentParty == 'R'):
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        if (d.Polls == ''):
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)
                    maxRVariation = maxRVariation + .5
                maxR = maxR + .5                      

            # Basic Polling
            if d.Polls != '' :
                maxD = float(d.Polls) + 9
                maxR = float(d.Polls) - 9
                while maxR < (maxD + 0.1) :
                    maxDVariation = 6
                    maxRVariation = -6
                    while (maxRVariation < (maxDVariation + .1)):
                        outcome = maxR + maxRVariation
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)
                        if (d.IncumbentParty == 'OPEN'):
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)   
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome) 
                            outcomesArray.append(outcome)
                            outcomesArray.append(outcome)  
                        maxRVariation = maxRVariation + .5
                    maxR = maxR + .5  
            # Get Previous Presidential Election Result
            if ((float(d.Year) > 2016 and float(d.Year) < 2020)):
                prevPresident = d.P2016
            if ((float(d.Year) > 2020 and float(d.Year) < 2024)):
                prevPresident = d.P2020
            if ((float(d.Year) > 2024 and float(d.Year) < 2028)):
                prevPresident = d.P2024
            # Prev Presidential
            maxD = float(prevPresident) + 9
            maxR = float(prevPresident) - 9
            while maxR < (maxD + 0.1) :
                maxDVariation = 6
                maxRVariation = -6
                while (maxRVariation < (maxDVariation + .1)):
                    outcome = maxR + maxRVariation
                    outcomesArray.append(outcome)
                    outcomesArray.append(outcome)
                    if (d.IncumbentParty == 'OPEN'):
                        outcomesArray.append(outcome)
                        outcomesArray.append(outcome)                        
                    maxRVariation = maxRVariation + .5
                maxR = maxR + .5  

            outcomesArray.sort()

          
        
            i = 0
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


            d.Chance = percentDWin
            d.Median = medianOutcome

    return electionData




def findElectionsWithCandidate (electionData, incumbentParty, incumbent, electionType, year) : 
    incElectionArray = []
    for d in electionData :
        # look for elections with candidate (Senate)
        if (electionType == 'S'):

            if (incumbentParty == 'D' and d.Dcandidate == incumbent and (d.District == 'C1' or d.District == 'C2' or d.District == 'C3') and int(d.Year) < int(year)) :
                incElectionArray.append(d)
            if (incumbentParty == 'R' and d.Rcandidate == incumbent and (d.District == 'C1' or d.District == 'C2' or d.District == 'C3') and int(d.Year) < int(year)) :
                incElectionArray.append(d)
            if (incumbentParty == 'ID' and d.Ocandidate == incumbent and (d.District == 'C1' or d.District == 'C2' or d.District == 'C3') and int(d.Year) < int(year)) :
                incElectionArray.append(d)

    return incElectionArray

def findHouseCandidatesPreviousElectionIfRedistricted (electionData, incumbent, incumbentParty, year) : 
    prevElectionYear = int(year) - 2
    incOver = 0
    for d in electionData :
        if (d.Dcandidate == incumbent and int(d.Year) == prevElectionYear and d.Margin != 'RN/A' and d.Margin != 'DN/A') :   
            # NC01 = 3  DD = 5
            if (prevElectionYear == 2022):
                incOver = (float(d.Margin) + 2.7) - (float(d.P2020) - 4.5)
            if (prevElectionYear == 2024):
                incOver = (float(d.Margin)) - (float(d.P2024))
            break
        if (d.Rcandidate == incumbent and int(d.Year) == prevElectionYear and d.Margin != 'RN/A' and d.Margin != 'DN/A') :
            if (prevElectionYear == 2022):
                incOver = (float(d.Margin) + 2.7) - (float(d.P2020) - 4.5)
            if (prevElectionYear == 2024):
                incOver = (float(d.Margin)) - (float(d.P2024))
            break

   

    return incOver

# Run the Damn Thing
filename = 'C:\\Users\\Jesse Beach\\OneDrive\\Models\\electionmap-main\\ModelData\\ElectionsData.csv'  # Replace with the path to your CSV file


electionsArray = csv_to_objects(filename)

modelP2012 = runPresidentialModel(electionsArray, '2012')
modelP2016 = runPresidentialModel(modelP2012[1], '2016')

modelS2018 = runSenateModel(modelP2016[1], '2018')

modelP2020 = runPresidentialModel(modelS2018, '2020')
modelS2020 = runSenateModel(modelP2020[1], '2020')
modelS2022 = runSenateModel(modelS2020, '2022')

# Run the Presidential Model
modelP2024 = runPresidentialModel(modelS2022, '2024')
modelS2024 = runSenateModel(modelP2024[1], '2024')
modelH2024 = runHouseModel(modelS2024, '2024')
modelH2026 = runHouseModel(modelH2024, '2026')
modelS2026 = runSenateModel(modelH2026, '2026')
modelG2026 = runGovModel(modelS2026, '2026')


modelP2028 = runPresidentialModel(modelG2026, '2028')


finalModelData = modelP2028[1]
csvFile = 'C:\Temp\Output.csv'

data_dict = [
    {"StateA": e.StateA, "State": e.State, "District": e.District, "Year": e.Year, "Dcandidate": e.Dcandidate, "Rcandidate": e.Rcandidate, "Ocandidate": e.Ocandidate, "Dpercent": e.Dpercent, "Rpercent": e.Rpercent, "Opercent": e.Opercent, "IncumbentParty": e.IncumbentParty, "Winner": e.Winner, "Margin": e.Margin, "IncOverPerformance": e.IncOverPerformance, "P2024": e.P2024,"P2020": e.P2020,"P2016": e.P2016,"P2012": e.P2012, "P2008": e.P2008,"P2004": e.P2004,"P2000": e.P2000, "Evs": e.Evs, "Redistricted" : e.Redistricted, "Polls" : e.Polls, "Chance": e.Chance, "Margin": e.Margin, "Median": e.Median} for e in finalModelData
]

# Open the CSV file in write mode
with open(csvFile, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=data_dict[0].keys())
    
    # Write the header (fieldnames)
    writer.writeheader()
    
    # Write the data
    writer.writerows(data_dict)
