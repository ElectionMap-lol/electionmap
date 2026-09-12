
//Data 
const csvUrl = 'https://raw.githubusercontent.com/ElectionMap-lol/electionmap/refs/heads/main/ModelData/ElectionsData.csv';

//Array for State Data
const houseArray = [];
electionyear = '2026'


// Use Papa Parse to fetch and parse the CSV file; runs when file loads
Papa.parse(csvUrl, {
    download: true,
    header: true, // Set to false if the CSV doesn't have headers
    dynamicTyping: true, // Convert types automatically
    skipEmptyLines: true, // Skip empty lines
    complete: function (results) {
        processDistricts(results.data, '2026');
        setColorBasedOnChance('2026');
        getPercentDWin();
        populateDropDown();
    },
    error: function (error) {
        console.error("Error parsing CSV:", error);
    }
});

// Hover box displays info about state when hovered over
document.addEventListener('mouseover', function (e) {
    if (e.target.tagName == 'path') {
        var stateName = e.target.dataset.name;
        var stateAbbr = e.target.dataset.id;
        var hoveredState = null;
        var found = false;
        for (var i = 0; i < houseArray.length; i++) {
            if (houseArray[i].District == stateAbbr) { 
                if(houseArray[i].ElectionYear == electionyear){
                    hoveredState = houseArray[i];
                    found = true;
                    
                    var output = houseArray[i].InfoBoxString;
                    //console.log(output)
                    break;
                }              
            }
        }
        if (found) {
            document.getElementById("details-box").innerHTML = output;
            document.getElementById("details-box").style.opacity = "100%";
        }
    }
    else {
        document.getElementById("details-box").style.opacity = "0%";
    }
});

function processDistricts(states, year) {
    electionyear = year
    //cycle through each states and parse the data as needed
    states.forEach(s => {
        if (s.Year == year && s.State == 'House'){
            //console.log(s)
            if (s.IncumbentParty == 'D'){
                incumbent = s.Dcandidate
            }else if (s.IncumbentParty == 'R'){
                incumbent = s.Rcandidate
            }else if (s.IncumbentParty == 'I'){
                incumbent = s.OCandidate
            }else{
                incumbent = 'OPEN'
            }

            if (year == '2026') {
                infoBoxString = s.District  + "\nIncumbent: " + incumbent + "\nIncumbent Strength: " + formatStat(s.IncOverPerformance) + "\nProj. 2026 Result: " + formatStat(s.Median) + "\nElection 2024 Results: " + formatStat(s.P2024) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%"

            }
            if (year == '2024') {
                infoBoxString = s.District  + "\nIncumbent: " + incumbent + "\nIncumbent Strength: " + formatStat(s.IncOverPerformance) + "\nActual 2024 Result: " + formatStat(s.Margin) + "\nProj. 2024 Result: " + formatStat(s.Median) + "\nElection 2020 Results: " + formatStat(s.P2020) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%"

            }
            //console.log(infoBoxString)
            //Data for array -----------------------------------------------------
            let stateData = {
                District: s.District,  
                ElectionYear: year,
                Incumbent: incumbent,   
                IncumbentParty: s.IncumbentParty,        
                ChanceOfDWin: s.Chance,
                MedianOutcome: s.Median,
                InfoBoxString: infoBoxString,
                Result: s.Margin,

                Election2012Results: s.P2012,
                Election2016Results: s.P2016,
                Election2020Results: s.P2020,
                Election2024Results: s.P2024
            };
            houseArray.push(stateData);
        }
    });
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

    var percent = (1 / 435) * 100

    var DSeats = 0
    var RSeats = 0

    for (var i = 0; i < houseArray.length; i++) {

        var districtPercent = houseArray[i].ChanceOfDWin;
        var districtAbbr = houseArray[i].District;
        svgDistrict = document.getElementById(districtAbbr);

        if (districtPercent > 0.5) {
            DSeats++
        } else {
            RSeats++
        }


        if (districtPercent == 1000) {

            try { svgDistrict.style.fill = 'rgb(0, 12, 65)'; } catch { }
            width1 = width1 + percent;
        }
        else if (districtPercent == -1000) {
            try { svgDistrict.style.fill = 'rgb(65, 12, 0)'; } catch { }
            width16 = width16 + percent;
        }
        else if (districtPercent > .99) {
            try { svgDistrict.style.fill = 'rgb(19, 25, 109)'; } catch { }
            width2 = width2 + percent;
        }
        else if (districtPercent > .95) {
            try { svgDistrict.style.fill = 'rgb(24, 31, 121)'; } catch { }
            width3 = width3 + percent;
        }
        else if (districtPercent > .9) {
            try { svgDistrict.style.fill = 'rgb(41, 48, 141)'; } catch { }
            width4 = width4 + percent;
        }
        else if (districtPercent > .8) {
            try { svgDistrict.style.fill = 'rgb(63, 71, 167)'; } catch { }
            width5 = width5 + percent;
        }
        else if (districtPercent > .7) {
            try { svgDistrict.style.fill = 'rgb(95, 102, 197)'; } catch { }
            width6 = width6 + percent;
        }
        else if (districtPercent > .6) {
            try { svgDistrict.style.fill = 'rgb(129, 135, 216)'; } catch { }
            width7 = width7 + percent;
        }
        else if (districtPercent > .5) {
            try { svgDistrict.style.fill = 'rgb(173, 178, 242)'; } catch { }
            width8 = width8 + percent;
        }
        else if (districtPercent > .4) {
            try { svgDistrict.style.fill = 'rgb(242, 173, 173)'; } catch { }
            width9 = width9 + percent;
        }
        else if (districtPercent > .3) {
            try { svgDistrict.style.fill = 'rgb(215, 128, 128)'; } catch { }
            width10 = width10 + percent;
        }
        else if (districtPercent > .2) {
            try { svgDistrict.style.fill = 'rgb(195, 93, 93)'; } catch { }
            width11 = width11 + percent;
        }
        else if (districtPercent > .1) {
            try { svgDistrict.style.fill = 'rgb(163, 59, 59)'; } catch { }
            width12 = width12 + percent;
        }
        else if (districtPercent > .05) {
            try { svgDistrict.style.fill = 'rgb(137, 37, 37)'; } catch { }
            width13 = width13 + percent;
        }
        else if (districtPercent > .01) {
            try { svgDistrict.style.fill = 'rgb(121, 24, 24)'; } catch { }
            width14 = width14 + percent;
        }
        else {
            try { svgDistrict.style.fill = 'rgb(105, 15, 15)'; } catch { }
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
    element.textContent = RSeats

    var element2 = document.querySelector('.DemBarcount');
    element2.textContent = DSeats

}
// Adding an event listener to the buttons



function handleClick(year){
    houseArray.length = 0;
    // Use Papa Parse to fetch and parse the CSV file
    electionyear = year
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processDistricts(results.data, year);
            setColorBasedOnChance(year);
            getPercentDWin();
            populateDropDown();
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
}

function handleClickResults(year){
    houseArray.length = 0;
    // Use Papa Parse to fetch and parse the CSV file
    year2 = year
    if(year2 == '2024p'){
        year2 = 2024
    }
    if(year2 == '2020p'){
        year2 = 2024
    }
    if(year2 == '2016p'){
        year2 = 2024
    }
    if(year2 == '2012p'){
        year2 = 2024
    }

    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processDistricts(results.data, year2);
            setColorBasedOnResult(year);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

}

function setColorBasedOnResult(year) {
    // This function only ever coloured districts, so the seat split is counted here
    // to drive the background.
    var demDistricts = 0;
    var decided = 0;
    for (var i = 0; i < houseArray.length; i++) {
        if (year == "2024p") {
            var districtPercent = houseArray[i].Election2024Results;
        }
        if (year == "2020p") {
            var districtPercent = houseArray[i].Election2020Results;
        }
        if (year == "2016p") {
            var districtPercent = houseArray[i].Election2016Results;
        }
        if (year == "2012p") {
            var districtPercent = houseArray[i].Election2012Results;
        }
        if (year == "2022") {
            var districtPercent = houseArray[i].Result;
        }
        if (year == "2024") {
            var districtPercent = houseArray[i].Result;
        }
        if (typeof districtPercent === 'number' && isFinite(districtPercent)) {
            decided++;
            if (districtPercent > 0) demDistricts++;
        }

        var districtAbbr = houseArray[i].District;
        svgDistrict = document.getElementById(districtAbbr);


        if (districtAbbr == "MT02") {
        }

        if (districtPercent > 25) {
            try { svgDistrict.style.fill = 'rgb(19, 25, 109)'; } catch { }
        } else if (districtPercent == null) {
            try { svgDistrict.style.fill = 'rgba(0, 0, 0, 0.15)'; } catch { }
        }
        else if (districtPercent > 20) {
            try { svgDistrict.style.fill = 'rgb(24, 31, 121)'; } catch { }
        }
        else if (districtPercent > 15) {
            try { svgDistrict.style.fill = 'rgb(41, 48, 141)'; } catch { }
        }
        else if (districtPercent > 10) {
            try { svgDistrict.style.fill = 'rgb(63, 71, 167)'; } catch { }
        }
        else if (districtPercent > 5) {
            try { svgDistrict.style.fill = 'rgb(95, 102, 197)'; } catch { }
        }
        else if (districtPercent > 1) {
            try { svgDistrict.style.fill = 'rgb(129, 135, 216)'; } catch { }
        }
        else if (districtPercent > 0) {
            try { svgDistrict.style.fill = 'rgb(173, 178, 242)'; } catch { }
        }
        else if (districtPercent > -1) {
            try { svgDistrict.style.fill = 'rgb(242, 173, 173)'; } catch { }
        }
        else if (districtPercent > -5) {
            try { svgDistrict.style.fill = 'rgb(215, 128, 128)'; } catch { }
        }
        else if (districtPercent > -10) {
            try { svgDistrict.style.fill = 'rgb(195, 93, 93)'; } catch { }
        }
        else if (districtPercent > -15) {
            try { svgDistrict.style.fill = 'rgb(163, 59, 59)'; } catch { }
        }
        else if (districtPercent > -20) {
            try { svgDistrict.style.fill = 'rgb(137, 37, 37)'; } catch { }
        }
        else if (districtPercent > -25) {
            try { svgDistrict.style.fill = 'rgb(121, 24, 24)'; } catch { }
        }
        else if (districtPercent > -100) {
            try { svgDistrict.style.fill = 'rgb(105, 15, 15)'; } catch { }
        } else {
            try { svgDistrict.style.fill = 'rgba(0, 0, 0, 0.15)'; } catch { }
        }
    }

    // A finished election is settled, so the background goes hard for the winner.
    if (decided) paintResultBackground(demDistricts * 2 >= decided ? 1 : -1);
}


//Drop Down Menu

// Get the select element
const dropdown = document.getElementById('stateDropDown');
const numberInput = document.getElementById('numberInput');

numberInput.addEventListener('change', changeInputTypeNumber);

function populateDropDown() {
    // Array of options
    const optionsArray = [];
    houseArray.forEach(element => {
        optionsArray.push(element.District);
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
//Set Drop Down Menu to clicked state


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


    for (var i = 0; i < statesArray.length; i++) {
        if (statesArray[i].StateAbbreviation == selectedState && statesArray[i].ElectionYear == electionyear) {
            changeState = statesArray[i];
            found = true;
            break;
        }  
    }

    if(percent <= 100 && percent >= 0){
        houseArray[i].ChanceOfDWin = percent / 100
        //senateArray[i].InfoBoxString = senateArray[i].State + "\nElection 2020 Results: " + senateArray[i].Election2020Results + "\nProj. 2024 Result: " + senateArray[i].MedianOutcome + "\nDemocrat Win %: " + senateArray[i].ChanceOfDWin * 100  + "\n2024 Polling Average: " + senateArray[i].Polls;
    }

    setColorBasedOnChance(electionyear)
    getPercentDWin();
}

function handleClickCallButtonD(){
    const numberInput = document.getElementById('numberInput');
    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;

    // Get references to the input field and display area
    for (var i = 0; i < houseArray.length; i++) {
        if (houseArray[i].District == selectedState) {
            changeState = houseArray[i];
            found = true;
            break;
        }
  
    }
    houseArray[i].ChanceOfDWin = 1000
    setColorBasedOnChance(electionyear)
    getPercentDWin();
}
function handleClickCallButtonR(){
    const numberInput = document.getElementById('numberInput');
    var percent = numberInput.value || 'None';
    var selectedState = dropdown.value;
    // Get references to the input field and display area

    for (var i = 0; i < houseArray.length; i++) {
        if (houseArray[i].District == selectedState) {
            changeState = houseArray[i];
            found = true;
            break;
        }
  
    }
    houseArray[i].ChanceOfDWin = -1000
    setColorBasedOnChance(electionyear)
    getPercentDWin();
}

function getPercentDWin() {
    var DSeats = 0;

    DWins = DSeats
    houseArray.sort((b, a) => a.ChanceOfDWin - b.ChanceOfDWin);

    for (var i = 0; i < houseArray.length; i++) {
        DSeats++
        if (houseArray[i].ChanceOfDWin > .5){
            DWins++
        }
        if(DSeats < 218){
            tippingPoint = houseArray[i].ChanceOfDWin
        }  
        if (DSeats == 218){
            tippingPoint = houseArray[i].ChanceOfDWin

        }
        
    }
    tippingPoint = tippingPoint * 100
    //Update Democrat UI
    document.getElementById('chanceOfDWinState').innerText = tippingPoint.toFixed(2);
    document.getElementById('projectedEVsD').innerText = DWins

    // Update Republican UI
    document.getElementById('chanceOfRWinState').innerText = (100 - tippingPoint).toFixed(2);
    document.getElementById('projectedEVsR').innerText = 435 - DWins

    // 250 of 435 seats either way is as blue or as red as it gets.
    paintResultBackground(resultLean(DWins, 217.5, 250));
}

//Incumbent Model Click--------------------------------------------------------------------------------------------------------------------------
// This function will be executed when the Incumbency Button is clicked
function handleClickIncumbent() {
    houseArray.length = 0;
    // Use Papa Parse to fetch and parse the CSV file
    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processDistricts(results.data, 2026);
            setColorBasedOnParty();
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
}

//Set color of each district based on incumbent party if incumbent is running
function setColorBasedOnParty() {
    for (var i = 0; i < houseArray.length; i++) {
        var party = houseArray[i].IncumbentParty;
        var districtID = houseArray[i].District;

        svgDistrict = document.getElementById(districtID);

        if (party == "R") {
            try { svgDistrict.style.fill = 'rgb(121, 24, 24)'; } catch { }
        }
        else if (party == "D") {
            try { svgDistrict.style.fill = 'rgb(24, 31, 121)'; } catch { }
        }
        else {
            try { svgDistrict.style.fill = 'rgba(255, 255, 255, 0.05)'; } catch { }
        }
    }
}

