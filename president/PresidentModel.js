
//Array for State Data
const statesArray = [];

// Set backgroundColor based on polling average

//Data 
const csvUrl = 'https://raw.githubusercontent.com/ElectionMap-lol/electionmap/refs/heads/main/ModelData/ElectionsData.csv';
// Use Papa Parse to fetch and parse the CSV file; runs when file loads
Papa.parse(csvUrl, {
    download: true,
    header: true, // Set to false if the CSV doesn't have headers
    dynamicTyping: true, // Convert types automatically
    skipEmptyLines: true, // Skip empty lines
    complete: function (results) {
        setStatesValues(results.data, '2028');
        populateDropDown();
        setColorBasedOnChance();
        getPercentDWin()

    },
    error: function (error) {
        console.error("Error parsing CSV:", error);
    }
});

//Process states and set values
function setStatesValues(states, year) {
    states.forEach(s => {
        if (s.Year == year && s.District == 'President'){
            
            //String that will show when state is hovered over
            if (year == '2028') {
                infoBoxString = s.State + "\nElection 2024 Results: " + formatStat(s.P2024) + "\nProj. 2028 Result: " + formatStat(s.Median) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }
            if (year == '2024') {
                infoBoxString = s.State  + "\nActual 2024 Result: " + formatStat(s.Margin) + "\nProj. 2024 Result: " + formatStat(s.Median) + "\nElection 2020 Results: " + formatStat(s.P2020) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }
            if (year == '2020') {
                infoBoxString = s.State  + "\nActual 2020 Result: " + formatStat(s.Margin) + "\nProj. 2020 Result: " + formatStat(s.Median) + "\nElection 2016 Results: " + formatStat(s.P2016) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }
            if (year == '2016') {
                infoBoxString = s.State  + "\nActual 2016 Result: " + formatStat(s.Margin) + "\nProj. 2016 Result: " + formatStat(s.Median) + "\nElection 2012 Results: " + formatStat(s.P2012) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }
            if (year == '2012') {
                infoBoxString = s.State  + "\nActual 2012 Result: " + formatStat(s.Margin) + "\nProj. 2012 Result: " + formatStat(s.Median) + "\nElection 2008 Results: " + formatStat(s.P2008) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }
            //This is the state data obbject that is put into the array-------------------------------------------------------
            let stateData = {
                
                StateAbbreviation: s.StateA,  
                State: s.State,           
                ChanceOfDWin: s.Chance,
                MedianOutcome: s.Median,
                ElectoralVotes: s.Evs,
                InfoBoxString: infoBoxString,
                Result: s.Margin,

                Election2000Results: s.P2000,
                Election2004Results: s.P2004,
                Election2008Results: s.P2008,
                Election2012Results: s.P2012,
                Election2016Results: s.P2016,
                Election2020Results: s.P2020,
                Election2024Results: s.P2024
    
            };
            statesArray.push(stateData);
        }
    })

}

//Set the colors based on chances
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

    var DVotes = 0;
    var RVotes = 0;

    for (var i = 0; i < statesArray.length; i++) {

        var statePercent = statesArray[i].ChanceOfDWin;
        var stateAbbr = statesArray[i].StateAbbreviation;
        var stateEV = statesArray[i].ElectoralVotes

        var percent = (stateEV / 538) * 100

        svgState = document.getElementById(stateAbbr);

        if (statePercent > 0.5) {
            DVotes = DVotes + stateEV
        } else {
            RVotes = RVotes + stateEV
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
            try { svgState.style.fill = 'rgb(173, 178, 242)'; } catch { 
            }
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
    element.textContent = RVotes

    var element2 = document.querySelector('.DemBarcount');
    element2.textContent = DVotes
}

// Hover box displays info about state when hovered over
document.addEventListener('mouseover', function (e) {
    if (e.target.tagName == 'path') {

        var stateName = e.target.dataset.name;
        var stateAbbr = e.target.dataset.id;

        var hoveredState = null;
        var found = false;
        for (var i = 0; i < statesArray.length; i++) {
            if (statesArray[i].State == stateName) {
                hoveredState = statesArray[i];
                found = true;
                break;
            }
        }

        //document.getElementById("details-box").innerHTML = stateName + "\n" + stateAbbr + "\n2020 Result: " + hoveredState.Election2020Results;
        document.getElementById("details-box").innerHTML = hoveredState.InfoBoxString 
        //+ "-" + hoveredState.Abbr;
        document.getElementById("details-box").style.opacity = "100%";
    }
    else {
        document.getElementById("details-box").style.opacity = "0%";
    }
});

// Adding an event listener to the buttons

function handleClick(year){
    statesArray.length = 0;
    // Use Papa Parse to fetch and parse the CSV file

    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            setStatesValues(results.data, year);
            setColorBasedOnChance();
            getPercentDWin()
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

}

function handleClickResults(year) {
    statesArray.length = 0;
    document.documentElement.style.setProperty('--maincolor', 'rgb(137, 37, 37)');
    
    // Update tints based on new main color
    updateTintedColors();
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            setStatesValues(results.data, year);
            setColorsBasedOnResults(year);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

}



//Set the colors to results
function setColorsBasedOnResults(year) {

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

    var DVotes = 0;
    var RVotes = 0;


    for (var i = 0; i < statesArray.length; i++) {

        if (year == '2024') {
            DVotes = '226'
            RVotes = '312'
            var stater = statesArray[i].Election2024Results;
        }

        if (year == '2020') {
            DVotes = '306'
            RVotes = '232'
            var stater = statesArray[i].Election2020Results;
        }
        if (year == '2016') {
            DVotes = '232'
            RVotes = '306'
            var stater = statesArray[i].Election2016Results;
        }
        if (year == '2012') {
            DVotes = '332'
            RVotes = '206'
            var stater = statesArray[i].Election2012Results;
        }
        var stateAbbr = statesArray[i].StateAbbreviation;
        svgState = document.getElementById(stateAbbr);
        var stateEV = statesArray[i].ElectoralVotes
        var percent = (stateEV / 538) * 100

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
    element.textContent = RVotes

    var element2 = document.querySelector('.DemBarcount');
    element2.textContent = DVotes

    // A finished election is settled, so the background goes hard for the winner.
    paintResultBackground(DVotes >= RVotes ? 1 : -1);
}

//Drop Down Menu

// Get the select element
const dropdown = document.getElementById('stateDropDown');
const numberInput = document.getElementById('numberInput');

numberInput.addEventListener('change', changeInputTypeNumber);

function populateDropDown() {
    // Array of options
    const optionsArray = [];
    statesArray.forEach(element => {
        optionsArray.push(element.StateAbbreviation);
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

function handleClickEnterButton() {

    if (inputType == "slider") {
        numberInput.value = slider.value;
    }
    if (inputType == "number") {
        slider.value = numberInput.value;
    }

    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;
    // Get references to the input field and display area

    for (var i = 0; i < statesArray.length; i++) {
        if (statesArray[i].StateAbbreviation == selectedState) {
            changeState = statesArray[i];
            found = true;
            break;
        }
    }

    if (percent <= 100 && percent >= 0) {
        statesArray[i].ChanceOfDWin = percent / 100
        statesArray[i].InfoBoxString = statesArray[i].State + "\nElection 2020 Results: " + statesArray[i].Election2020Results + "\nProj. 2024 Result: " + statesArray[i].MedianOutcome + "\nDemocrat Win %: " + (statesArray[i].ChanceOfDWin * 100) + "\n2024 Polling Average: " + statesArray[i].Polls;
    }

    setColorBasedOnChance()
    getPercentDWin() 
}

function handleClickCallButtonD() {
    const numberInput = document.getElementById('numberInput');
    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;
    // Get references to the input field and display area
    for (var i = 0; i < statesArray.length; i++) {
        if (statesArray[i].StateAbbreviation == selectedState) {
            changeState = statesArray[i];
            found = true;
            break;
        }

    }
    statesArray[i].ChanceOfDWin = 1000
    statesArray[i].InfoBoxString = statesArray[i].State + "\nElection 2020 Results: " + statesArray[i].Election2020Results + "\nProj. 2024 Result: " + statesArray[i].MedianOutcome + "\nDemocrat Win %: " + statesArray[i].ChanceOfDWin * 100 + "\n2024 Polling Average: " + statesArray[i].Polls;

    setColorBasedOnChance()
    getPercentDWin();
}
function handleClickCallButtonR() {

    const numberInput = document.getElementById('numberInput');
    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;
    // Get references to the input field and display area
    for (var i = 0; i < statesArray.length; i++) {
        if (statesArray[i].StateAbbreviation == selectedState) {
            changeState = statesArray[i];
            found = true;
            break;
        }

    }
    statesArray[i].ChanceOfDWin = -1000
    statesArray[i].InfoBoxString = statesArray[i].State + "\nElection 2020 Results: " + statesArray[i].Election2020Results + "\nProjected 2024 Result: " + statesArray[i].MedianOutcome + "\nDemocrat Win %: " + statesArray[i].ChanceOfDWin * 100 + "\n2024 Polling Average: " + statesArray[i].Polls;

    setColorBasedOnChance()
    getPercentDWin() 
}
//Set Drop Down Menu to clicked state

const slider = document.getElementById('sliderInput');
var inputType = "number"

// Event listener to run a function when slider is released
slider.addEventListener('change', handleClickEnterButton);
slider.addEventListener('input', changeInputTypeSlider);

function changeInputTypeSlider() {
    inputType = "slider"
}
function changeInputTypeNumber() {
    inputType = "number"
}


function getPercentDWin() {
    var DEV = 0;
    var DWins = 0;
    var count = 0;
    var totalEVs = 538; // Total Electoral Votes

    statesArray.sort((a, b) => a.ChanceOfDWin - b.ChanceOfDWin);

    REV = 0
    DEV = 0
    totalEVs = 0
    tippingPoint = .5;
    for (var i = 0; i < statesArray.length; i++) {
        
        
        if (statesArray[i].ChanceOfDWin < .5){
            REV = REV + statesArray[i].ElectoralVotes
        }
        if(totalEVs < 270){
            totalEVs = totalEVs + statesArray[i].ElectoralVotes
            tippingPoint = statesArray[i].ChanceOfDWin
            if (totalEVs > 270){
                tippingPoint = statesArray[i].ChanceOfDWin
            }
        }
    }
    tippingPoint = tippingPoint * 100
    // Update Democrat UI
    document.getElementById('chanceOfDWinState').innerText = tippingPoint.toFixed(2);
    document.getElementById('projectedEVsD').innerText = 538 - REV

    // Update Republican UI
    document.getElementById('chanceOfRWinState').innerText = (100 - tippingPoint).toFixed(2);
    document.getElementById('projectedEVsR').innerText = REV

    // 80% of the electoral college either way is as blue or as red as it gets.
    paintResultBackground(resultLean(538 - REV, 269, 538 * 0.8));
}
