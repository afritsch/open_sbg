$(document).ready(function() {
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
  			var beschreibung = $(this).find('gmgml\\:BESCHREIBUNG, BESCHREIBUNG').text();
  			var kontakt = $(this).find('gmgml\\:KONTAKT, KONTAKT').text();
  			var adresse = $(this).find('gmgml\\:ADRESSE, ADRESSE').text();
  			var ort = $(this).find('gmgml\\:ORT, ORT').text();
  			var telefon = $(this).find('gmgml\\:TELEFON, TELEFON').text();
  			var fax = $(this).find('gmgml\\:FAX, FAX').text();
  			var email = $(this).find('gmgml\\:EMAIL, EMAIL').text();
  			var webspace = $(this).find('gmgml\\:WEBSPACE, WEBSPACE').text();
  			var timestamp = new Date($(this).find('gmgml\\:TIMESTAMP, TIMESTAMP').text());

  			/* determine latitude and longitude */
  			var position = $(this).find('gml\\:pos, pos').text();
  			var delimiter = position.indexOf(' ');
  			
  			var lat = position.substr(0, delimiter);
  			var lng = position.substr(delimiter + 1, position.length);
  			
  			var point = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
  			OpenSBG.bounds.extend(point);
  			
  			/* select marker image */
  			var image = 'markers/';
  			
  			if(bereich.indexOf('Amtsgebäude') != -1)
  		    image += 'administration.png';
  		  else if(bereich.indexOf('Bewohnerservicestellen') != -1)
  		    image += 'service.png';
  		  else if(bereich.indexOf('Gymnasien') != -1)
  		    image += 'gym.png';
  		  else if(bereich.indexOf('Sonderschulen') != -1)
  		    image += 'specialschool.png';
  		  else if(bereich.indexOf('Hauptschulen') != -1 || bereich.indexOf('Volksschulen') != -1 || bereich.indexOf('Polytechnische') != -1)
  		    image += 'school.png';
    		else if(bezeichnung.indexOf('Polizei') != -1)
    		  image += 'police.png';
    		else if(bezeichnung.indexOf('Postamt') != -1)
    		  image += 'post.png';
    		else if(bezeichnung.toLowerCase().indexOf('feuerwehr') != -1)
    		  image += 'firestation.png' 
  		  else
  		    image += 'default.png';
  			
  			/* place marker */
  			var marker = new google.maps.Marker({
  				position : point,
  				map : OpenSBG.map,
  				icon : image
  			});
  			
  			/* overlay window */
  			var infoWindow = new google.maps.InfoWindow();
  			
  			/* sidebar info*/
  			var html = '';
  			html += '<h4>' + bereich + '</h4>';
  			html += '<h1>' + bezeichnung + '</h1>';
  			html += '<p>' + adresse;
  			if(ort)
  			  html += ', ' + ort;
  		  html += '</p>';
  			if(beschreibung)
  			  html += '<p>' + beschreibung + '</p>';
  			if(kontakt)
  			  html += '<p>Kontakt: ' + kontakt + '</p>';
  			if(telefon)
  			  html += 'Telefon: ' + telefon + '<br />';
  		  if(fax)
  		    html += 'Fax: ' + fax + '<br />';
  		  if(email)
  		    html += 'E-Mail: ' + email + '<br />';
  			if(webspace)
  			  html += '<p><a href="' + webspace + '">' + webspace + '</a></p>';
    		html += '<p>zuletzt geändert: ' + timestamp + '</p>';
  			
  			google.maps.event.addListener(marker, 'click', function() {
  			  $("#sidebar").html(html);
  				infoWindow.setContent(bezeichnung);
  				infoWindow.open(OpenSBG.map, marker);
  			});
  			
  			//OpenSBG.map.fitBounds(OpenSBG.bounds);
  		});
  	});
	}
}