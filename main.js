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
  $('#defaultView').click(function() {
    OpenSBG.defaultView(zoom);
  });
  
  $('.checkbox').change(function() {
    $(this).is(':checked') ? OpenSBG.showMarkers($(this).val()) : OpenSBG.hideMarkers($(this).val());
  });
});

var OpenSBG = {
  map : null,
  bounds : null,
  infowindow : null,
  markers : new Array(),

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
        object.id = $(this).find('gmgml\\:GDO_GID, GDO_GID').text();
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
        object.oeffnungszeiten = $(this).find('gmgml\\:OEFFN_ZEIT, OEFFN_ZEIT').text();

        /* determine latitude and longitude */
        object.position = $(this).find('gml\\:pos, pos').text();
        object.delimiter = object.position.indexOf(' ');

        object.lat = object.position.substr(0, object.delimiter);
        object.lng = object.position.substr(object.delimiter + 1, object.position.length);

        object.point = new google.maps.LatLng(object.lat, object.lng);

        /* assign the object to a category */
        if(object.bereich.indexOf('Amtsgebäude') != -1)
          object.category = 'administration';
        else if(object.bereich.indexOf('Bewohnerservicestellen') != -1)
          object.category = 'service';
        else if(object.bereich.indexOf('Gymnasien') != -1)
          object.category = 'gym';
        else if(object.bereich.indexOf('Sonderschulen') != -1)
          object.category = 'specialschool';
        else if(object.bereich.indexOf('Hauptschulen') != -1 || object.bereich.indexOf('Volksschulen') != -1 || object.bereich.indexOf('Polytechnische') != -1)
          object.category = 'school';
        else if(object.bezeichnung.indexOf('Polizei') != -1)
          object.category = 'police';
        else if(object.bezeichnung.indexOf('Postamt') != -1)
          object.category = 'post';
        else if(object.bezeichnung.toLowerCase().indexOf('feuerwehr') != -1)
          object.category = 'firestation';
        else if(object.bezeichnung.indexOf('Kraftfahrzeugzulassungsbehörde') != -1)
          object.category = 'truck';
        else if(object.bezeichnung.indexOf('Kurhaus') != -1)
          object.category = 'kurhaus';
        else if(object.bezeichnung.indexOf('Freibad') != -1)
          object.category = 'swimming';
        else if(object.bezeichnung.indexOf('Gericht') != -1 || object.bezeichnung.indexOf('Justiz') != -1)
          object.category = 'justice';
        else if(object.bezeichnung.indexOf('Finanz') != -1)
          object.category = 'finance';
        else
          object.category += 'default';
          
        /* choose correct marker image */
        object.image = 'style/images/markers/' + object.category + '.png';

        /* create marker */
        OpenSBG.map.addMarker(OpenSBG.createMarker(object, object.point));
        OpenSBG.bounds.extend(object.point);
        
        /* hide markers on page reload */
        $('.checkbox').each(function() {
          if(!$(this).is(':checked'))
            OpenSBG.hideMarkers($(this).val());
        });
      });
    });
  },
  
  createMarker : function(object, point) {
    var marker = new google.maps.Marker({
      position : point,
      map : OpenSBG.map,
      icon : object.image
    });
    
    /* store the category of the object*/
    marker.category = object.category;
    
    /* push the marker in a marker array */
    OpenSBG.markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
      /* info window on click */
      if(OpenSBG.infowindow)
        OpenSBG.infowindow.close();

      OpenSBG.infowindow = new google.maps.InfoWindow({
        content : object.bezeichnung
      });
      OpenSBG.infowindow.open(OpenSBG.map, marker);

      /* sidebar info on click */
      $('#info').html(OpenSBG.showSidebarInfo(object));
      
      /* load comments */
      $.ajax({
        url: 'php/comments.php',
        data: { q: object.id },
        success: function(data) {
          $('#comments').html(data);
        }
      });
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
    if(object.oeffnungszeiten)
      html += '<p>Öffnungszeiten:<br />' + object.oeffnungszeiten + '</p>';

    return html;
  },
  
  showMarkers : function(category) {
    for(var i = 0; i < OpenSBG.markers.length; i++) {
      if(OpenSBG.markers[i].category == category) {
        OpenSBG.markers[i].setVisible(true);
      }
    }
  },
  
  hideMarkers : function(category) {
    for(var i = 0; i < OpenSBG.markers.length; i++) {
      if(OpenSBG.markers[i].category == category) {
        OpenSBG.markers[i].setVisible(false);
      }
    }
    
    if(OpenSBG.infowindow)
      OpenSBG.infowindow.close();
  }
};