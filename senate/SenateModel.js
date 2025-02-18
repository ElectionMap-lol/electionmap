//Array for 2024 State Data
const statesArray = [];
const senateArray = [];
var pollingAverage = 0;
var electionyear = "2024";
setBackgroundColor();

//DATA
const csvUrl = 'https://raw.githubusercontent.com/jessebeach50/electionmodel/main/ModelData/ElectionModelData.csv';
const senateCSVUrl = 'https://raw.githubusercontent.com/jessebeach50/electionmodel/main/ModelData/SenateData.csv';


// Use Papa Parse to fetch and parse the CSV file; runs when file loads
Papa.parse(csvUrl, {
    download: true,
    header: true, // Set to false if the CSV doesn't have headers
    dynamicTyping: true, // Convert types automatically
    skipEmptyLines: true, // Skip empty lines
    complete: function (results) {
        processStates(results.data, '2024');
    },
    error: function (error) {
        console.error("Error parsing CSV:", error);
    }
});
Papa.parse(senateCSVUrl, {
    download: true,
    header: true, // Set to false if the CSV doesn't have headers
    dynamicTyping: true, // Convert types automatically
    skipEmptyLines: true, // Skip empty lines
    complete: function (results) {
        processStatesSenate(results.data, '2024');
        setColorBasedOnChance();
        getPercentDWin();
        populateDropDown();
    },
    error: function (error) {
        console.error("Error parsing CSV:", error);
    }
});



// Hover box displays info about state when hovered over
var tooltipSpan = document.getElementById('details-box');

document.addEventListener('mouseover', function (e) {
    if (e.target.tagName == 'path') {

        var stateName = e.target.dataset.name;
        var stateAbbr = e.target.dataset.id;

        var hoveredState = null;
        var found = false;
        for (var i = 0; i < senateArray.length; i++) {
            if (senateArray[i].State == stateAbbr) {           
                if(senateArray[i].ElectionYear == electionyear){
                    hoveredState = senateArray[i];
                    found = true;
                    
                    var output = senateArray[i].InfoBoxString;
                    break;
                }              
            }
        }

        if(found = true){
            document.getElementById("details-box").innerHTML = output;
            document.getElementById("details-box").style.opacity = "100%";
        }
    }
    else {
        document.getElementById("details-box").style.opacity = "0%";
    }
});
window.onmousemove = function (e) {
    var x = e.clientX,
        y = e.clientY;
    tooltipSpan.style.top = (y + 20) + 'px';
    tooltipSpan.style.left = (x) + 'px';
};


// Adding an event listener to the buttons
document.addEventListener('DOMContentLoaded', (event) => {
    const button2022 = document.getElementById('2022 Model');
    button2022.addEventListener('click', handleClick2022);
    
    const button2020 = document.getElementById('2020 Model');
    button2020.addEventListener('click', handleClick2020);

    const button2018 = document.getElementById('2018 Model');
    button2018.addEventListener('click', handleClick2018);

    const button2024 = document.getElementById('2024 Model');
    button2024.addEventListener('click', handleClick2024);

    const button2022r = document.getElementById('2022 Actual Results');
    button2022r.addEventListener('click', handleClick2022r);

    const button2020r = document.getElementById('2020 Actual Results');
    button2020r.addEventListener('click', handleClick2020r);

    const button2018r = document.getElementById('2018 Actual Results');
    button2018r.addEventListener('click', handleClick2018r);

    const enterButton = document.getElementById('enterButton');
    enterButton.addEventListener('click', handleClickEnterButton);

    const callButtonD = document.getElementById('callButtonD');
    callButtonD.addEventListener('click', handleClickCallButtonD);

    const callButtonR = document.getElementById('callButtonR');
    callButtonR.addEventListener('click', handleClickCallButtonR);
});

//2022 Model Click--------------------------------------------------------------------------------------------------------------------------
// This function will be executed when the 2024 Model button is clicked
function handleClick2022() {
    statesArray.length = 0;
    senateArray.length = 0;
    electionyear = "2022";
    console.log(electionyear);
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, '2020');
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    Papa.parse(senateCSVUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStatesSenate(results.data, '2022');
            setColorBasedOnChance();
            getPercentDWin()
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    setBackgroundColor()
}

function handleClick2020() {
    statesArray.length = 0;
    senateArray.length = 0;
    electionyear = "2020";
    console.log(electionyear);
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, '2020');
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    Papa.parse(senateCSVUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStatesSenate(results.data, '2020');
            setColorBasedOnChance();
            getPercentDWin()
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    setBackgroundColor()
}

function handleClick2024() {
    statesArray.length = 0;
    senateArray.length = 0;
    electionyear = "2024";
    console.log(electionyear);
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, '2024');
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    Papa.parse(senateCSVUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStatesSenate(results.data, '2024');
            setColorBasedOnChance();
            getPercentDWin()
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    setBackgroundColor()
}

function handleClick2018() {
    statesArray.length = 0;
    senateArray.length = 0;
    electionyear = "2018";
    console.log(electionyear);
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, '2018');
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    Papa.parse(senateCSVUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStatesSenate(results.data, '2018');
            setColorBasedOnChance();
            getPercentDWin()
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    setBackgroundColor()
}

function handleClick2018r() {
    document.documentElement.style.setProperty('--maincolor', 'rgb(41, 48, 141)');
    
    // Update tints based on new main color
    updateTintedColors();
    statesArray.length = 0;
    senateArray.length = 0;
    electionyear = "2018";
    console.log(electionyear);
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, '2018');
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    Papa.parse(senateCSVUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStatesSenate(results.data, '2018');
            setColorsBasedOnResults("2018");
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    
}
function handleClick2020r() {
    document.documentElement.style.setProperty('--maincolor', 'rgb(78, 53, 80)');
    
    // Update tints based on new main color
    updateTintedColors();
    statesArray.length = 0;
    senateArray.length = 0;
    electionyear = "2020";
    console.log(electionyear);
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, '2020');
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    Papa.parse(senateCSVUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStatesSenate(results.data, '2020');
            setColorsBasedOnResults("2020");
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    
}
function handleClick2022r() {
    document.documentElement.style.setProperty('--maincolor', 'rgb(137, 37, 37)');
    
    // Update tints based on new main color
    updateTintedColors();
    statesArray.length = 0;
    senateArray.length = 0;
    electionyear = "2022";
    console.log(electionyear);
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, '2020');
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    Papa.parse(senateCSVUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStatesSenate(results.data, '2022');
            setColorsBasedOnResults("2022");
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
    
}

function mixColors(baseColor, tint, weight) {
    const base = baseColor.match(/\d+/g).map(Number);
    const tintColor = tint.match(/\d+/g).map(Number);
  
    const mixed = base.map((c, i) => Math.round(c * (1 - weight) + tintColor[i] * weight));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function updateTintedColors() {
    const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--maincolor').trim();
    
    if (!mainColor) return; // Avoid errors if --maincolor isn't set

    const tint1 = 'rgba(0, 0, 0, 0.1)';  // 10% darker
    const tint2 = 'rgba(0, 0, 0, 0.275)'; // 27.5% darker

    document.documentElement.style.setProperty('--main2color', mixColors(mainColor, tint1, 0.1));
    document.documentElement.style.setProperty('--main3color', mixColors(mainColor, tint2, 0.275));
}


function processStatesSenate(states, year) {
    //cycle through each states and parse the data as needed
    states.forEach(s => {
        //Basic Attributes
        var stateName = s.State;
        var stateFullName = s.StateFull;

        var sClass = s.Class;
        var incumbent = s.Incumbent

        var e2006Result = s.e2006;
        var e2008Result = s.e2008;
        var e2010Result = s.e2010;
        var e2012Result = s.e2012;
        var e2014Result = s.e2014;
        var e2016Result = s.e2016;
        var e2018Result = s.e2018;
        var e2020Result = s.e2020;

        var e2018ResultS = s.e2018r;
        var e2020ResultS = s.e2020r;
        var e2022ResultS = s.e2022r;
        

        //Get Corresponding State Data, excpetions for special elections
        var stateObject;
        try{ 
            stateObject = statesArray.find(obj => obj.State === stateFullName);
            if (stateFullName == "Nebraska Special"){
                stateObject = statesArray.find(obj => obj.State === "Nebraska");
            }
            if (stateFullName == "Oklahoma-Special"){
                stateObject = statesArray.find(obj => obj.State === "Oklahoma");
            }
            if (stateFullName == "Georgia - Special"){
                stateObject = statesArray.find(obj => obj.State === "Georgia");
            }
            if (stateFullName == "Arizona - Special"){
                stateObject = statesArray.find(obj => obj.State === "Arizona");             
            }
            if (stateFullName == "Minnesota - Special"){
                stateObject = statesArray.find(obj => obj.State === "Minnesota");
            }
            if (stateFullName == "Mississippi - Special"){
                stateObject = statesArray.find(obj => obj.State === "Mississippi");
            }
        }
        catch{

        }


        if(s.Election == "2024"){
            var polls = s.Polls2024;
            var pollingErrorInMonth = 3;
            var standardPollingError = 3;
        }else if (s.Election == "2022"){
            var polls = s.Polls2022;
            var pollingErrorInMonth = 0;
            var standardPollingError = 3;
        }
        else if (s.Election == "2020"){
            var polls = s.Polls2020;
            var pollingErrorInMonth = 0;
            var standardPollingError = 3;
        }
        else if (s.Election == "2018"){
            var polls = s.Polls2018;
            var pollingErrorInMonth = 0;
            var standardPollingError = 3;
        }else{
            console.log("Error, no election assigned for: " + stateFullName);
        }

        var pollingErrorInMonth = 3;
        var standardPollingError = 3;

        //Incumbent Strength
        var incumbentPerformances = [];
        try{
            if(incumbent != null){
                if(e2020Result != null){
                    var e2020N = e2020Result - 4.5;
                    var e2020StateN = stateObject.Election2020ResultsNeutral;
                    var incumbentPerformance = e2020N - e2020StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
                if(e2018Result != null){
                    var e2018N = e2018Result - 8.6;
                    var e2018StateN = stateObject.Election2016ResultsNeutral;
                    var incumbentPerformance = e2018N - e2018StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
                if(e2016Result != null){
                    var e2016N = e2016Result - 2.1;
                    var e2016StateN = stateObject.Election2016ResultsNeutral;
                    var incumbentPerformance = e2016N - e2016StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
                if(e2014Result != null){
                    var e2014N = e2014Result - -(5.7);
                    var e2014StateN = stateObject.Election2012ResultsNeutral;
                    var incumbentPerformance = e2014N - e2014StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
                if(e2012Result != null){
                    var e2012N = e2012Result - 3.9;
                    var e2012StateN = stateObject.Election2012ResultsNeutral;
                    var incumbentPerformance = e2012N - e2012StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
                if(e2010Result != null){
                    var e2010N = e2010Result - (-6.8);
                    var e2010StateN = stateObject.Election2008ResultsNeutral;
                    var incumbentPerformance = e2010N - e2010StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
                if(e2008Result != null){
                    var e2008N = e2008Result - 7.9;
                    var e2008StateN = stateObject.Election2008ResultsNeutral;
                    var incumbentPerformance = e2008N - e2008StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
                if(e2006Result != null){
                    var e2006N = e2006Result - 8;
                    var e2006StateN = stateObject.Election2004ResultsNeutral;
                    var incumbentPerformance = e2006N - e2006StateN;
                    incumbentPerformances.push(incumbentPerformance);                  
                }
            }
        }
        catch{
            console.log("Failed to process " + stateFullName + " " + s.Election);
        }

        var incumbentStrength = 0;
        var counter = 0;
        var sum = 0;

        while (counter < incumbentPerformances.length){
            sum = sum + incumbentPerformances[counter];
            counter++;
        }
        incumbentStrength = sum / incumbentPerformances.length;
        if (incumbentPerformances.length == 0){
            incumbentStrength = 0;
        }
  


        //Standard incumbent bonus
        var incumbentBonus = 0;
        if(s.IncParty == "D"){
            incumbentBonus = 3;
        }else if (s.IncParty == "R"){
            incumbentBonus = -3;
        }else{
            incumbentBonus = 0;
        }

        if (year == "2024"){
            try{ 
                var presidentMedian = stateObject.MedianOutcome;

            }catch{
                var presidentMedian = 0;
                console.log(stateFullName + s.Election)
                console.log("Failed")
            }
        }

        if (year == "2022"){
            try{ 
                var presidentMedian = stateObject.Election2020ResultsNeutral - 1.2;

            }catch{
                var presidentMedian = 0;
                console.log(stateFullName + s.Election)
                console.log("Failed")
            }
        }

        if (year == "2020"){
            console.log("I am here" + stateObject);
            try{ 
                var presidentMedian = stateObject.MedianOutcome;

            }catch{
                var presidentMedian = 0;
                console.log(stateFullName + s.Election)
                console.log("Failed")
            }
        }

        if (year == "2018"){
            console.log("I am here" + stateObject);
            try{ 
                var presidentMedian = stateObject.Election2016ResultsNeutral + 8.6;

            }catch{
                var presidentMedian = 0;
                console.log(stateFullName + s.Election)
                console.log("Failed")
            }
        }



        //Model---------------------------------
      
        var outcomesArray = [];

        //Basic Polling Model
        var maxD = polls + 5;
        var maxR = polls - 5

        if(polls != null){
            while (maxR < (maxD + .1)) {
                var maxVariationD = 0 + pollingErrorInMonth + standardPollingError;
                var maxVariationR = 0 - pollingErrorInMonth - standardPollingError;
                
                while (maxVariationR < (maxVariationD + .1)){
                    var outcome = maxR + maxVariationR;
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
                    maxVariationR = maxVariationR + .5;
                }
                maxR = maxR + .5;
            }
        }


        //President Results
       if(year == "2024" || year == "2020"){ 
            
            var maxD = presidentMedian + 5;
            var maxR = presidentMedian - 5;

            if(incumbentBonus  == 3){
                maxD = maxD + incumbentBonus;
            }else{
                maxR = maxR + incumbentBonus;
            }

            while (maxR < (maxD + .1)) {
                var maxVariationD = 0 + pollingErrorInMonth + standardPollingError;
                var maxVariationR = 0 - pollingErrorInMonth - standardPollingError;
                
                while (maxVariationR < (maxVariationD + .1)){
                    var outcome = maxR + maxVariationR;
                    outcomesArray.push(outcome);
                    
                    maxVariationR = maxVariationR + .5;
                }
                maxR = maxR + .5;
            }
        

            //President Results + Past incumbent Strength
            var maxD = presidentMedian + incumbentStrength + 5;
            var maxR = presidentMedian + incumbentStrength - 5;

            if(incumbentBonus  == 3){
                maxD = maxD + incumbentBonus;
            }else{
                maxR = maxR + incumbentBonus;
            }
            

            while (maxR < (maxD + .1)) {
                var maxVariationD = 0 + pollingErrorInMonth + standardPollingError;
                var maxVariationR = 0 - pollingErrorInMonth - standardPollingError;
                
                while (maxVariationR < (maxVariationD + .1)){
                    var outcome = maxR + maxVariationR;
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
                    maxVariationR = maxVariationR + .5;
                }
                maxR = maxR + .5;
            }

        }

        //Midterm based on last presidential neutral
        if (year == "2022" || year == "2018"){
            
            var maxD = presidentMedian + incumbentStrength + 5;
            var maxR = presidentMedian + incumbentStrength - 5;

            if(incumbentBonus  == 3){
                maxD = maxD + incumbentBonus;
            }else{
                maxR = maxR + incumbentBonus;
            }
            
            while (maxR < (maxD + .1)) {
                var maxVariationD = 0 + pollingErrorInMonth + standardPollingError;
                var maxVariationR = 0 - pollingErrorInMonth - standardPollingError;
                
                while (maxVariationR < (maxVariationD + .1)){
                    var outcome = maxR + maxVariationR;
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
                    
                    maxVariationR = maxVariationR + .5;
                }
                maxR = maxR + .5;
            }
        }

        //President 2020Result
        if(year == "2024" || year == "2022"){
            var maxD = stateObject.Election2020Results + 3;
            var maxR = stateObject.Election2020Results - 3;
            while (maxR < (maxD + .1)) {
                var maxVariationD = 0 + pollingErrorInMonth + standardPollingError;
                var maxVariationR = 0 - pollingErrorInMonth - standardPollingError;
                
                while (maxVariationR < (maxVariationD + .1)){
                    var outcome = maxR + maxVariationR;
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
                    maxVariationR = maxVariationR + .5;
                }
                maxR = maxR + .5;
            }
        }

        //President 2016Result
        if(year == "2020" || year == "2018"){
            var maxD = stateObject.Election2016Results + 3;
            var maxR = stateObject.Election2016Results - 3;
            while (maxR < (maxD + .1)) {
                var maxVariationD = 0 + pollingErrorInMonth + standardPollingError;
                var maxVariationR = 0 - pollingErrorInMonth - standardPollingError;
                
                while (maxVariationR < (maxVariationD + .1)){
                    var outcome = maxR + maxVariationR;
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
        
                    maxVariationR = maxVariationR + .5;
                }
                maxR = maxR + .5;
            }
        }




        //sort array and count number of times Dem wins to get a percentage and median outcome
        var numDWins = 0;

        var i = 0;
        while (i < outcomesArray.length) {
            var result = outcomesArray[i];
            if (result > 0) {
                numDWins = numDWins + 1;
            }
            i = i + 1;
        }

        //sort array
        outcomesArray.sort((a, b) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });

        //Get Percent chance and median outcome
        var percentDWin = numDWins / outcomesArray.length;
        var medianN = ~~(outcomesArray.length / 2);
        var median = outcomesArray[medianN];

        if (year == "2024"){
            var infoBoxString = stateFullName + "\nIncumbent: " + incumbent + "\nChance of D Win: " + percentDWin * 100 + "\nProjected Result: " + median + "\nPollingAverage: " + polls;
        }
        if (year == "2022"){
            var infoBoxString = stateFullName + "\n2022 Actual Result: " + e2022ResultS + "\nIncumbent: " + incumbent + "\nChance of D Win: " + percentDWin * 100 + "\nProjected Result: " + median + "\nPollingAverage: " + polls;
        }
        if (year == "2020"){
            var infoBoxString = stateFullName + "\n2020 Actual Result: " + e2020ResultS + "\nIncumbent: " + incumbent + "\nChance of D Win: " + percentDWin * 100 + "\nProjected Result: " + median + "\nPollingAverage: " + polls;
        }
        if (year == "2018"){
            var infoBoxString = stateFullName + "\n2018 Actual Result: " + e2018ResultS + "\nIncumbent: " + incumbent + "\nChance of D Win: " + percentDWin * 100 + "\nProjected Result: " + median + "\nPollingAverage: " + polls;
        }
        //Data for array -----------------------------------------------------
        let seatData = {
            State: stateName,
            ElectionYear: s.Election,
            Polls: polls,

            Election2006Result: e2006Result,
            Election2008Result: e2008Result,
            Election2010Result: e2010Result,
            Election2012Result: e2012Result,
            Election2014Result: e2014Result,
            Election2016Result: e2016Result,
            Election2018Result: e2018Result,
            Election2020Result: e2020Result,
            
            Election2018ResultS: e2018ResultS,
            Election2020ResultS: e2020ResultS,
            Election2022ResultS: e2022ResultS,

            ChanceOfDWin: percentDWin,
            InfoBoxString: infoBoxString
        };
        senateArray.push(seatData);

    });

}


//Process states and model for the presidential elections, this data will then be used for the senate model

function processStates(states, year) {
    //cycle through every state and parse the data as needed
    states.forEach(s => {
        var stateName = s.State

        if (stateName == 'National' && year == '2024') {
            pollingAverage = s.Polls;

        }
        else if (stateName == 'National' && year == '2020') {
            pollingAverage = 8.4;
        }
        else if (stateName == 'National' && year == '2016') {
            pollingAverage = 3.9;
        }
        else if (stateName == 'National' && year == '2012') {
            pollingAverage = .7;
        }

        if (year == '2024') {
            var pollingErrorInMonth = 3;
        }
        else {
            var pollingErrorInMonth = 0;
        }

        var standardPollingError = 3;

        var maxDPopularVote = pollingAverage + pollingErrorInMonth + standardPollingError;
        var maxRPopularVote = pollingAverage - pollingErrorInMonth - standardPollingError;

        //get all state results by year
        var e2000Results = Number(s.zeroresults);
        var e2004Results = Number(s.fourresults);
        var e2008Results = Number(s.eightresults);
        var e2012Results = Number(s.twelveresults);
        var e2016Results = Number(s.sixteenresults);
        var e2020Results = Number(s.twentyresults);

        //adjust states for popular vote to get what they would be in a neutral year
        var neutral2000 = e2000Results - 0.5;
        var neutral2004 = e2004Results + 2.4;
        var neutral2008 = e2008Results - 7.2;
        var neutral2012 = e2012Results - 3.9;
        var neutral2016 = e2016Results - 2.1;
        var neutral2020 = e2020Results - 4.5;

        var polls = null;

        if (year == '2024') {
            //Get average state shift to see what the projected neutral environment will be in 2024
            var shift1 = neutral2020 - neutral2016
            var shift2 = neutral2016 - neutral2012

            var neutralProjectedOnShift = neutral2020 + ((shift1 + shift2) / 2);

            //Compare national polls and state polls to see what the polls think the neutral environment of the state will be in 2024
            polls = s.Polls;
            var neutralProjectedOnPolls = polls - pollingAverage;

            //Average the above
            //console.log(polls);
            if (polls != null){
                var neutralProjected = (neutralProjectedOnPolls + neutralProjectedOnShift) / 2
            }
            else{
                var neutralProjected = neutralProjectedOnShift;
            }
        }

        if (year == '2020') {
            //Get average state shift to see what the projected neutral environment will be in 2024
            var shift1 = neutral2016 - neutral2012
            var shift2 = neutral2012 - neutral2008

            var neutralProjectedOnShift = neutral2016 + ((shift1 + shift2) / 2);

            //Compare national polls and state polls to see what the polls think the neutral environment of the state will be in 2024
            polls = s.Polls2020;
            var neutralProjectedOnPolls = polls - pollingAverage;

            //Average the above
            var neutralProjected = (neutralProjectedOnPolls + neutralProjectedOnShift) / 2
        }
        if (year == '2016') {
            //Get average state shift to see what the projected neutral environment will be in 2024
            var shift1 = neutral2012 - neutral2008
            var shift2 = neutral2008 - neutral2004

            var neutralProjectedOnShift = neutral2012 + ((shift1 + shift2) / 2);

            //Compare national polls and state polls to see what the polls think the neutral environment of the state will be in 2024
            polls = s.Polls2016
            var neutralProjectedOnPolls = polls - pollingAverage;

            //Average the above
            var neutralProjected = (neutralProjectedOnPolls + neutralProjectedOnShift) / 2
        }
        if (year == '2012') {
            //Get average state shift to see what the projected neutral environment will be in 2024
            var shift1 = neutral2008 - neutral2004
            var shift2 = neutral2004 - neutral2000

            var neutralProjectedOnShift = neutral2008 + ((shift1 + shift2) / 2);

            //Compare national polls and state polls to see what the polls think the neutral environment of the state will be in 2024
            var polls = s.Polls2012;
            var neutralProjectedOnPolls = polls - pollingAverage;

            //Average the above
            var neutralProjected = (neutralProjectedOnPolls + neutralProjectedOnShift) / 2
            var polls2012 = s.Polls2012;
        }
        //---------------------------------------Election Model Portion-------------------------------------------------------------
        var outcomesArray = [];

        //Basic Model using the polling average, account for state poll inaccuracyy by +- 4
        //We'll need to account for polling error in states and nationally to get result so we do a nested for loop
        var maxD = neutralProjectedOnPolls + pollingErrorInMonth + 6;
        var maxR = neutralProjectedOnPolls - pollingErrorInMonth - 6;

        if (polls == null) {

        } else {
            while (maxR < (maxD + .1)) {
                var maxDNat = maxDPopularVote;
                var maxRNat = maxRPopularVote;
                while (maxRNat < (maxDNat + .1)) {
                    var outcome = maxR + maxRNat;
                    outcomesArray.push(outcome);
                    outcomesArray.push(outcome);
                    maxRNat = maxRNat + .5;
                }
                maxR = maxR + .5;
            }
        }
        //Basic Model using the expected shift
        var maxD = neutralProjectedOnShift + 6;
        var maxR = neutralProjectedOnShift - 6;

        while (maxR < (maxD + .1)) {
            var maxDNat = maxDPopularVote;
            var maxRNat = maxRPopularVote;
            while (maxRNat < (maxDNat + .1)) {
                var outcome = maxR + maxRNat;
                outcomesArray.push(outcome);
                outcomesArray.push(outcome);
                maxRNat = maxRNat + .5;
            }
            maxR = maxR + .5;
        }

        //Basic Model using the last election 
        if (year == "2024") {
            var maxD = e2020Results + 4;
            var maxR = e2020Results - 4;

            while (maxR < (maxD + .1)) {
                var maxDNat = 3;
                var maxRNat = -3;
                while (maxRNat < (maxDNat + .1)) {
                    var outcome = maxR + maxRNat;
                    outcomesArray.push(outcome);
                    maxRNat = maxRNat + .5;
                }
                maxR = maxR + .5;
            }
        }
        if (year == "2020") {
            var maxD = e2016Results + 4;
            var maxR = e2016Results - 4;

            while (maxR < (maxD + .1)) {
                var maxDNat = 3;
                var maxRNat = -3;
                while (maxRNat < (maxDNat + .1)) {
                    var outcome = maxR + maxRNat;
                    outcomesArray.push(outcome);
                    maxRNat = maxRNat + .5;
                }
                maxR = maxR + .5;
            }
        }
        if (year == "2016") {
            var maxD = e2012Results + 4;
            var maxR = e2012Results - 4;

            while (maxR < (maxD + .1)) {
                var maxDNat = 3;
                var maxRNat = -3;
                while (maxRNat < (maxDNat + .1)) {
                    var outcome = maxR + maxRNat;
                    outcomesArray.push(outcome);
                    maxRNat = maxRNat + .5;
                }
                maxR = maxR + .5;
            }
        }
        if (year == "2012") {
            var maxD = e2008Results + 4;
            var maxR = e2008Results - 4;

            while (maxR < (maxD + .1)) {
                var maxDNat = 3;
                var maxRNat = -3;
                while (maxRNat < (maxDNat + .1)) {
                    var outcome = maxR + maxRNat;
                    outcomesArray.push(outcome);
                    maxRNat = maxRNat + .5;
                }
                maxR = maxR + .5;
            }
        }
        //Basic Model using the expected shift
        var maxD = neutralProjected + 12;
        var maxR = neutralProjected - 12;

        while (maxR < (maxD + .1)) {
            var maxDNat = maxDPopularVote + 4;
            var maxRNat = maxRPopularVote - 4;
            while (maxRNat < (maxDNat + .1)) {
                var outcome = maxR + maxRNat;
                outcomesArray.push(outcome);
                outcomesArray.push(outcome);
                maxRNat = maxRNat + .5;
            }
            maxR = maxR + .5;
        }

        //sort array and count number of times Dem wins to get a percentage and median outcome
        var numDWins = 0;

        var i = 0;
        while (i < outcomesArray.length) {
            var result = outcomesArray[i];
            if (result > 0) {
                numDWins = numDWins + 1;
            }
            i = i + 1;
        }

        //sort array
        outcomesArray.sort((a, b) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });

        //Get Percent chance and median outcome
        var percentDWin = numDWins / outcomesArray.length;
        var medianN = ~~(outcomesArray.length / 2);
        var median = outcomesArray[medianN];

        //String that will show when state is hovered over
        if (year == '2024') {
            infoBoxString = s.State + "\nElection 2020 Results: " + e2020Results + "\nProj. 2024 Result: " + median + "\nDemocrat Win %: " + percentDWin * 100 + "\n2024 Polling Average: " + s.Polls;
        }
        if (year == '2020') {
            infoBoxString = s.State + "\nActual 2020 Results: " + e2020Results + "\nProj. 2020 Result: " + median + "\nDemocrat Win %: " + percentDWin * 100 + "\n2020 Polling Average: " + s.Polls2020;
        }
        if (year == '2016') {
            infoBoxString = s.State + "\nActual 2016 Results: " + e2016Results + "\nProj. 2016 Result: " + median + "\nDemocrat Win %: " + percentDWin * 100 + "\n2016 Polling Average: " + s.Polls2016;
        }
        if (year == '2012') {
            infoBoxString = s.State + "\nActual 2012 Results: " + e2012Results + "\nProj. 2012 Result: " + median + "\nDemocrat Win %: " + percentDWin * 100 + "\n2012 Polling Average: " + s.Polls2012;
        }
        //This is the state data obbject that is put into the array-------------------------------------------------------
        let stateData = {
            State: stateName,
            StateAbbreviation: s.Abbr,
            Election2000Results: e2000Results,
            Election2004Results: e2004Results,
            Election2008Results: e2008Results,
            Election2012Results: e2012Results,
            Election2016Results: e2016Results,
            Election2020Results: e2020Results,

            Election2000ResultsNeutral: neutral2000,
            Election2004ResultsNeutral: neutral2004,
            Election2008ResultsNeutral: neutral2008,
            Election2012ResultsNeutral: neutral2012,
            Election2016ResultsNeutral: neutral2016,
            Election2020ResultsNeutral: neutral2020,

            ElectionNeutralProjectedShift: neutralProjectedOnShift,
            ElectionNeutralProjectedPolls: neutralProjectedOnPolls,
            ElectionNeutralProjected: neutralProjected,

            ChanceOfDWin: percentDWin,
            MedianOutcome: median,

            InfoBoxString: infoBoxString
        };
        statesArray.push(stateData);
    });
}

//Set the colors to results
function setColorsBasedOnResults(year) {
    for (var i = 0; i < senateArray.length; i++) {
        var stateName = senateArray[i].State;
        svgState = document.getElementById(stateName);
        try { svgState.style.fill = 'transparent'; } catch { }

    }

    // Clear Segments so they can be reloaded
    const segments = document.querySelectorAll('.color-segment');

    segments.forEach(segment => {
        // Get width and color from data attributes
        const width = segment.getAttribute('data-width');
        const color = segment.getAttribute('data-color');

        // Apply width and color to the segment
        segment.style.width = `${0}%`;
        segment.style.backgroundColor = color;
    });
    var width1 = 0;
    var width2 = 0;
    var width3 = 0;
    var width4 = 0;
    var width5 = 0;
    var width6 = 0;
    var width7 = 0;
    var width8 = 0;
    var width9 = 0;
    var width10 = 0;
    var width11 = 0;
    var width12 = 0;
    var width13 = 0;
    var width14 = 0;
    var width15 = 0;
    var width16 = 0;

    var percent = (1 / 100) * 100

    if(electionyear == "2022"){
        var width1 = 36
        var width16 = 29

    }
    if(electionyear == "2020"){
        var width1 = 35
        var width16 = 30

    }
    if(electionyear == "2018"){
        var width1 = 24
        var width16 = 42

    }
    
    for (var i = 0; i < senateArray.length; i++) {
        var stateYear = senateArray[i].ElectionYear;


        if (stateYear == electionyear){

            if (year == '2022') {
                var stater = senateArray[i].Election2022ResultS;
                var RSeats = '49'
                var DSeats = '51'
            }
            if (year == '2020') {
                var stater = senateArray[i].Election2020ResultS;
                var RSeats = '50'
                var DSeats = '50'
            }
            if (year == '2018') {
                var stater = senateArray[i].Election2018ResultS;
                var RSeats = '53'
                var DSeats = '47'
            }
            console.log("Test")

            var stateAbbr = senateArray[i].State;
            svgState = document.getElementById(stateAbbr);

            if (stater > 25) {
                try { svgState.style.fill = 'rgb(19, 25, 109)'; } catch { }
                width2 = width2 + percent;
            }
            else if (stater > 20) {
                try { svgState.style.fill = 'rgb(24, 31, 121)'; } catch { }
                width3 = width3 + percent;
            }
            else if (stater > 15) {
                try { svgState.style.fill = 'rgb(41, 48, 141)'; } catch { }
                width4 = width4 + percent;
            }
            else if (stater > 10) {
                try { svgState.style.fill = 'rgb(63, 71, 167)'; } catch { }
                width5 = width5 + percent;
            }
            else if (stater > 5) {
                try { svgState.style.fill = 'rgb(95, 102, 197)'; } catch { }
                width6 = width6 + percent;
            }
            else if (stater > 1) {
                try { svgState.style.fill = 'rgb(129, 135, 216)'; } catch { }
                width7 = width7 + percent;
            }
            else if (stater > 0) {
                try { svgState.style.fill = 'rgb(173, 178, 242)'; } catch { }
                width8 = width8 + percent;
            }
            else if (stater > -1) {
                try { svgState.style.fill = 'rgb(242, 173, 173)'; } catch { }
                width9 = width9 + percent;
            }
            else if (stater > -5) {
                try { svgState.style.fill = 'rgb(215, 128, 128)'; } catch { }
                width10 = width10 + percent;

            }
            else if (stater > -10) {
                try { svgState.style.fill = 'rgb(195, 93, 93)'; } catch { }
                width11 = width11 + percent;

            }
            else if (stater > -15) {
                try { svgState.style.fill = 'rgb(163, 59, 59)'; } catch { }
                width12 = width12 + percent;
            }
            else if (stater > -20) {
                try { svgState.style.fill = 'rgb(137, 37, 37)'; } catch { }
                width13 = width13 + percent;
            }
            else if (stater > -25) {
                try { svgState.style.fill = 'rgb(121, 24, 24)'; } catch { }
                width14 = width14 + percent;

            }
            else {
                try { svgState.style.fill = 'rgb(105, 15, 15)'; } catch { }
                width15 = width15 + percent;

            }
        }
    }
    segments[0].style.width = `${width1}%`;
    segments[1].style.width = `${width2}%`;
    segments[2].style.width = `${width3}%`;
    segments[3].style.width = `${width4}%`;
    segments[4].style.width = `${width5}%`;
    segments[5].style.width = `${width6}%`;
    segments[6].style.width = `${width7}%`;
    segments[7].style.width = `${width8}%`;
    segments[8].style.width = `${width9}%`;
    segments[9].style.width = `${width10}%`;
    segments[10].style.width = `${width11}%`;
    segments[11].style.width = `${width12}%`;
    segments[12].style.width = `${width13}%`;
    segments[13].style.width = `${width14}%`;
    segments[14].style.width = `${width15}%`;
    segments[15].style.width = `${width16}%`;

    var element = document.querySelector('.RepBarcount');
    element.textContent = RSeats

    var element2 = document.querySelector('.DemBarcount');
    element2.textContent = DSeats
}


//Set the colors based on 2024 result
function setColorBasedOnChance() {
    // Clear Segments so they can be reloaded
    const segments = document.querySelectorAll('.color-segment');

    segments.forEach(segment => {
        // Get width and color from data attributes
        const width = segment.getAttribute('data-width');
        const color = segment.getAttribute('data-color');

        // Apply width and color to the segment
        segment.style.width = `${0}%`;
        segment.style.backgroundColor = color;
    });

    var width1 = 0;
    var width2 = 0;
    var width3 = 0;
    var width4 = 0;
    var width5 = 0;
    var width6 = 0;
    var width7 = 0;
    var width8 = 0;
    var width9 = 0;
    var width10 = 0;
    var width11 = 0;
    var width12 = 0;
    var width13 = 0;
    var width14 = 0;
    var width15 = 0;
    var width16 = 0;

    var percent = (1 / 100) * 100

    if(electionyear == "2024"){
        var width1 = 28
        var width16 = 38

        var DSeats = 28
        var RSeats = 38
    }

    if(electionyear == "2022"){
        var width1 = 36
        var width16 = 29

        var DSeats = 36
        var RSeats = 29
    }
    if(electionyear == "2020"){
        var width1 = 35
        var width16 = 30

        var DSeats = 35
        var RSeats = 30
    }
    if(electionyear == "2018"){
        var width1 = 24
        var width16 = 42

        var DSeats = 24
        var RSeats = 42
    }
    for (var i = 0; i < senateArray.length; i++) {
        var stateName = senateArray[i].State;
        svgState = document.getElementById(stateName);
        try { svgState.style.fill = 'transparent'; } catch { }

    }
    for (var i = 0; i < senateArray.length; i++) {
        var statePercent = senateArray[i].ChanceOfDWin;
        var stateName = senateArray[i].State;
        var stateYear = senateArray[i].ElectionYear;


        if (stateYear == electionyear){
        
            svgState = document.getElementById(stateName);

            
        if(statePercent > '.50'){
            DSeats++
        }else{
            RSeats++
        }


  if (statePercent == 1000) {
            try { svgState.style.fill = 'rgb(0, 12, 65)'; } catch { };
            width1 = width1 + percent;
        }
        else if (statePercent == -1000) {
            try { svgState.style.fill = 'rgb(65, 12, 0)'; } catch { }
            width16 = width16 + percent;
        }
        else if (statePercent > .99) {
            try { svgState.style.fill = 'rgb(19, 25, 109)'; } catch { }
            width2 = width2 + percent;
        }
        else if (statePercent > .95) {
            try { svgState.style.fill = 'rgb(24, 31, 121)'; } catch { }
            width3 = width3 + percent;
        }
        else if (statePercent > .9) {
            try { svgState.style.fill = 'rgb(41, 48, 141)'; } catch { }
            width4 = width4 + percent;
        }
        else if (statePercent > .8) {
            try { svgState.style.fill = 'rgb(63, 71, 167)'; } catch { }
            width5 = width5 + percent;
        }
        else if (statePercent > .7) {
            try { svgState.style.fill = 'rgb(95, 102, 197)'; } catch { }
            width6 = width6 + percent;
        }
        else if (statePercent > .6) {
            try { svgState.style.fill = 'rgb(129, 135, 216)'; } catch { }
            width7 = width7 + percent;
        }
        else if (statePercent > .5) {
            try { svgState.style.fill = 'rgb(173, 178, 242)'; } catch { }
            width8 = width8 + percent;
        }
        else if (statePercent > .4) {
            try { svgState.style.fill = 'rgb(242, 173, 173)'; } catch { }
            width9 = width9 + percent;
        }
        else if (statePercent > .3) {
            try { svgState.style.fill = 'rgb(215, 128, 128)'; } catch { }
            width10 = width10 + percent;
        }
        else if (statePercent > .2) {
            try { svgState.style.fill = 'rgb(195, 93, 93)'; } catch { }
            width11 = width11 + percent;
        }
        else if (statePercent > .1) {
            try { svgState.style.fill = 'rgb(163, 59, 59)'; } catch { }
            width12 = width12 + percent;
        }
        else if (statePercent > .05) {
            try { svgState.style.fill = 'rgb(137, 37, 37)'; } catch { }
            width13 = width13 + percent;
        }
        else if (statePercent > .01) {
            try { svgState.style.fill = 'rgb(121, 24, 24)'; } catch { }
            width14 = width14 + percent;
        }
        else {
            try { svgState.style.fill = 'rgb(105, 15, 15)'; } catch { }
            width15 = width15 + percent;
        }
        }
    }
    segments[0].style.width = `${width1}%`;
    segments[1].style.width = `${width2}%`;
    segments[2].style.width = `${width3}%`;
    segments[3].style.width = `${width4}%`;
    segments[4].style.width = `${width5}%`;
    segments[5].style.width = `${width6}%`;
    segments[6].style.width = `${width7}%`;
    segments[7].style.width = `${width8}%`;
    segments[8].style.width = `${width9}%`;
    segments[9].style.width = `${width10}%`;
    segments[10].style.width = `${width11}%`;
    segments[11].style.width = `${width12}%`;
    segments[12].style.width = `${width13}%`;
    segments[13].style.width = `${width14}%`;
    segments[14].style.width = `${width15}%`;
    segments[15].style.width = `${width16}%`;

    var element = document.querySelector('.RepBarcount');
    element.textContent = RSeats

    var element2 = document.querySelector('.DemBarcount');
    element2.textContent = DSeats
}

//Set the colors based on 2024 result
function mixColors(baseColor, tint, weight) {
    const base = baseColor.match(/\d+/g).map(Number);
    const tintColor = tint.match(/\d+/g).map(Number);
  
    const mixed = base.map((c, i) => Math.round(c * (1 - weight) + tintColor[i] * weight));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}


function setBackgroundColor() {
    let newColor;

    if (pollingAverage > 15) newColor = "rgb(41, 48, 141)"; // Blue
    else if (pollingAverage > 10) newColor = "rgb(49, 49, 129)";
    else if (pollingAverage > 8) newColor = "rgb(56, 50, 116)";
    else if (pollingAverage > 6) newColor = "rgb(63, 51, 104)";
    else if (pollingAverage > 4) newColor = "rgb(72, 52, 90)";
    else if (pollingAverage > 2) newColor = "rgb(78, 53, 80)";
    else if (pollingAverage >= 0) newColor = "rgb(87, 50, 73)";
    else if (pollingAverage > -2) newColor = "rgb(100, 47, 64)";
    else if (pollingAverage > -4) newColor = "rgb(111, 44, 56)";
    else if (pollingAverage > -6) newColor = "rgb(119, 42, 50)";
    else if (pollingAverage > -8) newColor = "rgb(127, 40, 44)";
    else newColor = "rgb(137, 37, 37)"; // Red

    try {
        document.documentElement.style.setProperty('--maincolor', newColor);
        
        const tint1 = 'rgba(0, 0, 0, 0.1)';  // 10% darker
        const tint2 = 'rgba(0, 0, 0, 0.275)'; // 27.5% darker

        document.documentElement.style.setProperty('--main2color', mixColors(newColor, tint1, 0.1));
        document.documentElement.style.setProperty('--main3color', mixColors(newColor, tint2, 0.275));
    } catch (error) {
        console.error("Error updating colors:", error);
    }
}

//Drop Down Menu

// Get the select element
const dropdown = document.getElementById('stateDropDown');
const numberInput = document.getElementById('numberInput');

numberInput.addEventListener('change', changeInputTypeNumber);

function populateDropDown(){
    // Array of options
    const optionsArray = [];
    senateArray.forEach(element => {
        //console.log("I am here")
        if (element.ElectionYear == "2024"){
            optionsArray.push(element.State);
        }
    });



    // Populate the drop-down menu
    optionsArray.forEach(option => {
        // Create a new option element
        const optionElement = document.createElement('option');
        optionElement.textContent = option; // Set the text of the option
        optionElement.value = option; // Set the value of the option

        // Append the option element to the select element
        dropdown.appendChild(optionElement);
    });


}

function handleClickEnterButton(){
    if(inputType == "slider"){
        numberInput.value = slider.value;
    }
    if(inputType == "number"){
        slider.value = numberInput.value;
    }

    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;
    // Get references to the input field and display area

    //console.log("I am here" + percent + " " + selectedState);


    for (var i = 0; i < senateArray.length; i++) {
        if (senateArray[i].State == selectedState && senateArray[i].ElectionYear == electionyear) {
            changeState = senateArray[i];
            found = true;
            console.log(senateArray[i]);
            break;
        }  
    }

    if(percent <= 100 && percent >= 0){
        console.log(senateArray[i].ChanceOfDWin)
        senateArray[i].ChanceOfDWin = percent / 100
        senateArray[i].InfoBoxString = senateArray[i].State + "\nElection 2020 Results: " + senateArray[i].Election2020Results + "\nProj. 2024 Result: " + senateArray[i].MedianOutcome + "\nDemocrat Win %: " + senateArray[i].ChanceOfDWin * 100  + "\n2024 Polling Average: " + senateArray[i].Polls;
        console.log(senateArray[i].ChanceOfDWin)
    }

    setColorBasedOnChance()
    getPercentDWin();
}

function handleClickCallButtonD(){
    const numberInput = document.getElementById('numberInput');
    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;
    // Get references to the input field and display area

    //console.log("I am here" + percent + " " + selectedState);


    for (var i = 0; i < senateArray.length; i++) {
        if (senateArray[i].State == selectedState && senateArray[i].ElectionYear == electionyear) {
            changeState = senateArray[i];
            found = true;
            console.log(senateArray[i]);
            break;
        }
  
    }

    senateArray[i].ChanceOfDWin = 1000
    senateArray[i].InfoBoxString = senateArray[i].State + "\nElection 2020 Results: " + senateArray[i].Election2020Results + "\nProj. 2024 Result: " + senateArray[i].MedianOutcome + "\nDemocrat Win %: " + senateArray[i].ChanceOfDWin * 100 + "\n2024 Polling Average: " + senateArray[i].Polls;

    setColorBasedOnChance()
    getPercentDWin();
}
function handleClickCallButtonR(){
    const numberInput = document.getElementById('numberInput');
    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;
    // Get references to the input field and display area

    console.log("I am here")

    for (var i = 0; i < senateArray.length; i++) {
        if (senateArray[i].State == selectedState && senateArray[i].ElectionYear == "2024") {
            changeState = senateArray[i];
            found = true;
            console.log(senateArray[i]);
            break;
        }
  
    }

    senateArray[i].ChanceOfDWin = -1000
    senateArray[i].InfoBoxString = senateArray[i].State + "\nElection 2020 Results: " + senateArray[i].Election2020Results + "\nProj. 2024 Result: " + senateArray[i].MedianOutcome + "\nDemocrat Win %: " + senateArray[i].ChanceOfDWin + "\n2024 Polling Average: " + senateArray[i].Polls;

    setColorBasedOnChance()
    getPercentDWin();
}

function getPercentDWin(){
    if (electionyear == '2024') {
        var DSeats = 28;
    }
    var count = 0;
    var DWins = 0;
    
    var DemSeatsArray = [];

    while (count < 1000) {
        if (electionyear == '2024') {
            var DSeats = 28;
        } else if (electionyear == '2022') {
            var DSeats = 36;
        } else if (electionyear == '2020') {
            var DSeats = 35;
        } else if (electionyear == '2018') {
            var DSeats = 24;
        }

        for (var i = 0; i < senateArray.length; i++) {
            let currentState = senateArray[i];     

            if (currentState.ElectionYear == electionyear) {
                var roll = Math.floor(Math.random() * 101); // Random number between 0-100

                if (roll < (currentState.ChanceOfDWin * 100)) {
                    DSeats += 1;
                }
            }
        }

        if (DSeats >= 50) {
            DWins++;
        }

        DemSeatsArray.push(DSeats);
        count++;
    }

    // Calculate Average Democratic Seats
    let sum = DemSeatsArray.reduce((acc, val) => acc + val, 0);
    let averageD = sum / DemSeatsArray.length;

    // Calculate Republican Wins & Seats
    let RWins = 1000 - DWins; // Republican wins are the remaining
    let averageR = 100 - averageD; // Republican seats = 100 - Democrat seats

    console.log(`Democrats win ${DWins}/1000 Times (${(DWins / 10).toFixed(2)}%) \nProjected Seats: ${averageD.toFixed(2)}`);
    console.log(`Republicans win ${RWins}/1000 Times (${(RWins / 10).toFixed(2)}%) \nProjected Seats: ${averageR.toFixed(2)}`);

    // Update Democrat UI
    document.getElementById('chanceOfDWin50').innerText = (DWins / 10).toFixed(2);
    document.getElementById('projectedSeatsD').innerText = averageD.toFixed(2);

    // Update Republican UI
    document.getElementById('chanceOfRWin50').innerText = (RWins / 10).toFixed(2);
    document.getElementById('projectedSeatsR').innerText = averageR.toFixed(2);
}


//Set Drop Down Menu to clicked state

document.addEventListener('DOMContentLoaded', function() {
    // Get all paths in the SVG
    const paths = document.querySelectorAll('svg path');
    const stateDropDown = document.getElementById('stateDropDown');

    paths.forEach(path => {
        path.addEventListener('click', function() {
            // Set the dropdown value to the clicked path's ID
            console.log(this.id)
            stateDropDown.value = this.id;
        });
    });
});


const slider = document.getElementById('sliderInput');
var inputType = "number"

// Event listener to run a function when slider is released
slider.addEventListener('change', handleClickEnterButton);
slider.addEventListener('input', changeInputTypeSlider);

function changeInputTypeSlider(){
    inputType = "slider"
}

function changeInputTypeNumber(){
    inputType = "number"
}
