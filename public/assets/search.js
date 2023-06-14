$(".page-link").click(function(){
	if(!$(this).parent().hasClass("active")){
		$("#search_form").append('<input type="hidden" name="page" value="'+ $(this).val()+'"/>');
		$("#search_form").submit();
	}
});

 $( "#slider-range-max" ).slider({
    range: "max",
    min: 1,
    max: 50,
    value: $("#bathrooms").val(),
    slide: function( event, ui ) {
    	$("#bath-label").text( "0 - " + ui.value + " Bathrooms");
        $( "#bathrooms" ).val(ui.value);
    }
});

 $( "#slider-range-max-amount" ).slider({
    range: "true",
    min: 500,
    max: 30000,
    values: [$("#fromAverageAmount").val(), $("#toAverageAmount").val()],
    step: 500,
    slide: function( event, ui ) {
    	$("#amount-label").text( ui.values[0] + " PHP - " + ui.values[1] + " PHP");
        $("#fromAverageAmount").val(ui.values[0]);
        $("#toAverageAmount").val(ui.values[1]);
    }
});

function activatePlacesSearch(){
	var input = document.getElementById("location");
	var options = {
		types: ["establishment"], componentRestrictions: {country: "ph"}
	}
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		var place = autocomplete.getPlace();
		$("#query_lat").val(place.geometry.location.lat());
		$("#query_lng").val(place.geometry.location.lng());
		var place = autocomplete.getPlace().address_components
		for(var i = 0; i < place.length; i++){
			for(var x = 0; x < place[i].types.length; x++){
				if(place[i].types[x] == "locality"){
					$("#query_city").val(place[i]["long_name"]);
				}
			}	
		}
	});
	$(document).ready(function(){
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

		map = new google.maps.Map(document.getElementById('map_search'), {
			center: {lat: 14.6234, lng: 121.014},
			zoom: 16,
			disableDefaultUI: true
		});
		map.mapTypes.set('styled_map', styledMapType);
		map.setMapTypeId('styled_map');

	    var infowindow = new google.maps.InfoWindow();

	    var marker, i;

	    var coordinates = [];

	    var bounds = new google.maps.LatLngBounds();

	    $(window).bind("load", function() {
			$(".long").each(function(long){
				coordinates.push({
					long: $(this).val(),
					lat : $(".lat[data-id="+ $(this).data("id") +"]").val(),
					name: $(".dorm_name[data-id=" + $(this).data("id") + "]").val(),
					price : $(".dorm_price[data-id=" + $(this).data("id") + "]").val(),
					image: $(".dorm_image[data-id=" + $(this).data("id") + "]").val(),
					about: $(".dorm_description[data-id=" + $(this).data("id") + "]").val(),
					id: $(this).data("id")
				});
		   	});
	 
		    for (i = 0; i < coordinates.length; i++) {  
		    	var position = new google.maps.LatLng(coordinates[i].lat, coordinates[i].long);
		    	bounds.extend(position);
		    	marker = new google.maps.Marker({
			        position: position,
			        map: map
			    });

			    google.maps.event.addListener(marker, 'click', (function(marker, i) {
			        return function() {
			          	infowindow.setContent("<div class='card map-card'><img class='card-img-top card-img-map object-fit' src='/images/dorm_images/"+ coordinates[i].image +"'><div class='card-header'><h5 class='card-title'>"+ coordinates[i].name +"</h5></div><div class='card-body'><p>&#8369;"+ (Number(coordinates[i].price)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') +" average rent per month</p><a target='_blank' href='/listing/"+ coordinates[i].id +"'>Visit Dorm Page</a></div></div");
			         	infowindow.open(map, marker);
			        }
			    })(marker, i));
			    map.fitBounds(bounds);
		    }
		});
	
	});

}
