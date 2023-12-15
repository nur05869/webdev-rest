<script setup>
import { reactive, ref, onMounted } from 'vue'

let crime_url = ref('');
let dialog_err = ref(false);
let map = reactive(
    {
        leaflet: null,
        center: {
            lat: 44.955139,
            lng: -93.102222,
            address: ''
        },
        zoom: 12,
        bounds: {
            nw: {lat: 45.008206, lng: -93.217977},
            se: {lat: 44.883658, lng: -92.993787}
        },
        //draw markers on the map for each neighborhood 

        
        neighborhood_markers: [
            //create neighborhood numbers for markers
            /*


*/
            {location: [44.942068, -93.020521], marker: "1,Conway/Battlecreek/Highwood"},
            {location: [44.977413, -93.025156], marker: "2,Greater East Side"},
            {location: [44.931244, -93.079578], marker: "3,West Side"},
            {location: [44.956192, -93.060189], marker: "4,Dayton's Bluff"},
            {location: [44.978883, -93.068163], marker: "5,Payne/Phalen"},
            {location: [44.975766, -93.113887], marker: "6,North End"},
            {location: [44.959639, -93.121271], marker: "7,Thomas/Dale(Frogtown)"},
            {location: [44.947700, -93.128505], marker: "8,Summit/University"},
            {location: [44.930276, -93.119911], marker: "9,West Seventh"},
            {location: [44.982752, -93.147910], marker: "10,Como"},
            {location: [44.963631, -93.167548], marker: "11,Hamline/Midway"},
            {location: [44.973971, -93.197965], marker: "12,St. Anthony"},
            {location: [44.949043, -93.178261], marker: "13,Union Park"},
            {location: [44.934848, -93.176736], marker: "14,Macalester-Groveland"},
            {location: [44.913106, -93.170779], marker: "15, Highland"},
            {location: [44.937705, -93.136997], marker: "16, Summit Hill"},
            {location: [44.949203, -93.093739], marker: "17,Capitol River"}
        ]
        
    }
);

// Vue callback for once <template> HTML has been added to web page
onMounted(() => {
    // Create Leaflet map (set bounds and valied zoom levels)
    map.leaflet = L.map('leafletmap').setView([map.center.lat, map.center.lng], map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11.5,
        maxZoom: 18
    }).addTo(map.leaflet);
    map.leaflet.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);

    
    // Get boundaries for St. Paul neighborhoods
    let district_boundary = new L.geoJson();
    district_boundary.addTo(map.leaflet);
    fetch('data/StPaulDistrictCouncil.geojson')
    .then((response) => {
        return response.json();
    })
    .then((result) => {
        
        result.features.forEach((value) => {
            district_boundary.addData(value);
        });
    })
    .catch((error) => {
        console.log('Error:', error);
    });

    map.neighborhood_markers.forEach((value) => {
        //for each neighborhood replace the marker with a numbered marker
        let marker = L.marker(value.location).addTo(map.leaflet);
        marker.bindPopup(`<b>${value.marker}</b>`);
        value.marker = marker;
       
    })
});


// FUNCTIONS
// Function called once user has entered REST API URL
function initializeCrimes() {
    //use API to fetch data and populate a table in div crimTBL from http://localhost:8000
    let url = crime_url.value;
    url = url.concat("/incidents");
    console.log(url);
//fetch data and use fillTable to populate crimTBL
    console.log(fetch(url));
    
}

// function to fill table with crimes takes json
/*
"case_number": "14174423",
        "date_time": "2014-08-17T16:44:00",
        "incident": "Theft",
        "police_grid": 117,
        "neighborhood_number": 1,
        "block": "30X BIRMINGHAM ST"


    const tr = "<tr>";
    const trEnd = "</tr>";
    const th = "<th>";
    const thEnd = "</th>";
    const td = "<td>";
    const tdEnd = "</td>";
    const newline = "\n";
    let makeTable = function(head, rows, labels){
        let table = "<table>"+newline;
        //make table head
        table += "<thead>"+newline;
        table += tr+newline+addTableList(head, th, thEnd, null)+trEnd+newline;
        table += "</thead>"+newline;
        //make table body
        table += "<tbody>"+newline;
        table += addTableList(rows, td, tdEnd, labels);
        table += "</tbody>"+newline;
        table += "</table>"+newline;

        return table;
    };

        replace $$$$ with data from json 
*/

const tr = "<tr>";
    const trEnd = "</tr>";
    const th = "<th>";
    const thEnd = "</th>";
    const td = "<td>";
    const tdEnd = "</td>";
    const newline = "\n";
    let makeTable = function(head, rows, labels){
        let table = "<table>"+newline;
        //make table head
        table += "<thead>"+newline;
        table += tr+newline+addTableList(head, th, thEnd, null)+trEnd+newline;
        table += "</thead>"+newline;
        //make table body
        table += "<tbody>"+newline;
        table += addTableList(rows, td, tdEnd, labels);
        table += "</tbody>"+newline;
        table += "</table>"+newline;

        return table;
    };

   let addTableList = function(data, begin, end, labels){
        let list = "";
        let makeRow;
        if(labels == null){
            makeRow = function(cellData){
                if(cellData != null){
                    list += begin+cellData+end+newline;
                }
            };
        }else{
            makeRow = function(cellData){
                list += tr+newline;
                labels.forEach(label => {
                    if(label != null){
                        list += begin+cellData[label]+end+newline;
                    }
                });
                list += trEnd+newline;
            };
        }
        data.forEach((cellData) => {
            makeRow(cellData);
        });
        return list;
    };
//use make table to create and populate table with headers date,code, incident type, Police grid, neighborhood, and block
function fillTable(result){
    let table = makeTable(
        ["Date", "Code", "Incident Type", "Police Grid", "Neighborhood", "Block"],
        result, ["date_time", "case_number", "incident", "police_grid", "neighborhood_number", "block"]
    );
    data.replace('$$DATA$$', table);
}



// Function called when user presses 'OK' on dialog box
function closeDialog() {
    let dialog = document.getElementById('rest-dialog');
    let url_input = document.getElementById('dialog-url');
    if (crime_url.value !== '' && url_input.checkValidity()) {
        dialog_err.value = false;
        dialog.close();
        initializeCrimes();
    }
    else {
        dialog_err.value = true;
    }
}

function searchLo(){
    let input1 = document.getElementById('search').value;
    console.log("clicked");
    console.log(input1);

    if(input1 == ""){
        alert("Please enter a location");
        return;
    }
    if (!input1.includes("st.paul")){
        //include st.paul in location search to make sure it is within the city
       input1 = input1 + " " + "st.paul";
    }
    if (input1.includes(" ")) {
        //string substitution to turn all spaces to +
        input1 = input1.replace(/\s+/g, '+');
    }
    
    let url1 = "https://nominatim.openstreetmap.org/search?q="+input1+"&format=json&limit=1";

    console.log(url1);
    //if location is not found or is outside of st.paul clamp input values to st.paul
    if(input1.includes("st.paul")){
        url1 = "https://nominatim.openstreetmap.org/search?q="+input1+"&format=json&limit=1";
    }
    else{
        url1 = "https://nominatim.openstreetmap.org/search?q="+input1+"&format=json&limit=1&bounded=1&polygon_geojson=1&viewbox=44.883658,-93.217977,45.008206,-92.993787";
    }

    //change center of map to location entered and zoom in
    Promise.all([fetch(url1)])
    .then((responses) => {
        return Promise.all([responses[0].json()]);
    }).then ((data) => {
        console.log(data);
        let loc1data = data[0][0];

        let lat1 = parseFloat(loc1data.lat);
        let lon1 = parseFloat(loc1data.lon);
        map.leaflet.setView([lat1, lon1], 16);
        //draw a popup at the location and when off clicked close the pop up
        let popup1 = L.popup().setLatLng([lat1, lon1]);
        popup1.setContent(loc1data.display_name);
        popup1.openOn(map.leaflet);


        //change place holder in input box to location entered
        document.getElementById('search').placeholder = loc1data.display_name;

    })
    .catch((error) => {
        console.log(error);
    })
    

}
</script>

<template>
    <dialog id="rest-dialog" open>
        <h1 class="dialog-header">St. Paul Crime REST API</h1>
        <label class="dialog-label">URL: </label>
        <input id="dialog-url" class="dialog-input" type="url" v-model="crime_url" placeholder="http://localhost:8000" />
        <p class="dialog-error" v-if="dialog_err">Error: must enter valid URL</p>
        <br/>
        <button class="button" type="button" @click="closeDialog">OK</button>
    </dialog>
    <div class="grid-container">
        <h1 class="cell" style="text-align: center;">St. Paul Crime Map</h1>
        <!-- background of div to be beige-->
        <div class="grid-x grid-padding-x">
            <div id="inputbox" class="cell auto" style="padding-top: 10px;">
                <input id= "search" class="cell small-8 auto" type="text" placeholder="Enter Address" v-model="crime_url" />
                <button class="button cell small-2" type="button" style="hover: blue;" @click="searchLo" >Search</button>
            </div>
        </div>
        <div class="grid-x grid-padding-x" style="background-color: antiquewhite;padding: 20px;border-radius : 10px;">
            <div id="leafletmap"  class="cell large-6 medium-12 small-12" style="border-radius : 10px;  padding-top: 200px;"></div>
            <div class="cell small-6">
                <table id="crimeTbl">
                    <tr>
                        $$DATA$$
                  <!--      <th>Date</th>
                        $$DATE$$
                        <th>Code</th>
                        $$CODE$$
                        <th>Incident Type</th>
                        $$INCIDENT$$
                        <th>Police Grid</th>
                        $$POLICE$$
                        <th>Neighborhood</th>
                        $$NEIGHBORHOOD$$
                        <th>Block</th>
                        $$BLOCK$$>-->
                    </tr>

                </table>
            </div>
        </div>
        

        <div class="grid-x grid-padding-x">
                
            </div>
    </div>
</template>

<style>
#rest-dialog {
    width: 20rem;
    margin-top: 1rem;
    z-index: 1000;
}

#leafletmap {
    height: 500px;
}

.dialog-header {
    font-size: 1.2rem;
    font-weight: bold;
}

.dialog-label {
    font-size: 1rem;
}

.dialog-input {
    font-size: 1rem;
    width: 100%;
}

.dialog-error {
    font-size: 1rem;
    color: #D32323;
}
</style>
