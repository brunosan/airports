var cluster = [];
var airports = [];
var countries = [];
var countries_file = 'countries.json';
var airports_file = 'airports.json';

$(function() {

  var point = turf.point([-98.768159, 20.098287]); // Hgo | This should return one TRUE at least
  // var point = turf.point([-79.601038, 43.6565353]); // Toronto | This should always be FALSE


  console.log("reading countries...");
  $.getJSON(countries_file, function(data)
  {
    countries = data;
    console.log("countries",countries);


    console.log("reading airports...");
    //TODO Use https://stuk.github.io/jszip/documentation/howto/read_zip.html
    $.get(airports_file, function(data)
      {
        airports = JSON.parse(data);
        console.log("airports",Object.keys(airports));
        console.log(airports["FAYP"]);
        console.log(airports["GOOY"]);
        var start = turf.point([-122, 48]);
        var end = turf.point([-77, 39]);

        var greatCircle = turf.greatCircle(start, end, {'name': 'Seattle to DC'});
        console.log(greatCircle);




  }, 'text');


});
});
