function initialize() {
  var myOptions = {
    center: new google.maps.LatLng(47.80949,13.05501),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.HYBRID
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"),
      myOptions);
}