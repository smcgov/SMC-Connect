// Manages search results view Google Map.
define([
  'util/bitmask',
  'util/map/marker_manager',
  'domReady!',
  'async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false!callback'
],
function (bitmask, markerManager) {
  'use strict';

  // The <div> element that the Google map loads into.
  var _map;

  // The parent HTML element of the map.
  var _mapCanvas;

  // The element that controls the expanding/contracting of the map.
  var _mapViewControl;

  // Whether the map is at its max size or not.
  var _atMaxSize = false;

  // Parsed JSON object of map marker data (positioning, label, etc.).
  var _markerData;

  // The collective map bounds of the markers.
  var _markerBounds;

  // 'Constants' for map button text content.
  var LARGER_MAP_TEXT = "<i class='fa fa-minus-square'></i> Smaller map";
  var SMALLER_MAP_TEXT = "<i class='fa fa-plus-square'></i> Larger map";

  // Default 'constants' that get set to the specific marker kinds
  // listed above at runtime.
  var LARGE_MARKER_URL;
  var SMALL_MARKER_URL;
  var LARGE_SPIDERFY_MARKER_URL;
  var SMALL_SPIDERFY_MARKER_URL;

  // The spiderfier layer for handling overlapping markers.
  // See https://github.com/jawj/OverlappingMarkerSpiderfier
  var _spiderfier;

  // The info box to pop up when rolling over a marker.
  var _infoBox;

  // 'Constant' for delay when showing/hiding the marker info box.
  var DEFAULT_INFOBOX_DELAY = 400;

  // A bitmask instance for tracking the different states of the infobox.
  var _infoBoxState;

  // The possible conditions that determine the infobox's behavior.
  // The infobox is showing.
  var SHOW_INFOBOX = 1;

  // The cursor is over the infobox.
  var OVER_INFOBOX = 2;

  // The cursor is over the marker.
  var OVER_MARKER = 4;

  // The cursor is over a spiderfier marker.
  var OVER_SPIDERFY_MARKER = 8;

  // The infobox is pinned (it doesn't disappear when mouseout occurs).
  var PIN_INFOBOX = 16;

  // A marker cluster has been expanded (spiderfied).
  var HAS_SPIDERFIED = 32;

  // The mouseover event didn't fire on a marker, implying a touch interface.
  var IS_TOUCH = 64;

  // The timer for delaying the info box display.
  var _infoBoxDelay;

  // The marker the cursor is currently over.
  var _overMarker;

  // The marker InfoBox content that is currently showing.
  var _infoBoxContent;

  function init() {
    _infoBoxState = bitmask.create();

    // Turn off assumption that touch is being used initially, this is turned
    // on if a touch event is registered.
    _infoBoxState.turnOff(IS_TOUCH);

    // Only check for result map if the page isn't showing the no search
    // results view.
    var noResults = document.querySelector('#results-entries .no-results');
    if (!noResults) {
      var mapContainer = document.getElementById('map-view');
      if (mapContainer) {


        // ------------------------------------------------------------------
        // Inline Google Maps plugins.
        //
        // The OverlappingMarkerSpiderfier and InfoBox plugins are provided
        // inline below to ensure they are loaded after the asynchronous call
        // to the Google Maps API. These scripts may be loaded externally
        // using require() calls, however, this will not work when the
        // scripts are concatenated using the requirejs optimiser, as their
        // load order will no longer be respected in regard to the loading
        // of the Google Maps API (since it's being loaded asynchronously).
        //
        // These scripts are identical to the source, with the exception
        // that OverlappingMarkerSpiderfier has its final command 'call(this)'
        // replaced with 'call(window)' to ensure it is attached to the global
        // Window object, like the 'google' object is.
        // Additionally, the InfoBox script is wrapped in an anonymous
        // function and attached to the global Window object for the same
        // reason. The added code is below:
        //
        // window.InfoBox = (function(){ ... return InfoBox;})();

        (function (){
          // OverlappingMarkerSpiderfier
          // https://github.com/jawj/OverlappingMarkerSpiderfier
          // Copyright (c) 2011 - 2012 George MacKerron
          // Released under the MIT licence:
          // http://opensource.org/licenses/mit-license
          var h=!0,u=null,v=!1;
          (function(){var A,B={}.hasOwnProperty,C=[].slice;if(((A=this.google)!=u?A.maps:void 0)!=u)this.OverlappingMarkerSpiderfier=function(){function w(b,d){var a,g,f,e,c=this;this.map=b;d==u&&(d={});for(a in d)B.call(d,a)&&(g=d[a],this[a]=g);this.e=new this.constructor.g(this.map);this.n();this.b={};e=["click","zoom_changed","maptypeid_changed"];g=0;for(f=e.length;g<f;g++)a=e[g],p.addListener(this.map,a,function(){return c.unspiderfy()})}var p,s,t,q,k,c,y,z;c=w.prototype;z=[w,c];q=0;for(k=z.length;q<k;q++)t=
          z[q],t.VERSION="0.3.3";s=google.maps;p=s.event;k=s.MapTypeId;y=2*Math.PI;c.keepSpiderfied=v;c.markersWontHide=v;c.markersWontMove=v;c.nearbyDistance=20;c.circleSpiralSwitchover=9;c.circleFootSeparation=23;c.circleStartAngle=y/12;c.spiralFootSeparation=26;c.spiralLengthStart=11;c.spiralLengthFactor=4;c.spiderfiedZIndex=1E3;c.usualLegZIndex=10;c.highlightedLegZIndex=20;c.legWeight=1.5;c.legColors={usual:{},highlighted:{}};q=c.legColors.usual;t=c.legColors.highlighted;q[k.HYBRID]=q[k.SATELLITE]="#fff";
          t[k.HYBRID]=t[k.SATELLITE]="#f00";q[k.TERRAIN]=q[k.ROADMAP]="#444";t[k.TERRAIN]=t[k.ROADMAP]="#f00";c.n=function(){this.a=[];this.j=[]};c.addMarker=function(b){var d,a=this;if(b._oms!=u)return this;b._oms=h;d=[p.addListener(b,"click",function(d){return a.F(b,d)})];this.markersWontHide||d.push(p.addListener(b,"visible_changed",function(){return a.o(b,v)}));this.markersWontMove||d.push(p.addListener(b,"position_changed",function(){return a.o(b,h)}));this.j.push(d);this.a.push(b);return this};c.o=function(b,
          d){if(b._omsData!=u&&(d||!b.getVisible())&&!(this.s!=u||this.t!=u))return this.unspiderfy(d?b:u)};c.getMarkers=function(){return this.a.slice(0)};c.removeMarker=function(b){var d,a,g,f,e;b._omsData!=u&&this.unspiderfy();d=this.m(this.a,b);if(0>d)return this;g=this.j.splice(d,1)[0];f=0;for(e=g.length;f<e;f++)a=g[f],p.removeListener(a);delete b._oms;this.a.splice(d,1);return this};c.clearMarkers=function(){var b,d,a,g,f,e,c,m;this.unspiderfy();m=this.a;b=g=0;for(e=m.length;g<e;b=++g){a=m[b];d=this.j[b];
          f=0;for(c=d.length;f<c;f++)b=d[f],p.removeListener(b);delete a._oms}this.n();return this};c.addListener=function(b,d){var a,g;((g=(a=this.b)[b])!=u?g:a[b]=[]).push(d);return this};c.removeListener=function(b,d){var a;a=this.m(this.b[b],d);0>a||this.b[b].splice(a,1);return this};c.clearListeners=function(b){this.b[b]=[];return this};c.trigger=function(){var b,d,a,g,f,e;d=arguments[0];b=2<=arguments.length?C.call(arguments,1):[];d=(a=this.b[d])!=u?a:[];e=[];g=0;for(f=d.length;g<f;g++)a=d[g],e.push(a.apply(u,
          b));return e};c.u=function(b,d){var a,g,f,e,c;f=this.circleFootSeparation*(2+b)/y;g=y/b;c=[];for(a=e=0;0<=b?e<b:e>b;a=0<=b?++e:--e)a=this.circleStartAngle+a*g,c.push(new s.Point(d.x+f*Math.cos(a),d.y+f*Math.sin(a)));return c};c.v=function(b,d){var a,g,f,e,c;f=this.spiralLengthStart;a=0;c=[];for(g=e=0;0<=b?e<b:e>b;g=0<=b?++e:--e)a+=this.spiralFootSeparation/f+5E-4*g,g=new s.Point(d.x+f*Math.cos(a),d.y+f*Math.sin(a)),f+=y*this.spiralLengthFactor/a,c.push(g);return c};c.F=function(b,d){var a,g,f,e,c,
          m,l,x,n;e=b._omsData!=u;(!e||!this.keepSpiderfied)&&this.unspiderfy();if(e||this.map.getStreetView().getVisible()||"GoogleEarthAPI"===this.map.getMapTypeId())return this.trigger("click",b,d);e=[];c=[];a=this.nearbyDistance;m=a*a;f=this.c(b.position);n=this.a;l=0;for(x=n.length;l<x;l++)a=n[l],a.map!=u&&a.getVisible()&&(g=this.c(a.position),this.f(g,f)<m?e.push({A:a,p:g}):c.push(a));return 1===e.length?this.trigger("click",b,d):this.G(e,c)};c.markersNearMarker=function(b,d){var a,g,f,e,c,m,l,x,n,p;
          d==u&&(d=v);if(this.e.getProjection()==u)throw"Must wait for 'idle' event on map before calling markersNearMarker";a=this.nearbyDistance;c=a*a;f=this.c(b.position);e=[];x=this.a;m=0;for(l=x.length;m<l;m++)if(a=x[m],!(a===b||a.map==u||!a.getVisible()))if(g=this.c((n=(p=a._omsData)!=u?p.l:void 0)!=u?n:a.position),this.f(g,f)<c&&(e.push(a),d))break;return e};c.markersNearAnyOtherMarker=function(){var b,d,a,g,c,e,r,m,l,p,n,k;if(this.e.getProjection()==u)throw"Must wait for 'idle' event on map before calling markersNearAnyOtherMarker";
          e=this.nearbyDistance;b=e*e;g=this.a;e=[];n=0;for(a=g.length;n<a;n++)d=g[n],e.push({q:this.c((r=(l=d._omsData)!=u?l.l:void 0)!=u?r:d.position),d:v});n=this.a;d=r=0;for(l=n.length;r<l;d=++r)if(a=n[d],a.map!=u&&a.getVisible()&&(g=e[d],!g.d)){k=this.a;a=m=0;for(p=k.length;m<p;a=++m)if(c=k[a],a!==d&&(c.map!=u&&c.getVisible())&&(c=e[a],(!(a<d)||c.d)&&this.f(g.q,c.q)<b)){g.d=c.d=h;break}}n=this.a;a=[];b=r=0;for(l=n.length;r<l;b=++r)d=n[b],e[b].d&&a.push(d);return a};c.z=function(b){var d=this;return{h:function(){return b._omsData.i.setOptions({strokeColor:d.legColors.highlighted[d.map.mapTypeId],
          zIndex:d.highlightedLegZIndex})},k:function(){return b._omsData.i.setOptions({strokeColor:d.legColors.usual[d.map.mapTypeId],zIndex:d.usualLegZIndex})}}};c.G=function(b,d){var a,c,f,e,r,m,l,k,n,q;this.s=h;q=b.length;a=this.C(function(){var a,d,c;c=[];a=0;for(d=b.length;a<d;a++)k=b[a],c.push(k.p);return c}());e=q>=this.circleSpiralSwitchover?this.v(q,a).reverse():this.u(q,a);a=function(){var a,d,k,q=this;k=[];a=0;for(d=e.length;a<d;a++)f=e[a],c=this.D(f),n=this.B(b,function(a){return q.f(a.p,f)}),
          l=n.A,m=new s.Polyline({map:this.map,path:[l.position,c],strokeColor:this.legColors.usual[this.map.mapTypeId],strokeWeight:this.legWeight,zIndex:this.usualLegZIndex}),l._omsData={l:l.position,i:m},this.legColors.highlighted[this.map.mapTypeId]!==this.legColors.usual[this.map.mapTypeId]&&(r=this.z(l),l._omsData.w={h:p.addListener(l,"mouseover",r.h),k:p.addListener(l,"mouseout",r.k)}),l.setPosition(c),l.setZIndex(Math.round(this.spiderfiedZIndex+f.y)),k.push(l);return k}.call(this);delete this.s;this.r=
          h;return this.trigger("spiderfy",a,d)};c.unspiderfy=function(b){var d,a,c,f,e,k,m;b==u&&(b=u);if(this.r==u)return this;this.t=h;f=[];c=[];m=this.a;e=0;for(k=m.length;e<k;e++)a=m[e],a._omsData!=u?(a._omsData.i.setMap(u),a!==b&&a.setPosition(a._omsData.l),a.setZIndex(u),d=a._omsData.w,d!=u&&(p.removeListener(d.h),p.removeListener(d.k)),delete a._omsData,f.push(a)):c.push(a);delete this.t;delete this.r;this.trigger("unspiderfy",f,c);return this};c.f=function(b,d){var a,c;a=b.x-d.x;c=b.y-d.y;return a*
          a+c*c};c.C=function(b){var d,a,c,f,e;f=a=c=0;for(e=b.length;f<e;f++)d=b[f],a+=d.x,c+=d.y;b=b.length;return new s.Point(a/b,c/b)};c.c=function(b){return this.e.getProjection().fromLatLngToDivPixel(b)};c.D=function(b){return this.e.getProjection().fromDivPixelToLatLng(b)};c.B=function(b,c){var a,g,f,e,k,m;f=k=0;for(m=b.length;k<m;f=++k)if(e=b[f],e=c(e),"undefined"===typeof a||a===u||e<g)g=e,a=f;return b.splice(a,1)[0]};c.m=function(b,c){var a,g,f,e;if(b.indexOf!=u)return b.indexOf(c);a=f=0;for(e=b.length;f<
          e;a=++f)if(g=b[a],g===c)return a;return-1};w.g=function(b){return this.setMap(b)};w.g.prototype=new s.OverlayView;w.g.prototype.draw=function(){};return w}()}).call(this);}).call(window);
          /* Tue 7 May 2013 14:56:02 BST */

        // InfoBox, Google Maps Utility Library
        // From https://google-maps-utility-library-v3.googlecode.com
        // /svn/trunk/infobox/src/
        window.InfoBox = (function(){ function InfoBox(e){e=e||{};google.maps.OverlayView.apply(this,arguments);this.content_=e.content||"";this.disableAutoPan_=e.disableAutoPan||false;this.maxWidth_=e.maxWidth||0;this.pixelOffset_=e.pixelOffset||new google.maps.Size(0,0);this.position_=e.position||new google.maps.LatLng(0,0);this.zIndex_=e.zIndex||null;this.boxClass_=e.boxClass||"infoBox";this.boxStyle_=e.boxStyle||{};this.closeBoxMargin_=e.closeBoxMargin||"2px";this.closeBoxURL_=e.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(e.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=e.infoBoxClearance||new google.maps.Size(1,1);if(typeof e.visible==="undefined"){if(typeof e.isHidden==="undefined"){e.visible=true}else{e.visible=!e.isHidden}}this.isHidden_=!e.visible;this.alignBottom_=e.alignBottom||false;this.pane_=e.pane||"floatPane";this.enableEventPropagation_=e.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView;InfoBox.prototype.createInfoBoxDiv_=function(){var e;var t;var n;var r=this;var i=function(e){e.cancelBubble=true;if(e.stopPropagation){e.stopPropagation()}};var s=function(e){e.returnValue=false;if(e.preventDefault){e.preventDefault()}if(!r.enableEventPropagation_){i(e)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{n=this.getBoxWidths_();this.div_.style.width=this.div_.offsetWidth-n.left-n.right+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];t=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(e=0;e<t.length;e++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,t[e],i))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(e){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",s);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var e="";if(this.closeBoxURL_!==""){e="<img";e+=" src='"+this.closeBoxURL_+"'";e+=" align=right";e+=" style='";e+=" position: relative;";e+=" cursor: pointer;";e+=" margin: "+this.closeBoxMargin_+";";e+="'>"}return e};InfoBox.prototype.addClickHandler_=function(){var e;if(this.closeBoxURL_!==""){e=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(e,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var e=this;return function(t){t.cancelBubble=true;if(t.stopPropagation){t.stopPropagation()}google.maps.event.trigger(e,"closeclick");e.close()}};InfoBox.prototype.panBox_=function(e){var t;var n;var r=0,i=0;if(!e){t=this.getMap();if(t instanceof google.maps.Map){if(!t.getBounds().contains(this.position_)){t.setCenter(this.position_)}n=t.getBounds();var s=t.getDiv();var o=s.offsetWidth;var u=s.offsetHeight;var a=this.pixelOffset_.width;var f=this.pixelOffset_.height;var l=this.div_.offsetWidth;var c=this.div_.offsetHeight;var h=this.infoBoxClearance_.width;var p=this.infoBoxClearance_.height;var d=this.getProjection().fromLatLngToContainerPixel(this.position_);if(d.x<-a+h){r=d.x+a-h}else if(d.x+l+a+h>o){r=d.x+l+a+h-o}if(this.alignBottom_){if(d.y<-f+p+c){i=d.y+f-p-c}else if(d.y+f+p>u){i=d.y+f+p-u}}else{if(d.y<-f+p){i=d.y+f-p}else if(d.y+c+f+p>u){i=d.y+c+f+p-u}}if(!(r===0&&i===0)){var v=t.getCenter();t.panBy(r,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var e,t;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";t=this.boxStyle_;for(e in t){if(t.hasOwnProperty(e)){this.div_.style[e]=t[e]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+this.div_.style.opacity*100+')"';this.div_.style.filter="alpha(opacity="+this.div_.style.opacity*100+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var e;var t={top:0,bottom:0,left:0,right:0};var n=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){e=n.ownerDocument.defaultView.getComputedStyle(n,"");if(e){t.top=parseInt(e.borderTopWidth,10)||0;t.bottom=parseInt(e.borderBottomWidth,10)||0;t.left=parseInt(e.borderLeftWidth,10)||0;t.right=parseInt(e.borderRightWidth,10)||0}}else if(document.documentElement.currentStyle){if(n.currentStyle){t.top=parseInt(n.currentStyle.borderTopWidth,10)||0;t.bottom=parseInt(n.currentStyle.borderBottomWidth,10)||0;t.left=parseInt(n.currentStyle.borderLeftWidth,10)||0;t.right=parseInt(n.currentStyle.borderRightWidth,10)||0}}return t};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var e=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=e.x+this.pixelOffset_.width+"px";if(this.alignBottom_){this.div_.style.bottom=-(e.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=e.y+this.pixelOffset_.height+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(e){if(typeof e.boxClass!=="undefined"){this.boxClass_=e.boxClass;this.setBoxStyle_()}if(typeof e.boxStyle!=="undefined"){this.boxStyle_=e.boxStyle;this.setBoxStyle_()}if(typeof e.content!=="undefined"){this.setContent(e.content)}if(typeof e.disableAutoPan!=="undefined"){this.disableAutoPan_=e.disableAutoPan}if(typeof e.maxWidth!=="undefined"){this.maxWidth_=e.maxWidth}if(typeof e.pixelOffset!=="undefined"){this.pixelOffset_=e.pixelOffset}if(typeof e.alignBottom!=="undefined"){this.alignBottom_=e.alignBottom}if(typeof e.position!=="undefined"){this.setPosition(e.position)}if(typeof e.zIndex!=="undefined"){this.setZIndex(e.zIndex)}if(typeof e.closeBoxMargin!=="undefined"){this.closeBoxMargin_=e.closeBoxMargin}if(typeof e.closeBoxURL!=="undefined"){this.closeBoxURL_=e.closeBoxURL}if(typeof e.infoBoxClearance!=="undefined"){this.infoBoxClearance_=e.infoBoxClearance}if(typeof e.isHidden!=="undefined"){this.isHidden_=e.isHidden}if(typeof e.visible!=="undefined"){this.isHidden_=!e.visible}if(typeof e.enableEventPropagation!=="undefined"){this.enableEventPropagation_=e.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(e){this.content_=e;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof e.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+e}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(e)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof e.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+e}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(e)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(e){this.position_=e;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(e){this.zIndex_=e;if(this.div_){this.div_.style.zIndex=e}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(e){this.isHidden_=!e;if(this.div_){this.div_.style.visibility=this.isHidden_?"hidden":"visible"}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var e;if(typeof this.getMap()==="undefined"||this.getMap()===null){e=false}else{e=!this.isHidden_}return e};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(e,t){var n=this;if(t){this.position_=t.getPosition();this.moveListener_=google.maps.event.addListener(t,"position_changed",function(){n.setPosition(this.getPosition())})}this.setMap(e);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var e;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(e=0;e<this.eventListeners_.length;e++){google.maps.event.removeListener(this.eventListeners_[e])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)}; return InfoBox;})();
        // ------------------------------------------------------------------


        _mapCanvas = document.getElementById('map-canvas');
        _mapViewControl = document.getElementById('map-view-control');
        _mapViewControl.innerHTML = SMALLER_MAP_TEXT;

        // Turns off Google Points-Of-Interest (POI) markers so the user
        // doesn't click a POI and get an infowindow popped up.
        var poiStyles =[
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [
                      { visibility: 'off' }
                ]
            }
        ];

        var mapOptions = {
          zoom: 15,
          scrollwheel: false,
          zoomControl: true,
          panControl: false,
          streetViewControl: false,
          scaleControl: true,
          scaleControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          mapTypeControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: poiStyles
        };

        var spiderfierOptions = {
          legWeight: 2,
          circleFootSeparation: 30,
          keepSpiderfied: true,
          nearbyDistance: 40
        };

        var infoBoxOptions = {
          disableAutoPan: false,
          pixelOffset: new google.maps.Size(7, -7),
          zIndex: null,
          infoBoxClearance: new google.maps.Size(1, 1),
          isHidden: false,
          closeBoxURL: '',
          enableEventPropagation: false
        };

        _map = new google.maps.Map(_mapCanvas, mapOptions);
        _spiderfier = new OverlappingMarkerSpiderfier(_map, spiderfierOptions);
        _infoBox = new InfoBox(infoBoxOptions);

        _loadMarkers();
        _refresh();

        // Register events for map interactivity.
        google.maps.event.addListener(_map, 'idle', _mapIdle);
        google.maps.event.addListener(_map, 'click', _mapClick);
        _mapViewControl.addEventListener('click', _mapViewControlClicked, false);

        _mapCanvas.addEventListener('touchstart', _mapTouch, false);

        // Register events for info box interactivity.
        google.maps.event.addListener(_infoBox, 'domready', function() {
          var contentDiv = _mapCanvas.querySelector('.infoBox');
          var buttonClose = contentDiv.querySelector('.button-close');
          contentDiv.addEventListener('mousemove', _overInfoBoxHandler, false);
          contentDiv.addEventListener('mouseleave', _leaveInfoBoxHandler, false);
          buttonClose.addEventListener('mousedown', _closeInfoBoxHandler, false);
        });

        // Hack to close the info box when it moves. The spiderfier layer can
        // cause the info box to move to the last unspiderfied marker when
        // clicking a regular marker in some cases.
        google.maps.event.addListener(_infoBox, 'position_changed', function(evt) {
          this.close();
          _infoBoxState.turnOff(SHOW_INFOBOX);
        });

      } else {
        console.log('Warning: The result map container was not found!');
      }
    }
  }

  // Event handler for when the map is idle. This is used by the spiderfier
  // to style the map markers that will spiderfy when clicked.
  function _mapIdle() {
    _setAllIcons();
    google.maps.event.addListener(_map, 'zoom_changed', _mapZoomed);
    // Remove idle listeners as they aren't needed after the spiderfied markers
    // are styled for the first time.
    google.maps.event.clearListeners(_map, 'idle');
  }

  // Event handler for when the map is zoomed. This is used by the spiderfier
  // to handle style changes to the map markers that will spiderfy when clicked.
  function _mapZoomed() {
    _setAllIcons();
  }

  // Event handler for when the map is clicked. This is used to close
  // any currently open info box.
  function _mapClick() {
    _turnOffInfoBoxStates();
    _updateInfoBoxState(0);
  }

  // Event handler for when a touch event occurs on the map, for
  // changing the interactivity to accommodate lack of mouseover/out events.
  function _mapTouch() {
    _infoBoxState.turnOn(IS_TOUCH);
    _mapCanvas.removeEventListener('touchstart', _mapTouch, false);
  }

  function _overInfoBoxHandler(evt) {
    _infoBoxState.turnOn(OVER_INFOBOX);
    _updateInfoBoxState();
  }

  function _leaveInfoBoxHandler(evt) {
    _infoBoxState.turnOff(OVER_INFOBOX);
    _updateInfoBoxState();
  }

  function _closeInfoBoxHandler(evt) {
    _turnOffInfoBoxStates();
    _updateInfoBoxState(0);
  }

  // Run through the markers and set them to a spiderfied large or small
  // appearance based on the size of the map.
  function _setAllIcons() {

    // Style all markers.
    var markers = _spiderfier.getMarkers();
    var index = markers.length - 1;
    while(index >= 0) {
      _setIcon(markers[index--], false);
    }

    // Style spiderfier markers.
    markers = _spiderfier.markersNearAnyOtherMarker();
    index = markers.length - 1;
    while(index >= 0) {
      _setIcon(markers[index--], true);
    }
  }

  // Set the icon for a marker to the large or small regular
  // or spiderfied marker.
  // @param marker [Object] a map marker.
  // @param useSpiderfied [Boolean] true if the spiderfied marker should
  // be used, false otherwise.
  function _setIcon(marker, useSpiderfied) {
    var manager = marker.manager;
    if (useSpiderfied) {
      if (_atMaxSize) manager.turnOn(manager.LARGE_ICON | manager.SPIDERFIED_ICON);
      else            manager.turnOn(manager.SMALL_ICON | manager.SPIDERFIED_ICON);
    }
    else {
      if (_atMaxSize) manager.turnOn(manager.LARGE_ICON | manager.UNSPIDERFIED_ICON);
      else            manager.turnOn(manager.SMALL_ICON | manager.UNSPIDERFIED_ICON);
    }
    marker.setIcon(manager.getIcon());
  }

  // Updates the marker icons to the size set for the map.
  function _updateMarkerSizes() {
    var markers = _spiderfier.getMarkers();
    var index = markers.length - 1;
    var marker;
    while(index >= 0) {
      marker = markers[index--];
      marker.setIcon(marker.manager.getIcon());
    }
  }

  // Map view control was clicked. This control toggles the large and small maps.
  function _mapViewControlClicked(evt) {
    if (_atMaxSize) {
      _mapCanvas.classList.remove('max');
      _mapViewControl.innerHTML = SMALLER_MAP_TEXT;
      _atMaxSize = false;
    }
    else {
      _mapCanvas.classList.add('max');
      _mapViewControl.innerHTML = LARGER_MAP_TEXT;
      _atMaxSize = true;
    }
    _updateMarkerSizes();
    _refresh();

    evt.preventDefault();
  }

  // Loads the map markers.
  function _loadMarkers() {
    var locations = document.getElementById('map-locations');
    if (locations) {
      // Load the map marker data from the JSON map data embedded in the DOM.
      _markerData = JSON.parse(locations.innerHTML);

      // Remove the script element from the DOM
      locations.parentNode.removeChild(locations);
      _markerBounds = new google.maps.LatLngBounds();

      var index = _markerData.length - 1;
      var marker;
      while(index >= 0) {
        marker = _loadMarker(_markerData[index--]);
      }

      _overMarker = marker;
    }
  }

  // Load a single map marker.
  // @returns [Object] A google.maps.Marker instance that was created.
  function _loadMarker(markerData) {
    if (markerData['latitude'] && markerData['longitude']) {
      var myLatLng = new google.maps.LatLng(markerData['latitude'],
                                            markerData['longitude']);

      var markerProxy = markerManager.create(markerData.kind);

      if (_atMaxSize)
        markerProxy.turnOn(markerProxy.LARGE_ICON);
      else
        markerProxy.turnOn(markerProxy.SMALL_ICON);

      var markerOptions = {
        map: _map,
        position: myLatLng,
        icon: markerProxy.getIcon(),
        optimized: false,
        manager: markerProxy
      };
      var marker = new google.maps.Marker(markerOptions);

      _spiderfier.addMarker(marker);

      var mainName = markerData.name;
      var orgName = markerData.org_name;
      var agency = '';
      if (orgName != markerData.name)
        agency = '<h2>' + orgName + '</h2>';

      var content = "<div><div class='button-close'></div>" +
                    '<h1>' + mainName + '</h1>' + agency +
                    '<p>' + markerData.street_address + ', ' +
                    markerData.city + '</p>' + "<p><a href='/locations/" +
                    markerData.slug+(window.location.search) +
                    "'>View more details…</a></p></div>";

      _makeInfoBoxEvent(marker, content);

      _markerBounds.extend(myLatLng);
    }

    return marker;
  }

  // Open the global info box after a delay.
  // @param delay [Number] Delay in milliseconds before opening the info box.
  // If not specified, the delay will be the DEFAULT_INFOBOX_DELAY value.
  function _openInfoBox(delay) {
    _infoBoxDelay = setTimeout(function () {
      _infoBox.setContent(_infoBoxContent);
      _infoBox.open(_map, _overMarker);
      _infoBoxState.turnOn(SHOW_INFOBOX);
    }, delay);
  }

  // Open the global info box after a delay.
  // @param delay [Number] Delay in milliseconds before closing the info box.
  // If not specified, the delay will be the DEFAULT_INFOBOX_DELAY value.
  function _closeInfoBox(delay) {
    _infoBoxDelay = setTimeout(function () {
      _infoBox.close();
      _infoBoxState.turnOff(SHOW_INFOBOX);
    }, delay);
  }

  // Set the settings for the info box to its closed state.
  function _turnOffInfoBoxStates() {
    _infoBoxState.turnOff(OVER_INFOBOX);
    _infoBoxState.turnOff(SHOW_INFOBOX);
    _infoBoxState.turnOff(PIN_INFOBOX);
    _infoBoxState.turnOff(OVER_MARKER);
    _infoBoxState.turnOff(OVER_SPIDERFY_MARKER);
  }

  // Update info box state. Based on the bitmask bits that are set this will
  // open or close the info box.
  // @param delay [Number] Delay in milliseconds before closing the info box.
  function _updateInfoBoxState(delay) {
    // Clear any transitions in progress.
    if (_infoBoxDelay) clearTimeout(_infoBoxDelay);

    // If delay is not set use the default delay value.
    var setDelay = delay !== undefined ? delay : DEFAULT_INFOBOX_DELAY;

    if (  _infoBoxState.isOn(OVER_MARKER) &&
          _infoBoxState.isOff(OVER_SPIDERFY_MARKER) &&
          (_infoBoxState.isOff(SHOW_INFOBOX) ||
           _infoBox.getContent() !== _infoBoxContent)
      ) {
      _openInfoBox(setDelay);
    }
    else if ( _infoBoxState.isOff(PIN_INFOBOX) &&
              _infoBoxState.isOff(OVER_INFOBOX) &&
              _infoBoxState.isOff(OVER_MARKER) )  {
      _closeInfoBox(setDelay);
    }
  }

  // Make info box events associated with a map marker.
  // @param marker [Object] The marker that triggered the opening of the
  // info box.
  // @param content [String] The text content of the info box.
  function _makeInfoBoxEvent(marker, content) {

    // Change marker icon appearances when the markers spiderfy.
    _spiderfier.addListener('spiderfy', function(spiderfied, unspiderfied) {
      _infoBoxState.turnOn(HAS_SPIDERFIED);
      var index = spiderfied.length - 1;
      while(index >= 0) {
        _setIcon(spiderfied[index--], false);
      }
    });

    // Change marker icon appearances when the markers unspiderfy.
    _spiderfier.addListener('unspiderfy', function(spiderfied, unspiderfied) {
      var index = spiderfied.length - 1;
      while(index >= 0) {
        _setIcon(spiderfied[index--], true);
      }
    });

    // Register the marker the cursor has rolled over.
    google.maps.event.addListener(marker, 'mouseover', function() {
      if (_overMarker !== marker) _infoBoxState.turnOff(PIN_INFOBOX);
      if (_infoBoxState.isOff(PIN_INFOBOX)) {
        _registerMarker(marker, content);
        _updateInfoBoxState();
      }
    });

    // Unregister the marker the cursor rolled out of.
    google.maps.event.addListener(marker, 'mouseout', function() {
      _infoBoxState.turnOff(OVER_MARKER);
      _infoBoxState.turnOff(OVER_SPIDERFY_MARKER);
      _updateInfoBoxState();
    });

    // When user clicks the marker, open the infoBox and center the map on the marker.
    // Unless the user clicked a marker that just spiderfied.
    google.maps.event.addListener(marker, 'click', function() {

      // Touch displays don't know they're over a marker till it's tapped,
      // so manually register the state as being over the marker in this case.
      if (_infoBoxState.isOn(IS_TOUCH))
        _registerMarker(marker, content);

      if (_infoBoxState.isOn(HAS_SPIDERFIED)) {
        _infoBoxState.turnOff(HAS_SPIDERFIED);
      }
      else if (_infoBoxState.isOn(PIN_INFOBOX)){
        _turnOffInfoBoxStates();
        _updateInfoBoxState(0);
      }
      else {
        _map.panTo(marker.position);
        _infoBoxState.turnOn(PIN_INFOBOX);
        _infoBoxState.turnOn(OVER_MARKER);
        _infoBoxState.turnOff(OVER_SPIDERFY_MARKER);
        _updateInfoBoxState(0);
      }
    });
  }

  // Whether a map marker is a spiderfy marker.
  // @param marker [Object] a map marker.
  // @return [Boolean] true if the marker is spiderfied, false otherwise.
  function _isSpiderfyMarker(marker) {
    var manager = marker.manager;
    return manager.isOn(manager.SPIDERFIED_ICON);
  }

  // Register a marker as having been clicked.
  // @param marker [Object] The marker that was clicked.
  // @param content [String] The text content of the infobox for this marker.
  function _registerMarker(marker, content) {
    _overMarker = marker;
    if (_isSpiderfyMarker(marker))
      _infoBoxState.turnOn(OVER_SPIDERFY_MARKER);
    else
      _infoBoxState.turnOn(OVER_MARKER);

    _infoBoxState.turnOff(OVER_INFOBOX);
    _infoBoxState.turnOff(SHOW_INFOBOX);
    _infoBoxState.turnOff(PIN_INFOBOX);

    _infoBoxContent = content;
  }

  // Triggers a resize event and refits the map to the bounds of the markers.
  function _refresh() {
    google.maps.event.trigger(_map, 'resize');
    _map.fitBounds(_markerBounds);
  }

  return {
    init:init
  };
});