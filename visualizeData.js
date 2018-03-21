let data = {};
let startStations = {};

let currentStation = null;

//create variables to hold the map, canvas, and "Mappa" instance
let myMap;
let canvas;
let mappa;

// options for mappa object
let options = {
  //set starting coordinates to NYC
  lat: 40.7128,
  lng: -73.96,
  //set zoom level
  zoom: 13,
  style: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
}

let startTime;
let speed = 0.8;

////////////////////////////////////////////////////////////////////////////////////////////

function preload() {
  loadJSON('./data.json', (incoming) => {
    console.log('got data');

    data = incoming;
    for (let name in incoming.stations){
      if (Object.keys(incoming.stations[name].endStations).length > 0){
        startStations[name] = incoming.stations[name];
      }
    }
  })
}

function setup() {
  //Mappa library requirements
  canvas = createCanvas(windowWidth, windowHeight);
  mappa = new Mappa('Leaflet');
  //call mappa object to create a tilemap at lat,long, zoom level
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas); //create map overlay of a canvas
  // Associate redrawMap callback function with an "onChange" event of the map
  myMap.onChange(redrawMap);
}

function draw() {
  if (currentStation){
    drawRoutesFrom(currentStation);
  }
}

function mouseClicked(){
  for (let id in startStations) {
    let st = startStations[id];
    let d = distSquared(mouseX,mouseY,st.pnt.x,st.pnt.y)
    if (d < 20){
      clear();
      redrawMap();
      startTime = millis();
      currentStation = id;


    }
  }
}

function drawRoutesFrom(start){
  strokeWeight(2);
  stroke(0);

  for (let end in startStations[start].endStations){
    if (data.routes[start][end]){
      let route = data.routes[start][end].points;
      let distance = data.routes[start][end].distance;
      let dt = millis() - startTime;
      let distanceLeft = (dt * speed);

      // console.log(distanceLeft);

      let sw = startStations[start].endStations[end];
      strokeWeight(constrain(sw/5,0.5,5));

      for (let i = 1; i < route.length; i++){
        // is this worth avoiding the extra calculations below...
        // console.log(distanceLeft);

        let p1 = myMap.latLngToPixel(route[i-1][1],route[i-1][0]);
        let p2 = myMap.latLngToPixel(route[i][1],route[i][0]);


        // get distance of segment in meters
        let segmentDist = measure(Math.abs(route[i-1][1]),Math.abs(route[i-1][0]),Math.abs(route[i][1]),Math.abs(route[i][0]));
        // console.log(segmentDist);

        if (segmentDist < distanceLeft){
          line(p1.x,p1.y,p2.x,p2.y);
        } else {
          // calculate percentage of segment to draw
          let percentage = distanceLeft / segmentDist;
          // console.log(percentage);
          let segmentX = lerp(p1.x,p2.x,percentage);
          let segmentY = lerp(p1.y,p2.y,percentage);
          // console.log(segmentX,segmentY);
          line(p1.x,p1.y,segmentX,segmentY);
          break;
        }

        distanceLeft -= segmentDist; // subtract amount we just finished

      }
    }
  }
}


// from https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d * 1000; // meters
}


function distSquared(x1,y1,x2,y2){
  let dx = x2-x1;
  let dy = y2-y1;
  return dx*dx + dy*dy;
}

//function to redraw points
function redrawMap() {
  clear();
  for (let name in startStations) {
    let c = startStations[name].coordinate;
    let pnt = myMap.latLngToPixel(c.lat,c.lng);
    startStations[name].pnt = pnt;
    fill(0,0,255);
    ellipse(pnt.x,pnt.y,5,5);
  }
}
