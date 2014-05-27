// manages geolocation action, which can be associated with a button most likely
define(['util/geolocation/geolocator','app/alert-manager','domReady!','async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false!callback'], function (geo,alert) {
  'use strict';

  // PRIVATE PROPERTIES
  var _locateTarget; // locate current location button.
  var _locateAction; // a callback function for the location is determined.


  // PUBLIC METHODS
  function init(target,locateAction)
  {
    if (navigator.geolocation) // if geolocation is supported, show geolocate button
    {
      _locateTarget = document.getElementById(target);
      _locateAction = locateAction;

      _locateTarget.addEventListener( 'click' , _currLocationAction , false );
      _locateTarget.classList.remove('hide');
    }
  }

  // Target element was clicked.
  function _currLocationAction(evt)
  {
    evt.preventDefault();
    _locateUser();
  }

  // Use geolocation to locate the user.
  function _locateUser()
  {
    // Callback object to hand off to geo locator object.
    var callBack = {
      success:function(position)
      {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        _reverseGeocodeLocation(latitude,longitude);
      },
      error:function(error)
      {
        //console.log("Geolocation failed due to: " + error.message);
        alert.show("Your location could not be determined!");
      }
    };

    geo.locate(callBack);
  }

  // Reverse geocode the location based on lat/long and place in address field.
  function _reverseGeocodeLocation(lat,lng)
  {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat,lng);

    geocoder.geocode({'latLng': latlng}, function(results, status)
    {
      if (status === google.maps.GeocoderStatus.OK && results[0])
      {
        _locateAction(results[0].formatted_address);
      }
      else
      {
        //console.log("Geocoder failed due to: " + status);
        alert.show("Your location could not be determined!");
      }
    });
  }

  return {
    init:init
  };
});

