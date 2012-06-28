$(document).ready(function() {
  var myLatLng = new google.maps.LatLng(47.80949,13.05501);
  
  OPENSBG.init(document.getElementById("map_canvas"), myLatLng, 14);
});

var OPENSBG = {
  map: null,
	bounds: null
}

OPENSBG.init = function(selector, latLng, zoom) {
  var myOptions = {
    zoom:zoom,
    center: latLng,
    mapTypeId: google.maps.MapTypeId.HYBRID
  }
  
  this.map = new google.maps.Map($(selector)[0], myOptions);
	this.bounds = new google.maps.LatLngBounds();
}