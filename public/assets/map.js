var componentForm = {
	route: 'long_name',
	locality: 'long_name',
	administrative_area_level_1: 'short_name'
};
var map;
var place;
var address;
var marker; 
var autocomplete;
var autocomplete_address;

function fillInAddress() {

	var styledMapType = new google.maps.StyledMapType(
		           	[
						
					  {
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#ebe3cd"
					      }
					    ]
					  },
					  {
					    "elementType": "labels.text.fill",
					    "stylers": [
					      {
					        "color": "#523735"
					      }
					    ]
					  },
					  {
					    "elementType": "labels.text.stroke",
					    "stylers": [
					      {
					        "color": "#f5f1e6"
					      }
					    ]
					  },
					  {
					    "featureType": "administrative",
					    "elementType": "geometry.stroke",
					    "stylers": [
					      {
					        "color": "#c9b2a6"
					      }
					    ]
					  },
					  {
					    "featureType": "administrative.land_parcel",
					    "elementType": "geometry.stroke",
					    "stylers": [
					      {
					        "color": "#dcd2be"
					      }
					    ]
					  },
					  {
					    "featureType": "administrative.land_parcel",
					    "elementType": "labels.text.fill",
					    "stylers": [
					      {
					        "color": "#ae9e90"
					      }
					    ]
					  },
					  {
					    "featureType": "landscape.natural",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#dfd2ae"
					      }
					    ]
					  },
					  {
					    "featureType": "poi",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#dfd2ae"
					      }
					    ]
					  },
					  {
					    "featureType": "poi",
					    "elementType": "labels.text.fill",
					    "stylers": [
					      {
					        "color": "#93817c"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.attraction",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.business",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.park",
					    "elementType": "geometry.fill",
					    "stylers": [
					      {
					        "color": "#a5b076"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.park",
					    "elementType": "labels.text.fill",
					    "stylers": [
					      {
					        "color": "#447530"
					      }
					    ]
					  },
					  {
					    "featureType": "road",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#f5f1e6"
					      }
					    ]
					  },
					  {
					    "featureType": "road.arterial",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#fdfcf8"
					      }
					    ]
					  },
					  {
					    "featureType": "road.highway",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#f8c967"
					      }
					    ]
					  },
					  {
					    "featureType": "road.highway",
					    "elementType": "geometry.stroke",
					    "stylers": [
					      {
					        "color": "#e9bc62"
					      }
					    ]
					  },
					  {
					    "featureType": "road.highway.controlled_access",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#e98d58"
					      }
					    ]
					  },
					  {
					    "featureType": "road.highway.controlled_access",
					    "elementType": "geometry.stroke",
					    "stylers": [
					      {
					        "color": "#db8555"
					      }
					    ]
					  },
					  {
					    "featureType": "road.local",
					    "elementType": "labels.text.fill",
					    "stylers": [
					      {
					        "color": "#806b63"
					      }
					    ]
					  },
					  {
					    "featureType": "transit.line",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#dfd2ae"
					      }
					    ]
					  },
					  {
					    "featureType": "transit.line",
					    "elementType": "labels.text.fill",
					    "stylers": [
					      {
					        "color": "#8f7d77"
					      }
					    ]
					  },
					  {
					    "featureType": "transit.line",
					    "elementType": "labels.text.stroke",
					    "stylers": [
					      {
					        "color": "#ebe3cd"
					      }
					    ]
					  },
					  {
					    "featureType": "transit.station",
					    "elementType": "geometry",
					    "stylers": [
					      {
					        "color": "#dfd2ae"
					      }
					    ]
					  },
					  {
					    "featureType": "water",
					    "elementType": "geometry.fill",
					    "stylers": [
					      {
					        "color": "#b9d3c2"
					      }
					    ]
					  },
					  {
					    "featureType": "water",
					    "elementType": "labels.text.fill",
					    "stylers": [
					      {
					        "color": "#92998d"
					      }
					    ]
					  }
					],
		        	{name: 'Styled Map'}
	);

	place = autocomplete_address.getPlace();

	for (var component in componentForm) {
		$("#"+component).val(null);
	}
	$("#address").css("display", "block");
	for (var i = 0; i < place.address_components.length; i++) {
		var addressType = place.address_components[i].types[0];
		if (componentForm[addressType]) {
			var val = place.address_components[i][componentForm[addressType]];
			 $("#"+addressType).val(val);
		}
	}
	address = place.formatted_address.replace(/\s+/g, "+");
	$.ajax({
		type:"GET",
		url:"/geocode",
		data: "address=" + address,
		success: function(result){
			map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: result.lat, lng: result.lng},
				zoom: 18,
				mapTypeControlOptions: {
					mapTypeIds: ['satellite','styled_map']
				},
				disableDefaultUI: true,
			});
			map.mapTypes.set('styled_map', styledMapType);
			map.setMapTypeId('styled_map');
			marker = new google.maps.Marker({
				position: {lat: result.lat, lng: result.lng},
				draggable: true
			});
			marker.setMap(map);
			$("#dorm_long").val(result.lng);
			$("#dorm_lat").val(result.lat);
			marker.addListener("dragend", handleMarkerEvent);		
		}
	});
}

function initMap() {
	autocomplete = new google.maps.places.Autocomplete(
		(document.getElementById('dorm_complete_loc')),
		{types: ["(cities)"], componentRestrictions: {country: "ph"}});

	autocomplete_address = new google.maps.places.Autocomplete(
		(document.getElementById('dorm_address')),
		{types: ["address"], componentRestrictions: {country: "ph"}});

	autocomplete_address.addListener('place_changed', fillInAddress); 
	
	autocomplete.addListener('place_changed', function(){});
}

function handleMarkerEvent(event){
	$("#dorm_long").val(event.latLng.lng());
	$("#dorm_lat").val(event.latLng.lat());
}