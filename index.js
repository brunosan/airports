var cluster = [];
var airports = [];
var countries = [];
var countries_file = 'countries.json';
var airports_file = 'airports.json';
var mymap = L.map('map').setView([0.505, -0.09], 3);

mapit();

$(function() {

  var point = turf.point([-98.768159, 20.098287]); // Hgo | This should return one TRUE at least
  // var point = turf.point([-79.601038, 43.6565353]); // Toronto | This should always be FALSE


  console.log("reading countries...");
  $.getJSON(countries_file, function(data)
  {
    countries = data;
    console.log("countries loaded");//,countries);


    console.log("reading airports...");
    //TODO Use https://stuk.github.io/jszip/documentation/howto/read_zip.html
    $.get(airports_file, function(data)
      {
        airports = JSON.parse(data);
        console.log("airports loaded");//,Object.keys(airports));


        //Set origin and destination
        origin_ican = "FAYP"
        destination_ican = "HESH"
        origin = airports[origin_ican]
        destination = airports[destination_ican]

        //add markers and straight route to the map.
        L.marker([origin.lat, origin.lon]).addTo(mymap)
      		.bindPopup(origin.name);
        L.marker([destination.lat, destination.lon]).addTo(mymap)
        	.bindPopup(destination.name);


        var start = turf.point([origin.lon, origin.lat]);
        var end = turf.point([destination.lon, destination.lat,]);
        var greatCircle = turf.greatCircle(start, end, {'name': 'Seattle to DC'});

        L.geoJSON(greatCircle, {
        }).addTo(mymap);



        console.log("Computing intersection between:",origin.name," and ",destination.name);

        //See which countries intersect

        countries.features.forEach(function(feature) {

            var intersection = turf.lineIntersect(greatCircle, feature);
            if (intersection.features.length!=0) {
              L.geoJSON(feature).addTo(mymap);
              console.log("Crosses: ",feature.id," ",feature.properties.name);

            }
          });

        //Zoom in
        mymap.fitBounds([
          [origin.lat, origin.lon],
          [destination.lat, destination.lon]
        ]);




  }, 'text');


});
});

function mapit(){
  console.log("Setting up map..");


	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);



}
