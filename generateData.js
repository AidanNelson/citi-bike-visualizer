/*
This script generates a JSON file for use in my citibike visualizer script.

This will make all API calls necessary (except for the map calls) so I don't overrun my quotas!

Aidan Nelson
March 20, 2018

*/

let startStations = {};
let stationInfo = {};
let routes = {};

let allData = {};

////////////////////////////////////////////////////////////////////////////////////////////

function preload() {
  loadJSON("https://gbfs.citibikenyc.com/gbfs/en/station_information.json", makeStations);
}

function setup(){
  allData.routes = routes;
  allData.stations = stationInfo;
  // allData.startStations = startStations;
  saveJSON(allData,'output.json');
}

////////////////////////////////////////////////////////////////////////////////////////////
// data 'pipeline'


//callback for loadJSON
function makeStations(cb_stations) {
  console.log("in makeStations");
  //set up a short link to the station data
  let stations = cb_stations.data.stations;
  //iterate through info, adding to arrays
  for (let i = 0; i < stations.length; i++) {
    // define as class?
    let info = {
      coordinate: {
        lat: stations[i].lat,
        lng: stations[i].lon
      },
      timesVisited: 0,
      endStations: {}
    };
    let name = stations[i].name;
    stationInfo[name] = info;
  }

  loadStrings("cb_trips.txt", loadTrips);
}


//callback for loadStrings
function loadTrips(cb_trips) {
  console.log('loading trips');
  //initiate a new Trip object:
  let t = {};
  //create an index for the line numbers
  let lineIndex = 1;

  //iterate through cb_trips
  for (let i = 0; i < cb_trips.length; i++) {
    //depending on which lineIndex we are at, add current string to one of the above arrays
    if (lineIndex % 5 == 0) {
      t.duration = trim(cb_trips[i]);
    } else if (lineIndex % 4 == 0) {
      t.endStation = trim(cb_trips[i]);
    } else if (lineIndex % 3 == 0) {
      t.endTime = Date.parse(trim(cb_trips[i]));
    } else if (lineIndex % 2 == 0) {
      t.startStation = trim(cb_trips[i]);
    } else {
      t.startTime = Date.parse(trim(cb_trips[i]));
    }

    lineIndex++;
    if (lineIndex > 5) {
      //return index to 1
      lineIndex = 1;

      // there are some inconsistencies btwn current citibike data and trip Data
      // perhaps bc stations have been disabled, etc.  in any case, skip those
      // outlier cases...
      if (stationInfo[t.startStation]){
        stationInfo[t.startStation].timesVisited ++;
        if (!stationInfo[t.startStation].endStations[t.endStation]) {
          stationInfo[t.startStation].endStations[t.endStation] = 1;
        } else {
          stationInfo[t.startStation].endStations[t.endStation] ++;
        }
      }
      if (stationInfo[t.endStation]){
        stationInfo[t.endStation].timesVisited ++;
      }

      //reuse t as a new trip object
      t = {};
    }
  }
  console.log('done loading trips');
  generateStartStations();
}


function generateStartStations() {
  for (let name in stationInfo){
    if (Object.keys(stationInfo[name].endStations).length > 0){
      startStations[name] = stationInfo[name];
    }
  }
  console.log('saving startStations');
  // saveJSON(startStations, 'output.json');
  getRoutes();
}

function getRoutes(){
  for (let start in startStations){
    for (let end in startStations[start].endStations) {
      if (!routes[start]) {
        routes[start] = {};
      }
      console.log('adding new route:',start + " -> " + end);
      if (stationInfo[start] && stationInfo[end]){
        let url = getLink(start,end);
        loadJSON(url, (data) => {
          let pts = [];
          let d = data.paths[0].distance;

          // why is this necessary???????? rather than copying whole list??
          let coordinates = data.paths[0].points.coordinates;
          for (let i = 0; i < coordinates.length; i++){
            let point = coordinates[i];
            pts.push(point);
          }

          routes[start][end] = {
            distance: d,
            points: pts
          };
        });
      }
    }
  }
}


function getLink(s1,s2){

  let p1 = stationInfo[s1].coordinate;
  let p2 = stationInfo[s2].coordinate;

  let key = "99472a3b-9e3e-43d1-b50d-c0da842a0043";
  let url = "https://graphhopper.com/api/1/route?point=" + p1.lat + "," + p1.lng + "&point=" + p2.lat + "," + p2.lng + "&vehicle=bike&points_encoded=false&locale=en&key=" + key;

  return url;
}
