$(document).ready(function() {
  /* map configuration */
  var canvas  = 'map_canvas';
  var lat     = 47.80949;
  var lng     = 13.05501;
  var zoom    = 14;
  var type    = google.maps.MapTypeId.HYBRID;
  var xmlFile = 'open_sbg.xml';

  /* helper methods */
  google.maps.Map.prototype.markers = new Array();

  google.maps.Map.prototype.addMarker = function(marker) {
    this.markers[this.markers.length] = marker;
  };

  /* initialize map and place markers */
  OpenSBG.init(canvas, lat, lng, zoom, type);
  OpenSBG.placeMarkers(xmlFile);

  /* show default view */
  $("#defaultView").click(function() {
    OpenSBG.defaultView(zoom);
  });
});

var OpenSBG = {
  map : null,
  bounds : null,
  infowindow : null,

  init : function(canvas, lat, lng, zoom, type) {
    var options = {
      center : new google.maps.LatLng(lat, lng),
      zoom : zoom,
      mapTypeId : type
    };

    this.map = new google.maps.Map(document.getElementById(canvas), options);
    this.bounds = new google.maps.LatLngBounds();

    OpenSBG.defaultView(zoom);
  },

  defaultView : function (zoom) {
    OpenSBG.map.fitBounds(OpenSBG.bounds);

    var zoomChangeBoundsListener = google.maps.event.addListenerOnce(OpenSBG.map, 'bounds_changed', function(event) {
      if(OpenSBG.map.getZoom()) OpenSBG.map.setZoom(zoom);
    });

    setTimeout(function() {
      google.maps.event.removeListener(zoomChangeBoundsListener)
    }, 2000);

    if(OpenSBG.infowindow)
      OpenSBG.infowindow.close();
  },

  placeMarkers : function(filename) {
    $.get(filename, function(xml) {
      $(xml).find('gml\\:featureMember, featureMember').each(function() {
        var object = new Object();

        /* assign info to object */
        object.bereich = $(this).find('gmgml\\:BEREICH, BEREICH').text();
        object.bezeichnung = $(this).find('gmgml\\:BEZEICHNUNG, BEZEICHNUNG').text();
        object.beschreibung = $(this).find('gmgml\\:BESCHREIBUNG, BESCHREIBUNG').text();
        object.kontakt = $(this).find('gmgml\\:KONTAKT, KONTAKT').text();
        object.adresse = $(this).find('gmgml\\:ADRESSE, ADRESSE').text();
        object.ort = $(this).find('gmgml\\:ORT, ORT').text();
        object.telefon = $(this).find('gmgml\\:TELEFON, TELEFON').text();
        object.fax = $(this).find('gmgml\\:FAX, FAX').text();
        object.email = $(this).find('gmgml\\:EMAIL, EMAIL').text();
        object.webspace = $(this).find('gmgml\\:WEBSPACE, WEBSPACE').text();
        object.timestamp = new Date($(this).find('gmgml\\:TIMESTAMP, TIMESTAMP').text());

        /* determine latitude and longitude */
        object.position = $(this).find('gml\\:pos, pos').text();
        object.delimiter = object.position.indexOf(' ');

        object.lat = object.position.substr(0, object.delimiter);
        object.lng = object.position.substr(object.delimiter + 1, object.position.length);

        object.point = new google.maps.LatLng(object.lat, object.lng);

        /* choose correct marker image */
        object.image = 'markers/';

        if(object.bereich.indexOf('Amtsgebäude') != -1)
          object.image += 'administration.png';
        else if(object.bereich.indexOf('Bewohnerservicestellen') != -1)
          object.image += 'service.png';
        else if(object.bereich.indexOf('Gymnasien') != -1)
          object.image += 'gym.png';
        else if(object.bereich.indexOf('Sonderschulen') != -1)
          object.image += 'specialschool.png';
        else if(object.bereich.indexOf('Hauptschulen') != -1 || object.bereich.indexOf('Volksschulen') != -1 || object.bereich.indexOf('Polytechnische') != -1)
          object.image += 'school.png';
        else if(object.bezeichnung.indexOf('Polizei') != -1)
          object.image += 'police.png';
        else if(object.bezeichnung.indexOf('Postamt') != -1)
          object.image += 'post.png';
        else if(object.bezeichnung.toLowerCase().indexOf('feuerwehr') != -1)
          object.image += 'firestation.png';
        else if(object.bezeichnung.indexOf('Kraftfahrzeugzulassungsbehörde') != -1)
          object.image += 'truck.png';
        else if(object.bezeichnung.indexOf('Kurhaus') != -1)
          object.image += 'kurhaus.png';
        else if(object.bezeichnung.indexOf('Freibad') != -1)
          object.image += 'swimming.png';
        else if(object.bezeichnung.indexOf('Gericht') != -1 || object.bezeichnung.indexOf('Justiz') != -1)
          object.image += 'justice.png';
        else if(object.bezeichnung.indexOf('Finanz') != -1)
          object.image += 'finance.png';
        else
          object.image += 'default.png';

        /* create marker */
        OpenSBG.map.addMarker(OpenSBG.createMarker(object, object.point));
        OpenSBG.bounds.extend(object.point);
      });
    });
  },

  createMarker : function(object, point) {
    var marker = new google.maps.Marker({
      position: point,
      map: OpenSBG.map,
      icon: object.image
    });

    google.maps.event.addListener(marker, 'click', function() {
      /* info window on click */
      if(OpenSBG.infowindow)
        OpenSBG.infowindow.close();

      OpenSBG.infowindow = new google.maps.InfoWindow({
        content: object.bezeichnung
      });
      OpenSBG.infowindow.open(OpenSBG.map, marker);

      /* sidebar info on click */
      $('#info').html(OpenSBG.showSidebarInfo(object));
    });

    return marker;
  },

  showSidebarInfo : function(object) {
    var html = '';

    html += '<h4>' + object.bereich + '</h4>';
    html += '<h1>' + object.bezeichnung + '</h1>';
    html += '<p>' + object.adresse;
    if(object.ort)
      html += ', ' + object.ort;
    html += '</p>';
    if(object.beschreibung)
      html += '<p>' + object.beschreibung + '</p>';
    if(object.kontakt)
      html += '<p>Kontakt: ' + object.kontakt + '</p>';
    if(object.telefon)
      html += 'Telefon: ' + object.telefon + '<br />';
    if(object.fax)
      html += 'Fax: ' + object.fax + '<br />';
    if(object.email)
      html += 'E-Mail: ' + object.email + '<br />';
    if(object.webspace)
      html += '<p><a href="' + object.webspace + '">' + object.webspace + '</a></p>';
    html += '<p>zuletzt geändert: ' + object.timestamp + '</p>';

    return html;
  }
};