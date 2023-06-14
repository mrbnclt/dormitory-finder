$("#readmoredorm").click(function(){
	var button = document.getElementById("readmoredorm");
	$("#more-dorm-about").fadeToggle(300, function(){
		if($(button).text() == "Read more about this dorm  "){
			$(button).html("Hide  <i class='fas fa-angle-up'></i>");
		}else{
			$(button).html("Read more about this dorm  <i class='fas fa-angle-down'></i>");
		}
	});
});

$("#readmorerule").click(function(){
	var button = document.getElementById("readmorerule");
	$("#more-rules").fadeToggle(300, function(){
		if($(button).text() == "Read more rules  "){
			$(button).html("Hide  <i class='fas fa-angle-up'></i>");
		}else{
			$(button).html("Read more rules  <i class='fas fa-angle-down'></i>");
		}
	});
});

$("#readmoreamenities").click(function(){
	var button = document.getElementById("readmoreamenities");
	$("#more-amenities").fadeToggle(300, function(){
		if($(button).text() == "Read more amenities  "){
			$(button).html("Hide  <i class='fas fa-angle-up'></i>");
		}else{
			$(button).html("Read more rules  <i class='fas fa-angle-down'></i>");
		}
	});
});

$("#showmorerooms").click(function(){
	var button = document.getElementById("showmorerooms");
	$("#more-rooms").fadeToggle(300, function(){
		if($(button).text() == "Show more rooms  "){
			$(button).html("Hide  <i class='fas fa-angle-up'></i>");
		}else{
			$(button).html("Show more rooms  <i class='fas fa-angle-down'></i>");
		}
	});
	
});

$(".reservebutton").click(function(){
	if($("#selectedroomid").val() == ""){
		$("#alert_room").fadeIn(500);
	}else{
		$(this).parent().append($("#selectedroomid"));
		$(this).parent().submit();
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
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: Number($("#lat").val()), lng: Number($("#lng").val())},
		zoom: 16,
		mapTypeControlOptions: {
			mapTypeIds: ['satellite','styled_map']
		},
		disableDefaultUI: true,
	});
	map.mapTypes.set('styled_map', styledMapType);
	map.setMapTypeId('styled_map');
	marker = new google.maps.Marker({
		position: {lat: Number($("#lat").val()), lng: Number($("#lng").val())},
		draggable: false
	});
	marker.setMap(map);
});

$(".roombutton").click(function(){
	$("div", this).first().css("box-shadow", "0px 0px 15px 3px #48ea4e");
	$("div", this).first().css("border", "1px solid #48ea4e");
	$("div").not($("div", this).first()).css("box-shadow","none");
	$($(this).data("target")).fadeToggle(500);
	$("div .more_reserve").not($($(this).data("target"))).css("display","none");
	$("#selectedroomid").val($(this).val());
	$("#alert_room").fadeOut(500);
});