$(document).ready(function() {
  /* map configuration */
  var selector  = document.getElementById('map_canvas');
  var coords    = new google.maps.LatLng(47.80949,13.05501);
  var zoom      = 14;
  var type      = google.maps.MapTypeId.HYBRID;
  var xmlFile   = 'open_sbg.xml'
  
  /* initialize map and place markers */
  OpenSBG.init(selector, coords, zoom, type);
  OpenSBG.placeMarkers(xmlFile);
});

var OpenSBG = {
  map: null,
	bounds: null,
	
	init : function(selector, coords, zoom, type) {
  	var options = {
      zoom: zoom,
      center: coords,
      mapTypeId: type
    };
    
    this.map = new google.maps.Map(selector, options);
    this.bounds = new google.maps.LatLngBounds();
	},
	
	placeMarkers : function(filename) {
  	$.get(filename, function(xml) {
  		$(xml).find('gml\\:featureMember').each(function() {
  			/* read info */
  			var bereich = $(this).find('gmgml\\:BEREICH').text();
  			var bezeichnung = $(this).find('gmgml\\:BEZEICHNUNG').text();
  			var adresse = $(this).find('gmgml\\:ADRESSE').text();
  			var beschreibung = $(this).find('gmgml\\:BESCHREIBUNG').text();
  			
  			/* determine latitude and longitude */
  			var position = $(this).find('gml\\:pos').text();
  			var delimiter = pos.indexOf(' ');
  			
  			var lat = pos.substr(0, delimiter);
  			var lng = pos.substr(delimiter + 1, pos.length);
  			
  			/* place marker */
  			var point = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
  			OpenSBG.bounds.extend(point);
  			
  			var marker = new google.maps.Marker({
  				position: point,
  				map: OpenSBG.map
  			});
  			
  			/* overlay window */
  			var infoWindow = new google.maps.InfoWindow();
  			var html = '<strong>' + bezeichnung + '</strong.><br />' + adresse;
  			
  			google.maps.event.addListener(marker, 'click', function() {
  				infoWindow.setContent(html);
  				infoWindow.open(OpenSBG.map, marker);
  			});
  			
  			//OpenSBG.map.fitBounds(OpenSBG.bounds);
  		});
  	});
	}
}