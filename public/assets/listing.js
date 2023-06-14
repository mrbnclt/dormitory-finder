var ctr = 0;
var displayed = 1;
var current_fs, next_fs, previous_fs;
var left, opacity, scale;


$(document).on("change", "input:file", function(){
	fileUpload(this);
	appendImageUpload(this, ctr);
});

$("#autocomplete").keypress(function(evt){
	if(evt.keyCode == 13){
		if($(this).val() != ""){
			$("#address").css("display", "block");
		}	
	}
});

$(".next").click(function(){
	if(displayed == 5){
		if($("#dorm_address").val() && $("#dorm_complete_loc").val() && $("#unit_number").val() && $("#route").val() && $("#locality").val() && $("#administrative_area_level_1").val()) {
			displayed++;
			animateNext(this);
			if($("#step").text() == "Step 1: First things first"){
				$("#pbar").width($("#pbar").width() + 273.2);
			}else if($("#step").text("Step 2: Showcase your dormitory")){
				$("#pbar").width($("#pbar").width() + 683);
			}else{
				$("#pbar").width($("#pbar").width() + 341.5);
			}

			$("#dorm_complete_loc").removeClass("error-input");
			$("#unit_number").removeClass("error-input");
			$("#route").removeClass("error-input");
			$("#locality").removeClass("error-input");
			$("#administrative_area_level_1").removeClass("error-input");
		}else{
			if(!$("#dorm_address").val()){
				$("#dorm_address").addClass("error-input");
			}else{
				$("#dorm_address").removeClass("error-input");
			}
			if(!$("#dorm_complete_loc").val()){
				$("#dorm_complete_loc").addClass("error-input");
			}else{
				$("#dorm_complete_loc").removeClass("error-input");
			}
			if(!$("#unit_number").val()){
				$("#unit_number").addClass("error-input");
			}else{
				$("#unit_number").removeClass("error-input");
			}
			if(!$("#route").val()){
				$("#route").addClass("error-input");
			}else{
				$("#route").removeClass("error-input");
			}
			if(!$("#locality").val()){
				$("#locality").addClass("error-input");
			}else{
				$("#locality").removeClass("error-input");
			}
			if(!$("#administrative_area_level_1").val()){
				$("#administrative_area_level_1").addClass("error-input");
			}else{
				$("#administrative_area_level_1").removeClass("error-input");
			}
		}
	}else if(displayed == 7){
		if($("#dorm_summary").val() && $("#dorm_about").val() && $("#dorm_access").val()){
			displayed++;
			animateNext(this);
			if($("#step").text() == "Step 1: First things first"){
				$("#pbar").width($("#pbar").width() + 341.5);
			}else if($("#step").text("Step 2: Showcase your dormitory")){
				$("#pbar").width($("#pbar").width() + 683);
			}else{
				$("#pbar").width($("#pbar").width() + 341.5);
			}

			$("#dorm_summary").removeClass("error-input");
			$("#dorm_about").removeClass("error-input");
			$("#dorm_access").removeClass("error-input");

		}else{
			if(!$("#dorm_summary").val()){
				$("#dorm_summary").addClass("error-input");
			}else{
				$("#dorm_summary").removeClass("error-input");
			}

			if(!$("#dorm_about").val()){
				$("#dorm_about").addClass("error-input");
			}else{
				$("#dorm_about").removeClass("error-input");
			}

			if(!$("#dorm_access").val()){
				$("#dorm_access").addClass("error-input");
			}else{
				$("#dorm_access").removeClass("error-input");
			}
		}
	}else if(displayed == 8){
		if($("#dorm_name").val()){
			displayed++;
			animateNext(this);
			if($("#step").text() == "Step 1: First things first"){
				$("#pbar").width($("#pbar").width() + 341.5);
			}else if($("#step").text("Step 2: Showcase your dormitory")){
				$("#pbar").width($("#pbar").width() + 683);
			}else{
				$("#pbar").width($("#pbar").width() + 341.5);
			}
			$("#dorm_name").removeClass("error-input");
		}else{
			$("#dorm_name").addClass("error-input");
		}
	}else if(displayed == 12){
		if($("#city_license").get(0).files.length !== 0 && $("#sanitary_permit").get(0).files.length !== 0 && $("#fire_safety_certificate").get(0).files.length !== 0){
			displayed++;
			animateNext(this);
			$("#documents_alert").addClass("hidden");
		}else{
			$("#documents_alert").removeClass("hidden");
		}
	}else{
		displayed++;
		animateNext(this);
		if($("#step").text() == "Step 1: First things first"){
			$("#pbar").width($("#pbar").width() + 273.2);
		}else if($("#step").text("Step 2: Showcase your dormitory")){
			$("#pbar").width($("#pbar").width() + 683);
		}else{
			$("#pbar").width($("#pbar").width() + 341.5);
		}	
	}	
});

$(".next-step").click(function(){
	if(displayed == 9){
		if($("#imagecount").val() > 0){
			displayed++;
			animateNext(this);
			$("#pbar").width(0);
			if($("#step").text() == "Step 1: First things first"){
				$("#step").text("Step 2: Showcase your dormitory");
			}else if($("#step").text() == "Step 2: Showcase your dormitory"){
				$("#step").text("Step 3: Room arrangements and prices");
			}	
		}
	}else{	
		displayed++;
		animateNext(this);
		$("#pbar").width(0);
		if($("#step").text() == "Step 1: First things first"){
			$("#step").text("Step 2: Showcase your dormitory");
		}else if($("#step").text() == "Step 2: Showcase your dormitory"){
			$("#step").text("Step 3: Room arrangements and prices");
		}	
	}	
});

$(".prev").click(function(){
	displayed--;
	animatePrev(this);
	if($("#step").text() == "Step 1: First things first"){
		$("#pbar").width($("#pbar").width() - 341.5);
	}else if($("#step").text("Step 2: Showcase your dormitory")){
		$("#pbar").width($("#pbar").width() - 683);
	}else{
		$("#pbar").width($("#pbar").width() - 341.5);
	}	
});

$(".prev-step").click(function(){
	displayed--;
	animatePrev(this);
	$("#pbar").width(1366);
	if($("#step").text() == "Step 2: Showcase your dormitory"){
		$("#step").text("Step 1: First things first");
	}else if($("#step").text() == "Step 3: Room arrangements and prices"){
		$("#step").text("Step 2: Showcase your dormitory");
	}
});

$(".finish").click(function(){
	if($("#agree").is(":checked") || $("#disagree").is(":checked")){
		$("#msform").submit();
	}
});

function animateNext(button){
	current_fs = $(button).parent();
	next_fs	= $(button).parent().next();
	next_fs.show();
	current_fs.animate({opacity: 0}, {
		step: function(now, mx){
			scale = 1 - (1 - now) * 0.2;
			left = (now * 50) + "%";
			opacity = 1 - now;
			current_fs.css({"transform": "scale("+ scale + ")"});
			next_fs.css({"left": left, "opacity": opacity});
		},
		duration: 800,
		complete: function(){
			current_fs.hide();
		},
		easing: "easeInOutBack"
	});
	changeInfo();
}

function animatePrev(button){
	current_fs = $(button).parent();
	previous_fs	= $(button).parent().prev();
	previous_fs.show();
	current_fs.animate({opacity: 0}, {
		step: function(now, mx){
			scale = 0.8 + (1 - now) * 0.2;
			left = ((1 - now) * 50) + "%";
			opacity = 1 - now;
			current_fs.css({"left": left});
			previous_fs.css({"transform": "scale("+ scale + ")", "opacity": opacity});
		},
		duration: 800,
		complete: function(){
			current_fs.hide();
		},
		easing: "easeInOutBack"
	});
	changeInfo();
}

function changeInfo(){
	if($("#sidebar").css("display") == "none" && displayed < 9){
		$("#sidebar").fadeIn(2000);
	}

	if(displayed < 10){
		$("room_preview").addClass("hidden");
	}

	if(displayed == 1){
		$("#info").fadeOut(500, function(){
			$("#info").text("Guests will first search for dormitories from a location. Enter the city where your dormitory is located.");
		});
		$("#info").fadeIn(500);				
	}else if(displayed == 2){
		$("#info").fadeOut(500, function(){
			$("#info").text("Set some rules that your tenants must agree before they can reserve for a slot to your dormitory.");
		});
		$("#info").fadeIn(500);
	}else if(displayed == 3){
		$("#info").fadeOut(500, function(){
			$("#info").text("Amenities help tenants in their stay in your dorm. Useful amenities can help your tenants feel at home.");
		});
		$("#info").fadeIn(500);
	}else if(displayed == 4){
		$("#info").fadeOut(500, function(){
			$("#info").text("You can include all bathrooms inside your dormitory or only include the bathrooms accessible to all.");
		});
		$("#info").fadeIn(500);
	}
	else if(displayed == 5){
		$("#info").fadeOut(500, function(){
			$("#info").text("Only confirmed tenants can know your exact address.");
		});
		$("#info").fadeIn(500);
	}else if(displayed == 6){
		$("#info").fadeOut(500, function(){
			$("#info").text("You can drag the pin to adjust its location. Confirmed guests can see this, so they know how to get to your place.");
		});
		$("#info").fadeIn(500);
	}else if(displayed == 7){
		$("#info").fadeOut(500, function(){
			$("#info").html("Your summary description is meant to be brief. <br><br>Explain some of the strong points your dormitory has over others. Guests will read this, so describe your dorm well.");
		});
		$("#info").fadeIn(500);
	}else if(displayed == 8){
		$("#info").fadeOut(500, function(){
			$("#info").text("A unique name can attract a persons' interest.");
		});
		$("#info").fadeIn(500);
	}else if(displayed == 9){
		$("#sidebar").fadeOut(100, function(){
			$("#room_preview").addClass("hidden");
		});
	}else if(displayed == 10){
		$("#sidebar").fadeOut(100, function(){
			$("#room_preview").removeClass("hidden");
		});
	}else if(displayed == 11){
		$("#room_preview").fadeOut(500, function(){
			$("#info").fadeIn(500, function(){
				$("#info").text("It's up to you if you want to make your tenants pay in advance for security purposes or let them pay the base amount for their rent.");
			});
		});
	}
}



function fileUpload(input){
	var id = $(input).attr("id");
	if(id == 0){
		$("#photo-"+ id + "-preview").addClass("cover");
	}else{
		$("#photo-"+ id + "-preview").addClass("other_photo");
	}			
	var preview = document.getElementById("photo-" + id + "-preview");
	var file    = document.getElementById(id).files[0];
	var reader  = new FileReader();
	reader.addEventListener("load", function () {
		preview.src = reader.result;
	}, false);
	if (file) {
		reader.readAsDataURL(file);
	}
	ctr++;
	$("#close-" + id).removeClass("hidden");
	$("#imagecount").val(Number(ctr)); 
	$("#lbl-" + id).css("display", "none");
	$("#caption-" + id).removeClass("hidden");
}

$(document).on("click", "button.remove-image", function(){
	$(this).parent().parent().remove();
	ctr--;
	$("#imagecount").val(Number(ctr)); 
});

function appendImageUpload(input, id){
	$("#more-images").append('<div class="col-lg-4 col-md-4 file_upload"><input class="upload_photo" type="file" id="'+ctr+'" name="image['+ctr+']"><label class="m-0 p-0 w-100" id="lbl-'+ctr+'" for="'+ctr+'" tabindex=><div class="add_photo_div"><div class="add_photo_container"><div class="add_photo_container_middle"><i class="fas fa-plus img-center"></i><div class="text-gray mt-2"><span>Add photo</span></div></div></div></div></label><label class="image-label" for="'+ctr+'"><button id="close-'+ctr+'" type="button" class="close hidden remove-image"><span aria-hidden="true">&times;</span></button><img src="" id="photo-'+ctr+'-preview"></label><input class="form-control hidden caption hidden" placeholder="Add caption for this photo" type="text" name="caption['+ ctr +']" id="caption-'+ ctr +'"></div>');
}