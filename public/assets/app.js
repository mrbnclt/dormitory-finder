var formatPassword = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
var formatName = /[^A-Za-z_ ]/;
var formatEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;

$("#signup").click(function(){
	var username, password, confirm, fname, lname, month, day, year;
	if(!$("#username").val()){
		$("#username").addClass("error-input");
		$("#username_error").text("Please enter an email.");
		$("#username_error").css("display", "block");
		username = true;
	}else{
		if(formatEmail.test($("#username").val())){
			$("#username").removeClass("error-input")
			$("#username_error").css("display", "none");
			username = false;
		}else{
			$("#username").addClass("error-input");
			$("#username_error").text("Please enter a valid email address.");
			$("#username_error").css("display", "block");
			username = true;
		}	
	}

	if(!$("#password").val()){
		$("#password").addClass("error-input");
		$("#password_error").text("Please enter a password.");
		$("#password_error").css("display", "block");
		password = true;
	}else{
		if($("#password").val().length < 8){
			$("#password").addClass("error-input");
			$("#password_error").text("Password must containt atleast 8 characters");
			$("#password_error").css("display", "block");
			password = true;
		}else{
			if(formatPassword.test($("#password").val())){
				$("#password").addClass("error-input");
				$("#password_error").text("Please don't include special characters, spaces, or emojis.");
				$("#password_error").css("display", "block");
				password = true;
			}else{
				$("#password").removeClass("error-input");
				$("#password_error").css("display", "none");
				password = false;
			}	
		}	
	}

	if(!$("#confirm_password").val()){
		$("#confirm_password").addClass("error-input");
		$("#password_confirm_error").text("Please enter a password.");
		$("#password_confirm_error").css("display", "block");
		confirm = true;
	}else{
		if($("#confirm_password").val().length < 8){
			$("#confirm_password").addClass("error-input");
			$("#password_confirm_error").text("Password must containt atleast 8 characters");
			$("#password_confirm_error").css("display", "block");
			confirm = true;
		}else{
			if(formatPassword.test($("#confirm_password").val())){
				$("#confirm_password").addClass("error-input");
				$("#password_confirm_error").text("Please don't include special characters, spaces, or emojis.");
				$("#password_confirm_error").css("display", "block");
				confirm = true;
			}else if($("#confirm_password").val() !== $("#password").val()){
				$("#confirm_password").addClass("error-input");
				$("#password_confirm_error").text("Password does not match");
				$("#password_confirm_error").css("display", "block");
				confirm = true;
			}else{
				$("#confirm_password").removeClass("error-input");
				$("#password_confirm_error").css("display", "none");
				confirm = false;
			}	
		}	
	}

	if(!$("#first_name").val()){
		$("#first_name").addClass("error-input");
		$("#first_name_error").text("Please enter your first name.");
		$("#first_name_error").css("display", "block");
		fname = true;
	}else{
		if(formatName.test($("#first_name").val())){
			$("#first_name").addClass("error-input");
			$("#first_name_error").text("Please don't include special numbers, characters, or emojis.");
			$("#first_name_error").css("display", "block");
			fname = true;
		}else{
			$("#first_name").removeClass("error-input");
			$("#first_name_error").css("display", "none");
			fname = false;
		}	
	}

	if(!$("#last_name").val()){
		$("#last_name").addClass("error-input");
		$("#last_name_error").text("Please enter your last name.");
		$("#last_name_error").css("display", "block");
		lname = true;
	}else{
		if(formatName.test($("#last_name").val())){
			$("#last_name").addClass("error-input");
			$("#last_name_error").text("Please don't include special numbers, characters, or emojis.");
			$("#last_name_error").css("display", "block");
			lname = true;
		}else{
			$("#last_name").removeClass("error-input");
			$("#last_name_error").css("display", "none");
			lname = false;
		}	
	}

	if($("#month").val() == "Month"){
		$("#month").addClass("error-input");
		$("#month_error").css("display", "block");
		month = true;
	}else{
		$("#month").removeClass("error-input");
		$("#month_error").css("display", "none");
		month = false;
	}

	if($("#day").val() == "Day"){
		$("#day").addClass("error-input");
		$("#day_error").css("display", "block");
		day = true;
	}else{
		$("#day").removeClass("error-input");
		$("#day_error").css("display", "none");
		day = false;
	}

	if($("#year").val() == "Year"){
		$("#year").addClass("error-input");
		$("#year_error").css("display", "block");
		year = true;
	}else{
		$("#year").removeClass("error-input");
		$("#year_error").css("display", "none");
		year = false;
	}

	if(!username && !password && !confirm && !lname && !fname && !day && !year && !month){
		$("#register_form").submit();
	}	
});

$("#login").click(function(){
	var username, password;
	if(!$("#username_login").val()){
		$("#username_login").addClass("error-input");
		$("#username2_error").text("Please enter your email.");
		$("#username2_error").css("display", "block");
		username = true;
	}else{
		if(formatEmail.test($("#username_login").val())){
			$("#username_login").removeClass("error-input")
			$("#username2_error").css("display", "none");
			username = false;
		}else{
			$("#username_login").removeClass("error-input")
			$("#username2_error").text("Please enter a valid email address.");
			$("#username2_error").css("display", "block");
			username = true;
		}
		
	}

	if(!$("#password_login").val()){
		$("#password_login").addClass("error-input");
		$("#password2_error").text("Please enter a password.");
		$("#password2_error").css("display", "block");
		password = true;
	}else{
		if($("#password_login").val().length < 8){
			$("#password_login").addClass("error-input");
			$("#password2_error").text("Password must containt atleast 8 characters");
			$("#password2_error").css("display", "block");
			password = true;
		}else{
			if(formatPassword.test($("#password_login").val())){
				$("#password_login").addClass("error-input");
				$("#password2_error").text("Please don't include special characters, spaces, or emojis.");
				$("#password2_error").css("display", "block");
				password = true;
			}else{
				$("#password_login").removeClass("error-input");
				$("#password2_error").css("display", "none");
				password = false;
			}	
		}	
	}

	if(!password && !username){
		$("#login_form").submit();
	}	
});

$("#profile").click(function(){
	var fname, lname, contact;

	if(!$("#first_name_profile").val()){
		$("#first_name_profile").addClass("error-input");
		$("#first_name_profile_error").text("Please enter your first name.");
		$("#first_name_profile_error").css("display", "block");
		fname = true;
	}else{
		if(formatName.test($("#first_name_profile").val())){
			$("#first_name_profile").addClass("error-input");
			$("#first_name_profile_error").text("Please don't include special numbers, characters, or emojis.");
			$("#first_name_profile_error").css("display", "block");
			fname = true;
		}else{
			$("#first_name_profile").removeClass("error-input");
			$("#first_name_profile_error").css("display", "none");
			fname = false;
		}	
	}

	if(!$("#last_name_profile").val()){
		$("#last_name_profile").addClass("error-input");
		$("#last_name_profile_error").text("Please enter your last name.");
		$("#last_name_profile_error").css("display", "block");
		lname = true;
	}else{
		if(formatName.test($("#last_name_profile").val())){
			$("#last_name_profile").addClass("error-input");
			$("#last_name_profile_error").text("Please don't include special numbers, characters, or emojis.");
			$("#last_name_profile_error").css("display", "block");
			lname = true;
		}else{
			$("#last_name_profile").removeClass("error-input");
			$("#last_name_profile_error").css("display", "none");
			lname = false;
		}	
	}

	if($("#contact").val()){
		if($("#contact").val().toString().length < 10){
			$("#contact").addClass("error-input");
			$("#contact_error").text("This number is not valid.");
			$("#contact_error").css("display", "block");
			contact = true;
		}else{
			$("#contact").removeClass("error-input");
			$("#contact_error").css("display", "none");
			contact = false;
		}
	}else{
		$("#contact").removeClass("error-input");
		$("#contact_error").css("display", "none");
		contact = false;
	}

	if(!contact && !lname && !fname){
		$("#profile_form").submit();
	}	
});

$("#passwordchange").click(function(){
	var old, newpass, confirm;

	if(!$("#old_password").val()){
		$("#old_password").addClass("error-input");
		$("#old_password_error").text("Please enter a password.");
		$("#old_password_error").css("display", "block");
		old = true;
	}else{
		if($("#old_password").val().length < 8){
			$("#old_password").addClass("error-input");
			$("#old_password_error").text("Password must containt atleast 8 characters");
			$("#old_password_error").css("display", "block");
			old = true;
		}else{
			if(formatPassword.test($("#old_password").val())){
				$("#old_password").addClass("error-input");
				$("#old_password_error").text("Please don't include special characters, spaces, or emojis.");
				$("#old_password_error").css("display", "block");
				old = true;
			}else{
				$("#old_password").removeClass("error-input");
				$("#old_password_error").css("display", "none");
				old = false;
			}	
		}	
	}

	if(!$("#new_password").val()){
		$("#new_password").addClass("error-input");
		$("#new_password_error").text("Please enter a password.");
		$("#new_password_error").css("display", "block");
		newpass = true;
	}else{
		if($("#new_password").val().length < 8){
			$("#new_password").addClass("error-input");
			$("#new_password_error").text("Password must containt atleast 8 characters");
			$("#new_password_error").css("display", "block");
			newpass = true;
		}else{
			if(formatPassword.test($("#new_password").val())){
				$("#new_password").addClass("error-input");
				$("#new_password_error").text("Please don't include special characters, spaces, or emojis.");
				$("#new_password_error").css("display", "block");
				newpass = true;
			}else{
				$("#new_password").removeClass("error-input");
				$("#new_password_error").css("display", "none");
				newpass = false;
			}	
		}	
	}

	if(!$("#confirm_password").val()){
		$("#confirm_password").addClass("error-input");
		$("#confirm_password_error").text("Please enter a password.");
		$("#confirm_password_error").css("display", "block");
		confirm = true;
	}else{
		if($("#confirm_password").val().length < 8){
			$("#confirm_password").addClass("error-input");
			$("#confirm_password_error").text("Password must containt atleast 8 characters");
			$("#confirm_password_error").css("display", "block");
			confirm = true;
		}else{
			if(formatPassword.test($("#confirm_password").val())){
				$("#confirm_password").addClass("error-input");
				$("#confirm_password_error").text("Please don't include special characters, spaces, or emojis.");
				$("#confirm_password_error").css("display", "block");
				confirm = true;
			}else{
				$("#confirm_password").removeClass("error-input");
				$("#confirm_password_error").css("display", "none");
				confirm = false;
			}	
		}	
	}

	if(!confirm && !old && !newpass){
		if($("#new_password").val() != $("#confirm_password").val()){
			$("#change_password_error").text("New password does not match.");
			$("#change_password_error").css("display","block");
		}else{
			$("#change_password_error").css("display","none");
			$("#change_password_form").submit();
		}
	}

});

$(".acceptreservation").click(function(){
	$(this).parent().append("<input type='hidden' name='action' value='owner confirmed'>");
	$(this).parent().submit();
});

$(".acceptreservationtenant").click(function(){
	$(this).parent().append("<input type='hidden' name='action' value='accepted'>");
	$(this).parent().submit();
});

$(".declinereservation").click(function(){
	$(this).parent().append("<input type='hidden' name='action' value='cancelled'>");
	$(this).parent().submit();
});