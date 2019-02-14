var cluster = [];
var airports = {};
var countries = [];
var countries_file = 'countries.json';
var airports_file = 'airports.json';
var mymap = L.map('map').setView([0.505, -0.09], 3);
var origin_ican = "FEGG"
var destination_ican = "DTTA"
var extra_layers = []
mapit();

function getAirportByName(object, value) {
  return Object.keys(object).find(key => object[key].name === value);
}

$(function() {
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
        airportnames=[]
        for (var key in airports){
          airportnames.push(airports[key].name);
        }
        console.log("airports loaded");//,Object.keys(airports));
        calculate_overpass(origin_ican,destination_ican,airports);
        //Set up autcomplete fields
        $( function() {
          var availableTags = airportnames;
          $( "#origin" ).autocomplete({
            source: availableTags,
            minChars: 3,
            select: function (event, ui) {
              origin_ican = getAirportByName(airports,ui.item.value)
              console.log(ui.item.value,origin_ican);
              if (destination_ican!=""){
                calculate_overpass(origin_ican,destination_ican,airports);
              }
            }
          });
          $( "#destination" ).autocomplete({
            source: availableTags,
            minChars: 3,
            select: function (event, ui) {
              destination_ican = getAirportByName(airports,ui.item.value)
              console.log(ui.item.value,destination_ican);
              if (origin_ican!=""){
                calculate_overpass(origin_ican,destination_ican,airports);
              }
            }
          });
        } );

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
};

function calculate_overpass(origin_ican,destination_ican,airports){
    //Clean any previous marker and layers
    for ( layer in extra_layers ){
      console.log(extra_layers[layer]);
      extra_layers[layer].remove();
    }

    //Set origin and destination
    origin = airports[origin_ican]
    destination = airports[destination_ican]
    console.log(origin_ican,destination_ican,origin,destination);

    //add markers and straight route to the map.
    var marker_origin      = new L.marker([origin.lat     , origin.lon     ]).addTo(mymap).bindPopup(origin.name);
    extra_layers.push(marker_origin);
    var marker_destination = new L.marker([destination.lat, destination.lon]).addTo(mymap).bindPopup(destination.name);
    extra_layers.push(marker_destination);


    var start = turf.point([origin.lon, origin.lat]);
    var end = turf.point([destination.lon, destination.lat,]);
    var greatCircle = turf.greatCircle(start, end, {'name': 'Seattle to DC'});

    var greatCircleMap = new L.geoJSON(greatCircle, {
    }).addTo(mymap);
    extra_layers.push( greatCircleMap );

    console.log("Computing intersection between:",origin.name," and ",destination.name);

    //See which countries intersect
    countries.features.forEach(function(feature) {
        var intersection = turf.lineIntersect(greatCircle, feature);
        if (intersection.features.length!=0) {
          var country = new L.geoJSON(feature).addTo(mymap).bindPopup(feature.properties.name);
          extra_layers.push(country)
          console.log("Crosses: ",feature.id," ",feature.properties.name);
        }
      });

    //Zoom in
    mymap.fitBounds([
      [origin.lat, origin.lon],
      [destination.lat, destination.lon]
    ]);
};
