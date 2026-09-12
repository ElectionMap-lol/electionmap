
//Array for State Data
const statesArray = [];
var pollingAverage = 0;
setBackgroundColor();

// Set backgroundColor based on polling average
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
        if ((s.Year == year || s.Year == (year - 1) || s.Year == (year - 2) || s.Year == (year - 3) )&& s.District == 'Gov'){
            
            //String that will show when state is hovered over
            if (year == '2028') {
                infoBoxString = s.State + "\nElection 2024 Results: " + formatStat(s.P2024) + "\nProj. Gov Result: " + formatStat(s.Median) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }
            if (year == '2024') {
                infoBoxString = s.State  + "\nActual 2024 Result: " + formatStat(s.Margin) + "\nProj. 2024 Result: " + formatStat(s.Median) + "\nElection 2020 Results: " + formatStat(s.P2020) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
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

// The governor page has no seat-share bar (no .color-segment / .Barcount elements),
// unlike the president and senate pages. Skip those writes instead of throwing,
// which used to abort the whole Papa Parse callback and stop getPercentDWin() running.
function updateShareBar(widths, dVotes, rVotes) {
    const segments = document.querySelectorAll('.color-segment');
    if (segments.length >= widths.length) {
        widths.forEach((width, i) => segments[i].style.width = `${width}%`);
    }

    const repCount = document.querySelector('.RepBarcount');
    if (repCount) repCount.textContent = rVotes;

    const demCount = document.querySelector('.DemBarcount');
    if (demCount) demCount.textContent = dVotes;
}

//Set the colors based on chances
function setColorBasedOnChance() {


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
        console.log(svgState)

        if (statePercent > '.50') {
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

    updateShareBar([width1, width2, width3, width4, width5, width6, width7, width8,
                    width9, width10, width11, width12, width13, width14, width15, width16],
                   DVotes, RVotes);
}

// Hover box displays info about state when hovered over
var tooltipSpan = document.getElementById('details-box');
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
window.onmousemove = function (e) {
    var x = e.clientX,
        y = e.clientY;
    tooltipSpan.style.top = (y + 20) + 'px';
    tooltipSpan.style.left = (x) + 'px';
};

// Attach a click handler only if that button exists on this page. Without the guard
// the first missing id threw and every later listener below was skipped.
function onClick(id, handler) {
    const button = document.getElementById(id);
    if (button) button.addEventListener('click', handler);
}

// Adding an event listener to the buttons
document.addEventListener('DOMContentLoaded', (event) => {
    // These are this page's own button ids. They used to be copied from the president
    // page ('2028 Model' etc.), which exist nowhere here, so the year buttons had never
    // done anything. setStatesValues takes a four-year window ending at the year passed,
    // which is what covers all 50 staggered governor terms.
    onClick('2025-2027', () => handleClick('2028'));            // window 2025-2028

    onClick('2021-2024 Results ', () => handleClickResults('2024'));  // trailing space is in the id

    onClick('enterButton', handleClickEnterButton);

    onClick('callButtonD', handleClickCallButtonD);

    onClick('callButtonR', handleClickCallButtonR);

});

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
    updateShareBar([width1, width2, width3, width4, width5, width6, width7, width8,
                    width9, width10, width11, width12, width13, width14, width15, width16],
                   DVotes, RVotes);
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
document.addEventListener('DOMContentLoaded', function () {
    // Get all paths in the SVG
    const paths = document.querySelectorAll('svg path');
    const stateDropDown = document.getElementById('stateDropDown');

    paths.forEach(path => {
        path.addEventListener('click', function () {
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

function changeInputTypeSlider() {
    inputType = "slider"
}
function changeInputTypeNumber() {
    inputType = "number"
}


function getPercentDWin() {
    // Governors have no electoral college, so this counts states. The old version was
    // copied from the president page: it summed an Evs column governor rows do not
    // have (so REV stayed 0 and the panel read "538" and "0.00"), and looked for a
    // 270 threshold that counting 50 states can never reach - which is why the Dem
    // chance was pinned at 100.00.
    const total = statesArray.length;
    const majority = Math.floor(total / 2) + 1;

    // Most Dem-friendly first, so the state that reaches a majority is the tipping point.
    statesArray.sort((a, b) => b.ChanceOfDWin - a.ChanceOfDWin);

    let demStates = 0;
    statesArray.forEach(state => { if (state.ChanceOfDWin > 0.5) demStates++; });

    const tippingPoint = statesArray.length >= majority
        ? statesArray[majority - 1].ChanceOfDWin
        : 0;
    const demChance = tippingPoint * 100;

    // formatStat rounds for display only, and does the subtraction as a number:
    // `100 - x.toFixed(2)` was string arithmetic and produced long floats.
    document.getElementById('chanceOfDWinState').innerText = formatStat(demChance);
    document.getElementById('projectedEVsD').innerText = demStates;

    document.getElementById('chanceOfRWinState').innerText = formatStat(100 - demChance);
    document.getElementById('projectedEVsR').innerText = total - demStates;
}
