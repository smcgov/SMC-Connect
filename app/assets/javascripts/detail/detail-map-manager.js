// manages results maps view
define(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false!callback','util/util',
         'domReady!'],function(util) {
  'use strict';

  // PRIVATE PROPERTIES
  var _map;
  var _markerData; // markers on the map
  var _markersArray; // array for storing markers
  var _markerBounds; // the bounds of the markers
  var _locationMarker; // the location of the current org
  var _mapCanvas; // the details map div
  var _infoWindow = new google.maps.InfoWindow(); // info window to pop up on roll over

  // PUBLIC METHODS
  function init()
  {
    _mapCanvas = document.getElementById("detail-map-canvas");
    _markersArray = [];

    if (_mapCanvas)
    {
      var title = document.getElementById("detail-map-canvas-title");
      var lat = document.getElementById("detail-map-canvas-lat");
      var lng = document.getElementById("detail-map-canvas-lng");

      title = title.innerHTML;
      lat = lat.innerHTML;
      lng = lng.innerHTML;

      var latLng = new google.maps.LatLng(lat,lng);

      var mapOptions = {
        zoom: 16,
        center: latLng,
        scrollwheel: false,
        zoomControl: true,
        panControl: false,
        streetViewControl: false,
        scaleControl: true,
        scaleControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },

        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      _map = new google.maps.Map(document.getElementById("detail-map-canvas"), mapOptions);

      _locationMarker = new google.maps.Marker({
          map: _map,
          title: title,
          position: latLng
        });

      google.maps.event.addListener(_locationMarker, 'click', function() {
        _infoWindow.setContent(title);
        _infoWindow.open(_map, _locationMarker);
      });

      _refresh();
    }
    else
    {
      console.log("Warning: The detail map container was not found!");
    }

  }

  // refresh the data
  function _refresh()
  {
    if (_markersArray.length > 0)
    {
      _map.fitBounds(_markerBounds);
    }
    else
    {
      _map.setZoom(16);
      _map.setCenter(_locationMarker.getPosition());
    }
  }

  return {
    init:init
  };
},
function (err)
{
  'use strict';
  //The error callback
  //The err object has a list of modules that failed
  var failedId = err.requireModules && err.requireModules[0];

  console.log("Map failed to load! Hiding map HTML code.",failedId);

  var mapContainer = document.getElementById('map-view');
  mapContainer.classList.add('hide');
});
