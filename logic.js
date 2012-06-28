﻿$(document).ready(function() {
  /* map configuration */
  var canvas  = 'map_canvas';
  var lat     = 47.80949;
  var lng     = 13.05501;
  var zoom    = 14;
  var type    = google.maps.MapTypeId.HYBRID;
  var xmlFile = 'open_sbg.xml'
  
  /* initialize map and place markers */
  OpenSBG.init(canvas, lat, lng, zoom, type);
  OpenSBG.placeMarkers(xmlFile);
});

var OpenSBG = {
  map : null,
	bounds : null,
	
	init : function(canvas, lat, lng, zoom, type) {
  	var options = {
    	center : new google.maps.LatLng(lat, lng),
      zoom : zoom,
      mapTypeId : type
    };
    
    this.map = new google.maps.Map(document.getElementById(canvas), options);
    this.bounds = new google.maps.LatLngBounds();
	},
	
	placeMarkers : function(filename) {
  	$.get(filename, function(xml) {
  		$(xml).find('gml\\:featureMember, featureMember').each(function() {
  			/* read info */
  			var bereich = $(this).find('gmgml\\:BEREICH, BEREICH').text();
  			var bezeichnung = $(this).find('gmgml\\:BEZEICHNUNG, BEZEICHNUNG').text();
  			var adresse = $(this).find('gmgml\\:ADRESSE, ADRESSE').text();
  			var beschreibung = $(this).find('gmgml\\:BESCHREIBUNG, BESCHREIBUNG').text();
  			
  			/* determine latitude and longitude */
  			var position = $(this).find('gml\\:pos, pos').text();
  			var delimiter = position.indexOf(' ');
  			
  			var lat = position.substr(0, delimiter);
  			var lng = position.substr(delimiter + 1, position.length);
  			
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