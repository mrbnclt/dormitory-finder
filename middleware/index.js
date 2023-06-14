var Profile 		= require("../models/profile-model"),
	User    		= require("../models/user-model"),
	Dorm  			= require("../models/dorm-model"),
	Conversation 	= require("../models/conversation-model"),
	Room 			= require("../models/room-model"),
	RoomSlot		= require("../models/room-slots-model"),
	DormRating 		= require("../models/dorm-rating-model"),
	Reservation 	= require("../models/reservation-model");


Dorm.hasMany(Room, {foreignKey: "dorm_id"});
RoomSlot.belongsTo(User, {foreignKey: "occupant_id"});
Room.belongsTo(Dorm, {foreignKey: "dorm_id"});
Room.hasMany(RoomSlot, {foreignKey: "room_id"});
Reservation.belongsTo(Room, {foreignKey: "room_id"});

var middlewareObject = {};

middlewareObject.checkProfileOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Profile.findOne({where: {user_id: req.params.user_id}}).then(foundProfile =>{
			if(foundProfile.user_id === req.user.user_id){
				return next();
			}else{
				req.flash("errorheader", "You don't have the permission to do that.");
				res.redirect("back");
			}
		}).catch(err =>{
			req.flash("errorheader", "Something went wrong. Please try again later");
			res.redirect("back");
		});
	}else{
		req.flash("errorheader", "You must login to do that.");
		res.redirect("back");
	}
}

middlewareObject.notAdmin = function(req, res, next){
	User.findOne({where: {user_id: req.user.user_id}}).then(foundedUser => {
		if(foundedUser.user_type === "Tenant" || foundedUser.user_type === "Dorm Owner"){
			return next();
		}
		req.flash("errorheader", "You don't have the authority to do that.");
		res.redirect("back");
	});
}

middlewareObject.userIsAdmin = function(req, res, next){
	if(req.isAuthenticated()){
		User.findOne({where: {user_id: req.user.user_id}}).then(foundedUser => {
			if(foundedUser.user_type === "Admin"){
				return next();
			}
			req.flash("errorheader", "You don't have the authority to do that.");
			res.redirect("back");
		});
	}else{
		req.flash("errorheader", "You must login to do that.");
		res.redirect("back");
	}
};

middlewareObject.checkRatingAuthorization = function(req, res, next){
	if(req.user.user_type === "Tenant"){
		Reservation.find({where: {user_id: req.user.user_id, status: "confirmed"}, include: [{model: Room, where: {dorm_id: req.params.dorm_id}} ]}).then(foundedConfirmedReservation => {
			DormRating.find({where: {user_id: req.user.user_id, dorm_id: req.params.dorm_id}}).then(foundedRating => {
				if(foundedConfirmedReservation && !foundedRating){
					return next();
				}
				req.flash("errorheader", "You don't have the permission to do that");
				res.redirect("back");
			});
		});
	}
}

middlewareObject.checkDormMembership = function(req, res, next){
	if(req.user.user_type === "Dorm Owner"){
		Dorm.find({where: {dorm_id: req.params.dorm_id, owner_user_id: req.user.user_id}}).then(foundedDorm => {
			if(foundedDorm){
				return next();
			}
			req.flash("errorheader", "You don't have the permission to do that");
			res.redirect("back");
		});
	}else{
		Dorm.findOne({where: {dorm_id: req.params.dorm_id}, include: [ {model: Room, include: [ {model: RoomSlot, where: {occupant_id: req.user.user_id}} ] } ]}).then(foundedDorm => {
			if(foundedDorm){
				return next();
			}
			req.flash("errorheader", "You dont have the permission to do that.");
			res.redirect("back");
		});
	}
}

middlewareObject.checkUserOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		User.findById(req.params.user_id).then(foundUser =>{
			if(foundUser){
				if(foundUser.user_id === req.user.user_id){
					return next();
				}else{
					req.flash("errorheader", "You don't have the permission to do that.");
					res.redirect("back");
				}
			}else{
				req.flash("errorheader", "User not found.");
				res.redirect("back");
			}
		}).catch(err =>{
			req.flash("errorheader", err);
			res.redirect("back");
		});
	}else{
		req.flash("errorheader", "You must login to do that.");
		res.redirect("/login");
	}
}

middlewareObject.checkIfUserIsTenantType = function(req, res, next){
	User.findOne({where: {user_id: req.user.user_id}}).then(userResults => {
		if(userResults.user_type == "Tenant"){
			return next();
		}else{
			req.flash("errorheader", "Only tenants can inquire about a dormitory.");
			res.redirect("back");
		}
	});
}

middlewareObject.checkReservationAuthorization = function(req, res, next){
	User.findOne({where: {user_id: req.user.user_id}}).then(userResults => {
		if(userResults.user_type == "Tenant"){
			return next();
		}else{
			req.flash("errorheader", "Only tenants can reserve for a dormitory.");
			res.redirect("back");
		}
	});
}

middlewareObject.checkDormOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Dorm.find({where: {dorm_id: req.params.dorm_id}}).then(dormResults => {
			if(dormResults.owner_user_id == req.user.user_id){
				return next();
			}else{
				req.flash("errorheader", "You don't have the permission to do that.");
				res.redirect("back");
			}
		});
	}else{
		req.flash("errorheader", "You must login to do that.");
		res.redirect("back");
	}
}

middlewareObject.checkDormOwnerAuthorization = function(req, res, next){
	if(req.isAuthenticated()){
		User.findById(req.user.user_id).then(foundUser =>{
			if(foundUser.user_type === "Dorm Owner"){
				return next();
			}else{
				req.flash("errorheader", "You don't have the permission to do that.");
				res.redirect("back");
			}
		}).catch(err =>{
			req.flash("errorheader", err);
			res.redirect("back");
		});
	}else{
		req.flash("errorheader", "You must login to do that.");
		res.redirect("/login");
	}
}

middlewareObject.convoPermission = function(req, res, next){
	Conversation.find({where: {conversation_id: req.params.conversation_id}}).then(conversationResult => {
		if(conversationResult){
			if(conversationResult.owner_id == req.user.user_id || conversationResult.inquirer_id == req.user.user_id){
				return next();
			}else{
				req.flash("errorheader", "You don't have the permission to view that page.");
				res.redirect("back");
			}
		}	
	});
}

middlewareObject.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("errorheader","You must login first.");
	res.redirect("/login");
}

middlewareObject.notLoggedIn = function(req, res, next){
	if(!req.isAuthenticated()){
		req.hello = "hello";
		return next();
	}else{
		res.redirect("back");
	}
}

module.exports = middlewareObject ;