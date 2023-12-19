<script setup>
import { reactive, ref, onMounted } from "vue";

let crime_url = ref("");
let dialog_err = ref(false);
let map = reactive({
  leaflet: null,
  center: {
    lat: 44.955139,
    lng: -93.102222,
    address: "",
  },
  zoom: 12,
  bounds: {
    nw: { lat: 45.008206, lng: -93.217977 },
    se: { lat: 44.883658, lng: -92.993787 },
  },
  //draw markers on the map for each neighborhood

  neighborhood_markers: [
    //create neighborhood numbers for markers
    /*
    
    
    */
    {
      location: [44.942068, -93.020521],
      marker: "1,Conway/Battlecreek/Highwood",
    },
    { location: [44.977413, -93.025156], marker: "2,Greater East Side" },
    { location: [44.931244, -93.079578], marker: "3,West Side" },
    { location: [44.956192, -93.060189], marker: "4,Dayton's Bluff" },
    { location: [44.978883, -93.068163], marker: "5,Payne/Phalen" },
    { location: [44.975766, -93.113887], marker: "6,North End" },
    { location: [44.959639, -93.121271], marker: "7,Thomas/Dale(Frogtown)" },
    { location: [44.9477, -93.128505], marker: "8,Summit/University" },
    { location: [44.930276, -93.119911], marker: "9,West Seventh" },
    { location: [44.982752, -93.14791], marker: "10,Como" },
    { location: [44.963631, -93.167548], marker: "11,Hamline/Midway" },
    { location: [44.973971, -93.197965], marker: "12,St. Anthony" },
    { location: [44.949043, -93.178261], marker: "13,Union Park" },
    { location: [44.934848, -93.176736], marker: "14,Macalester-Groveland" },
    { location: [44.913106, -93.170779], marker: "15, Highland" },
    { location: [44.937705, -93.136997], marker: "16, Summit Hill" },
    { location: [44.949203, -93.093739], marker: "17,Capitol River" },
  ],
});

// Vue callback for once <template> HTML has been added to web page
onMounted(() => {
  // Create Leaflet map (set bounds and valied zoom levels)
  map.leaflet = L.map("leafletmap").setView(
    [map.center.lat, map.center.lng],
    map.zoom
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 11.5,
    maxZoom: 18,
  }).addTo(map.leaflet);
  map.leaflet.setMaxBounds([
    [44.883658, -93.217977],
    [45.008206, -92.993787],
  ]);

  // Get boundaries for St. Paul neighborhoods
  let district_boundary = new L.geoJson();
  district_boundary.addTo(map.leaflet);
  fetch("data/StPaulDistrictCouncil.geojson")
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      result.features.forEach((value) => {
        district_boundary.addData(value);
      });
    })
    .catch((error) => {
      console.log("Error:", error);
    });

  map.neighborhood_markers.forEach((value) => {
    //for each neighborhood replace the marker with a numbered marker
    let marker = L.marker(value.location).addTo(map.leaflet);
    marker.bindPopup(`<b>${value.marker}</b>`);
    value.marker = marker;
  });
});

// FUNCTIONS
// Function called once user has entered REST API URL
function initializeCrimes() {
  //use API to fetch data and populate a table in div crimTBL from http://localhost:8000
  //use fillTable to populate table with headers date,code, incident type, Police grid, neighborhood, and block
  let url = crime_url.value;
  console.log(url);
  url = url.concat("/incidents");
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result[0].case_number);
      fillTable(result);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
  /* fetch(url)
      
  */
  //get data and use fillTable to populate crimTBL
}

let fillTable = function (data) {
  /*
      ["Date", "Code", "Incident Type", "Police Grid", "Neighborhood", "Block"],
      data,
      ['date', 'code', 'incident', 'police_grid', 'neighborhood_number', 'block']
      */
  let rplmt = "<tbody> \n";
  data.forEach((value) => {
    rplmt = rplmt + "<tr>\n";
    rplmt = rplmt + "<td>" + value.date + "</td>\n";
    rplmt = rplmt + "<td>" + value.code + "</td>\n";
    rplmt = rplmt + "<td>" + value.incident + "</td>\n";
    rplmt = rplmt + "<td>" + value.police_grid + "</td>\n";
    rplmt = rplmt + "<td>" + value.neighborhood_number + "</td>\n";
    //replace x in block with 0s if before a space in JSON value.block

    let blockwords = JSON.stringify(value.block, null, 2).split(" ");
    if (blockwords[0].includes("X")) {
      for (let i = 0; i < blockwords[0].length; i++) {
        blockwords[0] = blockwords[0].replace("X", "0");
      }
    }
    blockwords = blockwords.join(" ");
    //if blockword contains quotations delete them all
    console.log(blockwords.substring(0, 1));
    if (blockwords.substring(0, 1).includes('"')) {
      //blockwords[0]="";
      blockwords.substring(0, 1) = "";
    }
    
    value.block=blockwords;

    rplmt = rplmt + "<td button onclick='searchLoClick(";
    rplmt +=  value.block;
    rplmt += ") >" + value.block + "</td>\n";
    rplmt = rplmt + "</tr>\n";
  });
  rplmt = rplmt + "</tbody>\n";
  document.getElementById("tablebody").innerHTML = rplmt;
  // console.log()
};

function searchLoClick(address) {
  let url1 =
    "https://nominatim.openstreetmap.org/search?q=" +
    address +
    "&format=json&limit=1";

  console.log(url1);
  //if location is not found or is outside of st.paul clamp input values to st.paul
  if (input1.includes("st.paul")) {
    url1 =
      "https://nominatim.openstreetmap.org/search?q=" +
      input1 +
      "&format=json&limit=1";
  } else {
    url1 =
      "https://nominatim.openstreetmap.org/search?q=" +
      input1 +
      "&format=json&limit=1&bounded=1&polygon_geojson=1&viewbox=44.883658,-93.217977,45.008206,-92.993787";
  }

  //change center of map to location entered and zoom in
  Promise.all([fetch(url1)])
    .then((responses) => {
      return Promise.all([responses[0].json()]);
    })
    .then((data) => {
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
      document.getElementById("search").placeholder = loc1data.display_name;
    })
    .catch((error) => {
      console.log(error);
    });
}
// Function called when user presses 'OK' on dialog box
function closeDialog() {
  let dialog = document.getElementById("rest-dialog");
  let url_input = document.getElementById("dialog-url");
  if (crime_url.value !== "" && url_input.checkValidity()) {
    dialog_err.value = false;
    dialog.close();
    initializeCrimes();
  } else {
    dialog_err.value = true;
  }
}

function searchLo() {
  let input1 = document.getElementById("search").value;
  console.log("clicked");
  console.log(input1);

  if (input1 == "") {
    alert("Please enter a location");
    return;
  }
  if (!input1.includes("st.paul")) {
    //include st.paul in location search to make sure it is within the city
    input1 = input1 + " " + "st.paul";
  }
  if (input1.includes(" ")) {
    //string substitution to turn all spaces to +
    input1 = input1.replace(/\s+/g, "+");
  }

  let url1 =
    "https://nominatim.openstreetmap.org/search?q=" +
    input1 +
    "&format=json&limit=1";

  console.log(url1);
  //if location is not found or is outside of st.paul clamp input values to st.paul
  if (input1.includes("st.paul")) {
    url1 =
      "https://nominatim.openstreetmap.org/search?q=" +
      input1 +
      "&format=json&limit=1";
  } else {
    url1 =
      "https://nominatim.openstreetmap.org/search?q=" +
      input1 +
      "&format=json&limit=1&bounded=1&polygon_geojson=1&viewbox=44.883658,-93.217977,45.008206,-92.993787";
  }

  //change center of map to location entered and zoom in
  Promise.all([fetch(url1)])
    .then((responses) => {
      return Promise.all([responses[0].json()]);
    })
    .then((data) => {
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
      document.getElementById("search").placeholder = loc1data.display_name;
    })
    .catch((error) => {
      console.log(error);
    });
}

function showForm() {
  var dialog = document.getElementById("my-dialog");
  dialog.showModal();
}

function closeForm() {
  var dialog = document.getElementById("my-dialog");
  dialog.close();
}

function submitForm() {
  var case_number = document.getElementById("case_number").value;
  var date = document.getElementById("date").value;
  var time = document.getElementById("time").value;
  var code = document.getElementById("code").value;
  var incident = document.getElementById("incident").value;
  var police_grid = document.getElementById("police_grid").value;
  var neighborhood_number = document.getElementById(
    "neighborhood_number"
  ).value;
  var block = document.getElementById("block").value;

  var jsonObj = {
    case_number: case_number,
    date: date,
    time: time,
    code: parseInt(code),
    incident: incident,
    police_grid: parseInt(police_grid),
    neighborhood_number: parseInt(neighborhood_number),
    block: block,
  };

  if (
    jsonObj.case_number == "" ||
    jsonObj.case_number == "" ||
    jsonObj.time == "" ||
    jsonObj.code == "" ||
    jsonObj.incident == "" ||
    jsonObj.neighborhood_number == "" ||
    jsonObj.police_grid == "" ||
    jsonObj.block == ""
  ) {
    alert("You are missing required fields");
  } else {
    fetch("http://localhost:8000/new-incident", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonObj),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("PUT request successful:", data);
        alert("Success! A new case has been added");
        var dialog = document.getElementById("my-dialog");
        dialog.close();
      })
      .catch((error) => {
        console.error("Error making PUT request:", error.message);
        console.error("Full error object:", error); // Log the full error object
        alert("Error adding your new case");
        var dialog = document.getElementById("my-dialog");
        dialog.close();
      });
  }
}
</script>

<template>
  <dialog id="rest-dialog" open>
    <h1 class="dialog-header">St. Paul Crime REST API</h1>
    <label class="dialog-label">URL: </label>
    <input
      id="dialog-url"
      class="dialog-input"
      type="url"
      v-model="crime_url"
      placeholder="http://localhost:8000"
    />
    <p class="dialog-error" v-if="dialog_err">Error: must enter valid URL</p>
    <br />
    <button class="button" type="button" @click="closeDialog">OK</button>
  </dialog>
  <div class="grid-container">
    <h1 class="cell" style="text-align: center">St. Paul Crime Map</h1>
    <!-- background of div to be beige-->
    <div class="grid-x grid-padding-x">
      <div id="inputbox" class="cell auto" style="padding-top: 10px">
        <input
          id="search"
          class="cell small-8 auto"
          type="text"
          placeholder="Enter Address"
          v-model="crime_url"
        />
        <button
          class="button cell small-2"
          type="button"
          style="hover: blue"
          @click="searchLo"
        >
          Search
        </button>
      </div>
    </div>
    <div
      class="grid-x grid-padding-x"
      style="background-color: antiquewhite; padding: 20px; border-radius: 10px"
    >
      <div
        id="leafletmap"
        class="cell large-6 medium-12 small-12"
        style="border-radius: 10px; padding-top: 600px"
      ></div>

      <div
        class="cell small-12 large-6"
        style="max-height: 300px; overflow-y: auto"
      >
        <table id="table" style="overflow-y: scroll">
          <thead style="position: sticky">
            <tr>
              <th>Date</th>
              <th>Code</th>
              <th>Incident type</th>
              <th>Police grid</th>
              <th>Neighborhood</th>
              <th>Block</th>
            </tr>
          </thead>
          <tbody
            id="tablebody"
            style="text-align: center; font-size: small"
          ></tbody>
        </table>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
      <button
        class="button cell small-12"
        type="button"
        style="hover: orange"
        @click="showForm()"
      >
        Add New Case
      </button>
      <dialog id="my-dialog">
        <span class="close" @click="closeForm">&#10006;</span>
        <br />
        <form id="myForm">
          <label for="case_number">Case Number:</label>
          <input
            type="text"
            id="case_number"
            placeholder="Ex: 21174014"
            required
          />
          <label for="date">Date (Year-Month-Day):</label>
          <input type="text" id="date" placeholder="Ex: 2021-08-22" required />
          <label for="time">Exact Military Time (Hour:Minute:Second):</label>
          <input type="text" id="time" placeholder="Ex: 17:46:00" required />
          <label for="code">Code:</label>
          <input type="text" id="code" placeholder="Ex: 9954" required />
          <label for="incident">Incident:</label>
          <input
            type="text"
            id="incident"
            placeholder="Ex: Proactive Police Visit"
            required
          />
          <label for="police_grid">Police Grid ID:</label>
          <input type="text" id="police_grid" placeholder="Ex: 194" required />
          <label for="neighborhood_number">Neighborhood ID Number:</label>
          <input
            type="text"
            id="neighborhood_number"
            placeholder="Ex: 3"
            required
          />
          <label for="block">Block Address:</label>
          <input
            type="text"
            id="block"
            placeholder="Ex: 1XX CESARCHAVEZ ST (censor exact address number)"
            required
          /><br />

          <button class="button" type="button" @click="submitForm">
            Submit
          </button>
        </form>
      </dialog>
    </div>
  </div>
</template>

<style>
#rest-dialog {
  width: 20rem;
  margin-top: 1rem;
  z-index: 1000;
}

#my-dialog {
  width: 35rem;
  margin-top: 1rem;
  z-index: 1000;
}

#leafletmap {
  height: 500px;
}

#tablebody td {
  height: 20px;
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
  color: #d32323;
}

.close {
  float: right;
}
</style>
