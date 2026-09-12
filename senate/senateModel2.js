//Data 
const csvUrl = 'https://raw.githubusercontent.com/ElectionMap-lol/electionmap/refs/heads/main/ModelData/ElectionsData.csv';

//Array for State Data
const statesArray = [];
var pollingAverage = 0;
electionyear = '2026'
setBackgroundColor();

// Use Papa Parse to fetch and parse the CSV file; runs when file loads
Papa.parse(csvUrl, {
    download: true,
    header: true, // Set to false if the CSV doesn't have headers
    dynamicTyping: true, // Convert types automatically
    skipEmptyLines: true, // Skip empty lines
    complete: function (results) {
        processStates(results.data, '2026');
        prepareMapForYear();
        setColorBasedOnChance('2026');
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
        for (var i = 0; i < statesArray.length; i++) {
            if (statesArray[i].StateAbbreviation == stateAbbr) { 
                if(statesArray[i].ElectionYear == electionyear){
                    hoveredState = statesArray[i];
                    found = true;
                    
                    var output = statesArray[i].InfoBoxString;
                    //console.log(output)
                    break;
                }              
            }
        }
        if (found) {
            document.getElementById("details-box").innerHTML = output;
            document.getElementById("details-box").style.opacity = "100%";
        } else {
            // No race here this year - don't leave the previous state's text up.
            document.getElementById("details-box").style.opacity = "0%";
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
    const button2026 = document.getElementById('2026 Model');
    button2026.addEventListener('click', () => handleClick('2026'));

    const button2024 = document.getElementById('2024 Model');
    button2024.addEventListener('click', () => handleClick('2024'));

    const button2022 = document.getElementById('2022 Model');
    button2022.addEventListener('click', () => handleClick('2022'));

    const button2020 = document.getElementById('2020 Model');
    button2020.addEventListener('click', () => handleClick('2020'));

    const button2018 = document.getElementById('2018 Model');
    button2018.addEventListener('click', () => handleClick('2018'));

    const button2024r = document.getElementById('2024 Actual Results');
    button2024r.addEventListener('click', () => handleClickResults('2024'));

    const button2022r = document.getElementById('2022 Actual Results');
    button2022r.addEventListener('click', () => handleClickResults('2022'));

    const button2020r = document.getElementById('2020 Actual Results');
    button2020r.addEventListener('click', () => handleClickResults('2020'));

    const button2018r = document.getElementById('2018 Actual Results');
    button2018r.addEventListener('click', () => handleClickResults('2018'));

    const enterButton = document.getElementById('enterButton');
    enterButton.addEventListener('click', handleClickEnterButton);

    const callButtonD = document.getElementById('callButtonD');
    callButtonD.addEventListener('click', handleClickCallButtonD);

    const callButtonR = document.getElementById('callButtonR');
    callButtonR.addEventListener('click', handleClickCallButtonR);

});


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

function handleClick(year){
    statesArray.length = 0;
    // Use Papa Parse to fetch and parse the CSV file

    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, year);
            prepareMapForYear();
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
    statesArray.length = 0;
    // Use Papa Parse to fetch and parse the CSV file

    Papa.parse(csvUrl, {
        download: true,
        header: true, // Set to false if the CSV doesn't have headers
        dynamicTyping: true, // Convert types automatically
        skipEmptyLines: true, // Skip empty lines
        complete: function (results) {
            processStates(results.data, year);
            prepareMapForYear();
            setColorsBasedOnResults(year);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

}

// ---- STATES HOLDING TWO RACES IN ONE YEAR ----
// Now and then a state votes on two Senate seats at once: its regular class seat plus
// a special election. Rather than float a second copy of the state beside the map, the
// state itself is cut in half along a 45 degree line running lower-left to upper-right.
// The regular race takes the upper-left half, the special takes the lower-right. The cut
// only exists in years where that state really does hold two races.
const SVG_NS = 'http://www.w3.org/2000/svg';

// Only states actually holding a race get a fill, so clear last year's colours first.
function resetStateFills() {
    // Direct children only: clipPath definitions also contain <path> elements.
    document.querySelectorAll('.zoomspace svg.map > g.zoomlayer > path, .zoomspace svg.map > path').forEach(path => {
        path.style.fill = '';
    });
}

function clearRaceSplits() {
    document.querySelectorAll('.race-half, .race-divider').forEach(el => el.remove());

    const oldClips = document.getElementById('race-split-clips');
    if (oldClips) oldClips.remove();

    document.querySelectorAll('[data-race-split]').forEach(path => {
        path.style.clipPath = '';
        path.removeAttribute('data-race-split');
    });
}

function splitStatesWithTwoRaces() {
    const svg = document.querySelector('.zoomspace svg.map');
    if (!svg) return;

    // Group this year's races by the state they sit in: "GA-S" belongs to "GA".
    const racesByState = {};
    statesArray.forEach(race => {
        if (race.ElectionYear != electionyear) return;
        const state = String(race.StateAbbreviation).replace(/-S$/, '');
        (racesByState[state] = racesByState[state] || []).push(race);
    });

    const clips = document.createElementNS(SVG_NS, 'defs');
    clips.id = 'race-split-clips';

    Object.keys(racesByState).forEach(state => {
        // Regular seat first, special second, so the halves mean the same thing every year.
        const races = racesByState[state]
            .sort((a, b) => /-S$/.test(a.StateAbbreviation) - /-S$/.test(b.StateAbbreviation));
        if (races.length < 2) return;

        const statePath = document.getElementById(state);
        if (!statePath) return;

        // A 45 degree cut through the middle, drawn well past the state's bounds so the
        // two triangles always cover it whatever its shape.
        const box = statePath.getBBox();
        const midX = box.x + box.width / 2;
        const midY = box.y + box.height / 2;
        const reach = Math.max(box.width, box.height);
        const corner = (x, y) => `${midX + x * reach},${midY + y * reach}`;
        const lowerLeft = corner(-1, 1);
        const upperRight = corner(1, -1);

        const halves = [
            { race: races[0], clipId: `race-cut-${state}-a`, points: `${lowerLeft} ${upperRight} ${corner(-1, -1)}` },
            { race: races[1], clipId: `race-cut-${state}-b`, points: `${lowerLeft} ${upperRight} ${corner(1, 1)}` },
        ];

        halves.forEach(half => {
            const clip = document.createElementNS(SVG_NS, 'clipPath');
            clip.id = half.clipId;
            // The state carries its own transform, so clip in that same space.
            clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
            const triangle = document.createElementNS(SVG_NS, 'polygon');
            triangle.setAttribute('points', half.points);
            clip.appendChild(triangle);
            clips.appendChild(clip);
        });

        // The state path itself becomes the first race's half...
        statePath.setAttribute('data-race-split', state);
        statePath.style.clipPath = `url(#${halves[0].clipId})`;

        // ...and a clipped copy of it becomes the second's.
        const special = races[1];
        // Two races can share an abbreviation (2022 Oklahoma); give the second its own
        // so colouring and hover can tell the halves apart.
        if (special.StateAbbreviation === state) special.StateAbbreviation = state + '-S';

        const secondHalf = statePath.cloneNode(false);
        secondHalf.id = special.StateAbbreviation;
        secondHalf.dataset.id = special.StateAbbreviation;
        secondHalf.dataset.name = special.State;
        secondHalf.removeAttribute('data-race-split');
        secondHalf.classList.add('race-half');
        secondHalf.style.clipPath = `url(#${halves[1].clipId})`;
        statePath.parentNode.insertBefore(secondHalf, statePath.nextSibling);

        // A dashed rule along the cut, so two similar colours still read as two races.
        // Clipped to the state's own outline so it stops at the border.
        const outline = document.createElementNS(SVG_NS, 'clipPath');
        outline.id = `race-shape-${state}`;
        outline.setAttribute('clipPathUnits', 'userSpaceOnUse');
        const shape = document.createElementNS(SVG_NS, 'path');
        shape.setAttribute('d', statePath.getAttribute('d'));
        outline.appendChild(shape);
        clips.appendChild(outline);

        const divider = document.createElementNS(SVG_NS, 'line');
        divider.setAttribute('x1', midX - reach);
        divider.setAttribute('y1', midY + reach);
        divider.setAttribute('x2', midX + reach);
        divider.setAttribute('y2', midY - reach);
        // The halves carry the state's transform, so the rule must sit in that space too.
        const stateTransform = statePath.getAttribute('transform');
        if (stateTransform) divider.setAttribute('transform', stateTransform);
        divider.setAttribute('stroke', 'black');
        divider.setAttribute('stroke-width', '1.5');
        divider.setAttribute('stroke-dasharray', '4 3');
        divider.setAttribute('stroke-linecap', 'round');
        divider.setAttribute('pointer-events', 'none');
        divider.classList.add('race-divider');
        divider.style.clipPath = `url(#${outline.id})`;
        statePath.parentNode.insertBefore(divider, secondHalf.nextSibling);
    });

    if (clips.childNodes.length) svg.appendChild(clips);
}

// Run after the year's races are loaded, before they are coloured.
function prepareMapForYear() {
    clearRaceSplits();
    resetStateFills();
    splitStatesWithTwoRaces();
}

function processStates(states, year) {
    electionyear = year
    //cycle through each states and parse the data as needed
    states.forEach(s => {
        if (s.Year == year && (s.District == 'C1' || s.District == 'C2'|| s.District == 'C3' )){
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
                infoBoxString = s.State  + "\nIncumbent: " + incumbent + "\nProj. 2026 Result: " + formatStat(s.Median) + "\nElection 2024 Results: " + formatStat(s.P2024) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)

            }
            if (year == '2024') {
                infoBoxString = s.State  + "\nIncumbent: " + incumbent + "\nActual 2024 Result: " + formatStat(s.Margin) + "\nProj. 2024 Result: " + formatStat(s.Median) + "\nElection 2020 Results: " + formatStat(s.P2020) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)

            }
            if (year == '2022') {
                infoBoxString = s.State  + "\nIncumbent: " + incumbent + "\nActual 2022 Result: " + formatStat(s.Margin) + "\nProj. 2022 Result: " + formatStat(s.Median) + "\nElection 2020 Results: " + formatStat(s.P2020) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }

            if (year == '2020') {
                infoBoxString = s.State  + "\nIncumbent: " + incumbent + "\nActual 2020 Result: " + formatStat(s.Margin) + "\nProj. 2020 Result: " + formatStat(s.Median) + "\nElection 2016 Results: " + formatStat(s.P2016) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }

            if (year == '2018') {
                infoBoxString = s.State  + "\nIncumbent: " + incumbent + "\nActual 2018 Result: " + formatStat(s.Margin) + "\nProj. 2018 Result: " + formatStat(s.Median) + "\nElection 2016 Results: " + formatStat(s.P2016) + "\nDems Win: " + formatStat(s.Chance * 100) + "%\nReps Win: " + formatStat(100 - s.Chance * 100) + "%\nPolling Average: " + formatStat(s.Polls)
            }
            //console.log(infoBoxString)
            //Data for array -----------------------------------------------------
            let stateData = {
                StateAbbreviation: s.StateA,  
                State: s.State,  
                ElectionYear: year,
                Incumbent: incumbent,         
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
    });
}


//Set the colors to results
function setColorsBasedOnResults(year) {
    for (var i = 0; i < statesArray.length; i++) {
        var stateName = statesArray[i].State;
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

    if(electionyear == "2024"){
        var width1 = 28
        var width16 = 38

    }

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
        // Make all transparent first
        const svg = document.querySelector('svg.senate-model.map');
 
        if (svg) {
            const paths = svg.querySelectorAll('path'); 
            paths.forEach(path => {
                path.style.fill = 'transparent';
            });
        } else {
            console.warn('SVG not found');
        }
    
    for (var i = 0; i < statesArray.length; i++) {
        var stateYear = statesArray[i].ElectionYear;


        if (stateYear == electionyear){

            if (year == '2024') {
                var stater = statesArray[i].Result;
                var RSeats = '53'
                var DSeats = '47'
            }
            if (year == '2022') {
                var stater = statesArray[i].Result;
                var RSeats = '49'
                var DSeats = '51'
            }
            if (year == '2020') {
                var stater = statesArray[i].Result;
                var RSeats = '50'
                var DSeats = '50'
            }
            if (year == '2018') {
                var stater = statesArray[i].Result;
                var RSeats = '53'
                var DSeats = '47'
            }
            console.log("Test")

            var stateAbbr = statesArray[i].StateAbbreviation;
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

    // A finished election is settled, so the background goes hard for the winner.
    paintResultBackground(DSeats >= RSeats ? 1 : -1);
}

//Set the colors based on 2024 result
function setColorBasedOnChance(year) {
    
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

    if(year == "2026"){
        var width1 = 34
        var width16 = 31

        var DSeats = 34
        var RSeats = 31
    }


    if(year == "2024"){
        var width1 = 28
        var width16 = 38

        var DSeats = 28
        var RSeats = 38
    }

    if(year == "2022"){
        var width1 = 36
        var width16 = 29

        var DSeats = 36
        var RSeats = 29
    }
    if(year == "2020"){
        var width1 = 35
        var width16 = 30

        var DSeats = 35
        var RSeats = 30
    }
    if(year == "2018"){
        var width1 = 24
        var width16 = 42

        var DSeats = 24
        var RSeats = 42
    }

    // Make all transparent first
    const svg = document.querySelector('svg.senate-model.map');
 
    if (svg) {
        const paths = svg.querySelectorAll('path'); 
        paths.forEach(path => {
            path.style.fill = 'transparent';
        });
    } else {
        console.warn('SVG not found');
    }

    for (var i = 0; i < statesArray.length; i++) {
        var statePercent = statesArray[i].ChanceOfDWin;
        var stateName = statesArray[i].StateAbbreviation;
        var stateYear = statesArray[i].ElectionYear;
        if (stateYear == year){      
            svgState = document.getElementById(stateName); 
            
            if(statePercent > '.50'){
                DSeats++
            }else{
                RSeats++
        }
        if (statePercent == 1000) {
            try { svgState.style.fill = 'rgb(0, 12, 65)'; } catch { };
                width1 = width1 + percent;
                console.log("I claled it")
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
            try { 
                svgState.style.fill = 'rgb(129, 135, 216)';
                
             } catch { 
                console.log("Failed") 
            }
            width7 = width7 + percent;
        }
        else if (statePercent > .5) {
            try { svgState.style.fill = 'rgb(173, 178, 242)';  } catch { }
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
    // Neutral until the data lands; paintResultBackground takes over from there.
    paintResultBackground(0);
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
            console.log(statesArray[i]);
            break;
        }  
    }

    if(percent <= 100 && percent >= 0){
        console.log(statesArray[i].ChanceOfDWin)
        statesArray[i].ChanceOfDWin = percent / 100
        //senateArray[i].InfoBoxString = senateArray[i].State + "\nElection 2020 Results: " + senateArray[i].Election2020Results + "\nProj. 2024 Result: " + senateArray[i].MedianOutcome + "\nDemocrat Win %: " + senateArray[i].ChanceOfDWin * 100  + "\n2024 Polling Average: " + senateArray[i].Polls;
        console.log(statesArray[i].ChanceOfDWin)
    }

    setColorBasedOnChance(electionyear)
    getPercentDWin();
}

function handleClickCallButtonD(){
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
    setColorBasedOnChance(electionyear)
    getPercentDWin();
}
function handleClickCallButtonR(){
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
    setColorBasedOnChance(electionyear)
    getPercentDWin();
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

function getPercentDWin() {
    var DSeats = 0;

    
    if (electionyear == '2026') {
        var DSeats = 34;
    }
    if (electionyear == '2024') {
        var DSeats = 28;
    } else if (electionyear == '2022') {
        var DSeats = 36;
    } else if (electionyear == '2020') {
        var DSeats = 35;
    } else if (electionyear == '2018') {
        var DSeats = 24;
    }
    DWins = DSeats
    statesArray.sort((b, a) => a.ChanceOfDWin - b.ChanceOfDWin);

    for (var i = 0; i < statesArray.length; i++) {
        DSeats++
        if (statesArray[i].ChanceOfDWin > .5){
            DWins++
        }
        if(DSeats < 50){
            tippingPoint = statesArray[i].ChanceOfDWin
        }  
        if (DSeats == 50){
            tippingPoint = statesArray[i].ChanceOfDWin

        }
        
    }
    tippingPoint = tippingPoint * 100
    //Update Democrat UI
    document.getElementById('chanceOfDWin50').innerText = tippingPoint.toFixed(2);
    document.getElementById('projectedSeatsD').innerText = DWins

    // Update Republican UI
    document.getElementById('chanceOfRWin50').innerText = (100 - tippingPoint).toFixed(2);
    document.getElementById('projectedSeatsR').innerText = 100 - DWins.toFixed(2)

    // 60 of 100 seats either way is as blue or as red as it gets.
    paintResultBackground(resultLean(DWins, 50, 60));
}
