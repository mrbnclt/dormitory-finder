var currentRoom = $("#card-1");
var roomBeforeEdit;
var genders = "<option selected>For females</option><option>For males</option><option>For males and females</option>";


$("#dorm_gender").change(function(){
	var myNode = document.getElementById("room-gender-1");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	if($(this).find(":selected").text() === "For females"){
		genders = "<option>For females</option>";
		$("#room-gender-1").append(genders);
	}else if($(this).find(":selected").text() === "For males"){
		genders = "<option>For males</option>";
		$("#room-gender-1").append(genders);
	}else{
		genders = "<option>For females</option><option>For males</option><option>For males and females</option>";
		$("#room-gender-1").append(genders);
	}
});


$("#add_room").click(function(){
	$(currentRoom).find("input.room-type-name").removeClass("error-input");
	var id = Number($("#roomcount").val()) + 1;
	$("#room_container").append('<div class="card" id="card-'+id+'"><div class="card-header"><div class="form-group"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">&#8369;</span></div><input type="number" name="room['+id+'][amount]" id="room-amount-'+id+'" class="form-control text-center payments" min="0" value="0"><div class="input-group-append"><div class="input-group-append"><span class="input-group-text">per month</span></div></div></div></div></div><div class="card-body"><div class="form-group w-100"><div class="form-inline"><select class="form-control w-100" id="room-capacity-'+id+'" name="room['+id+'][capacity]"><option>For 1 person</option><option>For 2 people</option><option>For 3 people</option><option>For 4 people</option><option>For 5 people</option><option>For 6 people</option><option>For 7 people</option><option>For 8 people</option><option>For 9 people</option><option>For 10 people</option></select></div></div><div class="form-group"><div class="form-inline"><div class="container p-0"><div class="row"><div class="col-3"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">Sofa Bed</span></div><input type="number" name="room['+id+'][sofabed]" id="room-sofabed-'+id+'" class="form-control text-center" value="0"></div></div><div class="col-3"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">Queen Size</span></div><input type="number" name="room['+id+'][queensize]" id="room-queenzise-'+id+'" class="form-control text-center" value="0"></div></div><div class="col-3"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">Single Bed</span></div><input type="number" name="room['+id+'][singlebed]" id="room-singlebed-'+id+'" class="form-control text-center" value="0"></div></div><div class="col-3"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">Double Decker</span></div><input type="number" name="room['+id+'][doubledecker]" id="room-doubledecker-'+id+'" class="form-control text-center" value="0"></div></div></div></div></div></div><div class="form-group"><select class="form-control" id="room-gender-'+id+'" name="room['+id+'][gender]">'+ genders + '</select></div><div class="form-group"><h5>Room Description</h5><textarea rows="5" id="room-description-'+id+'" name="room['+id+'][description]" class="form-control form-control-lg" placeholder="Describe this room. What is difference of the room from the others?"></textarea></div><div class="form-group"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">There are</span></div><input type="number" name="room['+id+'][count]" id="room-count-'+id+'" class="form-control text-center" min="1" value="1"><div class="input-group-append"><span class="input-group-text">of this room in my dorm.</span></div></div></div><div class="form-group"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">Utility bill is</span></div><select class="form-control" id="room-monthly-'+id+'" name="room['+id+'][monthly]"><option>included on rent payment</option><option>not included on rent payment</option></select></div></div></div></div>');
	$(currentRoom).addClass("hidden");
	$("#roomcount").val(Number($("#roomcount").val()) + 1);
	var idString = $(currentRoom).attr("id");
	var last_id = idString.replace(/\D/g, '');
	currentRoom = $("#card-" + id);
	addRoomPreview(last_id);
});

$(document).on("click", "a.link", function(){
	if($(this).html() == "Edit"){
		$(this).parent().parent().parent().remove();
		$(currentRoom).addClass("hidden");
		roomBeforeEdit = $(currentRoom);
		$($(this).data("target")).removeClass("hidden");
		currentRoom = $($(this).data("target"));
		$("#add_room").addClass("hidden");
		$("#save_edit").removeClass("hidden");
	}else{
		$($(this).data("target")).remove();
		$(this).parent().parent().parent().remove();
	}
});

$("#save_edit").click(function(){
	var idString = $(currentRoom).attr("id");
	var last_id = idString.replace(/\D/g, '');
	addRoomPreview(last_id);
	$(currentRoom).addClass("hidden");
	$(roomBeforeEdit).removeClass("hidden");
	currentRoom = roomBeforeEdit;
	$(this).addClass("hidden");
	$("#add_room").removeClass("hidden");
});

function addRoomPreview(last_id){
	var amount = $("#room-amount-"+ last_id).val() + ' per month'
	var capacity = $("#room-capacity-"+ last_id).val();
	var beds = $("#room-beds-"+ last_id).val();
	$("#room_preview_list").append('<li id="preview-'+ last_id +'" class="list-group-item"><div class="row"><div class="col-12"><h6 class="title-bold">&#8369;'+ amount +'</h6></div></div><div class="row"><div class="col-6"><span>'+ capacity +'</span></div><div class="col-6"><span>with '+ beds +'</span></div></div><div class="col-12"><div class="row"><a class="mr-1 link" data-target="#card-'+ last_id +'">Edit</a><a class="ml-1 link" data-target="#card-'+ last_id +'">Remove</a></div></div></li>');
}