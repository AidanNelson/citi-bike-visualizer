# citi-bike-visualizer
Visualizer for my Citi Bike trip data from Oct 2016-2017, built using [mappa](https://mappa.js.org/) and [p5.js](https://p5js.org/).

Visualization of my Citibike bike-sharing usage in the past year (Oct 2016 - Oct 2017).  I use citibike often, so there are a relatively large number of trip data points (525) in that time frame.  Citibike trip data is from their website (after login, there is a 'trips' menu where you can download data) and station information (containing longitude/latitude) is from citibike's JSON data.  Mapping will happen using Mappa, which interfaces between p5.js and various online mapping APIs.

Citibike information index JSON: http://gbfs.citibikenyc.com/gbfs/gbfs.json
Citibike station information JSON: https://gbfs.citibikenyc.com/gbfs/en/stationInformation.json

Mappa: https://github.com/cvalenzuela/Mappa
p5.js: https://p5js.org/
graphhopper (for routing): https://www.graphhopper.com/

add'tl helpful tutorials:
 - https://github.com/joeyklee/hello-vector-tiles
 - https://mappa.js.org/docs/taxi-routes.html
