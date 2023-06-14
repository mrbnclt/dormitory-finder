var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var Sequelize = require("sequelize"),
	sequelize = new Sequelize(
		process.env.DATABASE_NAME,
		process.env.DATABASE_USERNAME,
		process.env.DATABASE_PASSWORD,
		{
			host: process.env.DATABASE_HOST,
			dialect: "mysql",
		}
	);
var multer = require("multer");
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/images/dorm_images");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});
var file_upload = multer({
	storage: storage,
});

var Dorm = require("../models/dorm-model"),
	DormAddress = require("../models/address-dorm-model"),
	Room = require("../models/room-model"),
	DormImage = require("../models/dorm-images-model"),
	RoomSlot = require("../models/room-slots-model"),
	DormAmenities = require("../models/dorm-amenities-model"),
	DormRules = require("../models/dorm-rules-model"),
	User = require("../models/user-model"),
	Profile = require("../models/profile-model"),
	Reservation = require("../models/reservation-model"),
	DormRating = require("../models/dorm-rating-model"),
	DormDocument = require("../models/dorm-documents-model");

Dorm.belongsTo(DormAddress, { foreignKey: "dorm_address_id" });
Dorm.belongsTo(DormAmenities, { foreignKey: "amenities_id" });
Dorm.belongsTo(DormRules, { foreignKey: "rules_id" });
Dorm.hasMany(DormImage, { foreignKey: "dorm_id" });
User.hasOne(Profile, { foreignKey: "user_id" });
Room.hasMany(RoomSlot, { foreignKey: "room_id" });
Dorm.hasMany(DormRating, { foreignKey: "dorm_id" });
DormRating.belongsTo(User, { foreignKey: "user_id" });
Reservation.belongsTo(Room, { foreignKey: "room_id" });

router.get(
	"/listing/new",
	middleware.checkDormOwnerAuthorization,
	function (req, res) {
		res.render("listing/new");
	}
);

router.post(
	"/listing/new",
	middleware.checkDormOwnerAuthorization,
	file_upload.any(),
	function (req, res) {
		if (req.body.answer === "agree") {
			createDormListing(req).then((results) => {
				var dorm = {
					owner_user_id: req.user.user_id,
					dorm_name: req.body.dorm_name,
					dorm_bathroom: req.body.dorm_bath,
					dorm_type: req.body.dorm_type,
					dorm_storey: req.body.dorm_storey,
					dorm_gender: req.body.dorm_gender,
					dorm_summary: req.body.dorm_summary,
					dorm_about: req.body.dorm_about,
					dorm_access: req.body.dorm_access,
					dorm_note: req.body.dorm_note,
					dorm_about_neight: req.body.dorm_about_neigh,
					dorm_how_neigh: req.body.dorm_how_neigh,
					dorm_advance_payment: req.body.dorm_advance_payment,
					dorm_deposit: req.body.deposit,
					dorm_address_id: results.address_id,
					rules_id: results.rules_id,
					amenities_id: results.amenities_id,
				};
				Dorm.create(dorm)
					.then((createdDorm) => {
						for (var x = 1; x <= req.body.roomcount; x++) {
							for (var y = 1; y <= req.body.room[x].count; y++) {
								Room.create({
									dorm_id: createdDorm.dorm_id,
									room_amount: req.body.room[x].amount,
									slots: req.body.room[x].capacity,
									queensize: req.body.room[x].queensize,
									sofabed: req.body.room[x].sofabed,
									singlebed: req.body.room[x].singlebed,
									doubledecker: req.body.room[x].doubledecker,
									room_description: req.body.room[x].description,
									room_utility: req.body.room[x].monthly,
									room_count: req.body.room[x].count,
									room_gender: req.body.room[x].gender,
								}).then((room) => {
									var number = room.slots.replace(/\D/g, "");
									for (var x = 1; x <= number; x++) {
										RoomSlot.create({ room_id: room.room_id }).then(
											(room) => {}
										);
									}
								});
							}
						}
						for (var x = 0; x < req.files.length; x++) {
							if (
								req.files[x].fieldname !== "city_license" &&
								req.files[x].fieldname !== "sanitary_permit" &&
								req.files[x].fieldname !== "fire_safety_certificate"
							) {
								DormImage.create({
									dorm_id: createdDorm.dorm_id,
									caption: req.body.caption[x],
									image: req.files[x].originalname,
								}).then((image) => {});
							} else {
								DormDocument.create({
									dorm_id: createdDorm.dorm_id,
									caption: req.files[x].fieldname,
									image: req.files[x].originalname,
								}).then((image) => {});
							}
						}
						res.redirect("/listing/" + createdDorm.dorm_id);
					})
					.catch((err) => {
						console.log(err);
					});
			});
		} else {
			req.flash(
				"errorheader",
				"You didn't agree to the terms of the site. Please try again if you changed your mind."
			);
			res.redirect("/");
		}
	}
);

router.get("/listing/:dorm_id", function (req, res) {
	getDormInfo("show", req, res);
});

router.get(
	"/listing/:dorm_id/update",
	middleware.checkDormOwnership,
	function (req, res) {
		getDormInfo("update", req, res);
	}
);

router.post(
	"/listing/:dorm_id/update",
	middleware.checkDormOwnership,
	file_upload.any(),
	function (req, res) {
		var dormUpdates = {
			dorm_name: req.body.dorm_name,
			dorm_storey: req.body.dorm_storey,
			dorm_gender: req.body.dorm_gender,
			dorm_type: req.body.dorm_type,
			dorm_summary: req.body.dorm_summary,
			dorm_about: req.body.dorm_about,
			dorm_access: req.body.dorm_access,
			dorm_bathroom: req.body.dorm_bath,
			dorm_deposit: req.body.deposit,
			dorm_advance_payment: req.body.dorm_advance_payment,
			dorm_note: req.body.dorm_note,
			dorm_about_neigh: req.body.dorm_about_neigh,
			dorm_how_neigh: req.body.dorm_how_neigh,
		};

		Dorm.update(dormUpdates, { where: { dorm_id: req.params.dorm_id } })
			.then((results) => {
				var ids = {
					dorm_address_id: results.dorm_address_id,
					rules_id: results.rules_id,
					amenities_id: results.amenities_id,
				};
				updateDormListing(req, ids).then((functionResults) => {});

				if (req.body.remove_image != null) {
					for (var i = 0; i < req.body.remove_image.length; i++) {
						DormImage.destroy({
							where: { dorm_image_id: req.body.remove_image[i] },
						})
							.then((results) => {})
							.catch((err) => {
								console.log(err);
							});
					}
				}

				for (var i = 0; i < req.body.image_old.length; i++) {
					var caption = null;
					if (req.body.image_old[i].caption != "") {
						caption = req.body.image_old[i].caption;
					}
					DormImage.update(
						{
							caption: caption,
						},
						{ where: { dorm_image_id: req.body.image_old[i].image_id } }
					)
						.then((results) => {})
						.catch((err) => {
							console.log(err);
						});
				}

				for (var i = 0; i < req.body.room_old.length; i++) {
					Room.update(
						{
							room_amount: req.body.room_old[i].amount,
							room_description: req.body.room_old[i].description,
							room_utility: req.body.room_old[i].monthly,
						},
						{ where: { room_id: req.body.room_old[i].room_id } }
					)
						.then((results) => {})
						.catch((err) => {
							console.log(err);
						});
				}

				if (req.body.roomcount) {
					for (var x = 1; x <= req.body.roomcount; x++) {
						for (var y = 1; y <= req.body.room[x].count; y++) {
							Room.create({
								dorm_id: req.params.dorm_id,
								room_amount: req.body.room[x].amount,
								slots: req.body.room[x].capacity,
								queensize: req.body.room[x].queensize,
								sofabed: req.body.room[x].sofabed,
								singlebed: req.body.room[x].singlebed,
								doubledecker: req.body.room[x].doubledecker,
								room_description: req.body.room[x].description,
								room_utility: req.body.room[x].monthly,
								room_count: req.body.room[x].count,
							}).then((room) => {
								var number = room.room_slots.replace(/\D/g, "");
								for (var x = 1; x <= number; x++) {
									RoomSlot.create({ room_id: room.room_id }).then((room) => {});
								}
							});
						}
					}
				}

				if (req.body.imagecount > 0) {
					for (var x = 0; x < req.body.imagecount; x++) {
						DormImage.create({
							dorm_id: req.params.dorm_id,
							caption: req.body.caption[x],
							image: req.files[x].originalname,
						})
							.then((image) => {})
							.catch((err) => {
								res.send(err);
							});
					}
				}
				res.redirect("/listing/" + req.params.dorm_id);
			})
			.catch((err) => {
				console.log(err);
			});
	}
);

router.post(
	"/listing/:dorm_id/rating/new",
	middleware.isLoggedIn,
	middleware.checkRatingAuthorization,
	function (req, res) {
		DormRating.create({
			user_id: req.user.user_id,
			dorm_id: req.params.dorm_id,
			rating: req.body.rating,
			comment: req.body.comment,
		}).then((createdDormRating) => {
			res.redirect("/listing/" + req.params.dorm_id + "?anchor=reviews");
		});
	}
);

async function createDormListing(req) {
	var amenities = {
		dorm_wifi: req.body.dorm_wifi,
		dorm_closetdrawers: req.body.dorm_closetdrawers,
		dorm_tv: req.body.dorm_tv,
		dorm_aircon: req.body.dorm_aircon,
		dorm_iron: req.body.dorm_iron,
		dorm_fireext: req.body.dorm_fireext,
		dorm_cctv: req.body.dorm_cctv,
		dorm_kitchen: req.body.dorm_kitchen,
		dorm_washingmachine: req.body.dorm_washingmachine,
		dorm_more_amenities: req.body.dorm_more_amenities,
	};
	var rules = {
		dorm_smoking: req.body.dorm_smoking,
		dorm_pets: req.body.dorm_pets,
		dorm_parties: req.body.dorm_parties,
		dorm_more_rules: req.body.dorm_more_rules,
	};
	var address = {
		dorm_unit: req.body.unit_number,
		dorm_street: req.body.route,
		dorm_city: req.body.locality,
		dorm_complete_loc: req.body.dorm_complete_loc,
		dorm_region: req.body.administrative_area_level_1,
		dorm_long: req.body.dorm_long,
		dorm_lat: req.body.dorm_lat,
	};

	var amenities_id, rules_id, address_id, dorm_id;
	var ids = {};
	try {
		await DormAmenities.create(amenities)
			.then((createdAmenities) => {
				ids.amenities_id = createdAmenities.amenities_id;
			})
			.catch((err) => {
				console.log(err);
			});
		await DormRules.create(rules)
			.then((createdRules) => {
				ids.rules_id = createdRules.rules_id;
			})
			.catch((err) => {
				console.log(err);
			});
		await DormAddress.create(address)
			.then((createdAddress) => {
				ids.address_id = createdAddress.dorm_address_id;
			})
			.catch((err) => {
				console.log(err);
			});
	} catch (e) {
		return "error";
	}
	return ids;
}

async function updateDormListing(req, ids) {
	var amenities = {
		dorm_wifi: req.body.dorm_wifi,
		dorm_closetdrawers: req.body.dorm_closetdrawers,
		dorm_tv: req.body.dorm_tv,
		dorm_aircon: req.body.dorm_aircon,
		dorm_iron: req.body.dorm_iron,
		dorm_fireext: req.body.dorm_fireext,
		dorm_cctv: req.body.dorm_cctv,
		dorm_kitchen: req.body.dorm_kitchen,
		dorm_washingmachine: req.body.dorm_washingmachine,
		dorm_more_amenities: req.body.dorm_more_amenities,
	};
	var rules = {
		dorm_smoking: req.body.dorm_smoking,
		dorm_pets: req.body.dorm_pets,
		dorm_parties: req.body.dorm_parties,
		dorm_more_rules: req.body.dorm_more_rules,
	};
	var address = {
		dorm_unit: req.body.unit_number,
		dorm_street: req.body.route,
		dorm_city: req.body.locality,
		dorm_complete_loc: req.body.dorm_complete_loc,
		dorm_region: req.body.administrative_area_level_1,
		dorm_long: req.body.dorm_long,
		dorm_lat: req.body.dorm_lat,
	};

	var amenities_id, rules_id, address_id, dorm_id;
	var ids = {};
	try {
		await DormAmenities.update(amenities, {
			where: { amenities_id: ids.amenities_id },
		});

		await DormRules.update(rules, { where: { rules_id: ids.rules_id } });

		await DormAddress.update(address, {
			where: { dorm_address_id: ids.dorm_address_id },
		});
	} catch (e) {
		return "error";
	}
	return "success";
}

function getDormInfo(ver, req, res) {
	Dorm.find({
		where: { dorm_id: req.params.dorm_id },
		include: [
			DormAddress,
			DormImage,
			DormRules,
			DormAmenities,
			DormDocument,
			{ model: DormRating, include: [{ model: User, include: [Profile] }] },
		],
		order: sequelize.literal("dorm_ratings.date_rated DESC"),
	}).then((foundDorm) => {
		var showReviewForm = false;
		if (foundDorm) {
			if (req.user) {
				if (req.user.user_type === "Tenant") {
					Reservation.find({
						where: { user_id: req.user.user_id, status: "confirmed" },
						include: [{ model: Room, where: { dorm_id: req.params.dorm_id } }],
					}).then((foundedConfirmedReservation) => {
						DormRating.find({
							where: { user_id: req.user.user_id, dorm_id: req.params.dorm_id },
						}).then((foundedRating) => {
							if (foundedConfirmedReservation && !foundedRating) {
								showReviewForm = true;
							}
						});
					});
				}
			}
			var anchor = null;
			if (req.query.anchor) {
				anchor = req.query.anchor;
			}
			DormRating.count({ where: { dorm_id: req.params.dorm_id } }).then(
				(countedReviews) => {
					sequelize
						.query(
							"SELECT AVG(rating) as averagerating FROM dorm_ratings WHERE dorm_id=" +
								req.params.dorm_id,
							{ type: sequelize.QueryTypes.SELECT }
						)
						.then((averageRating) => {
							Room.findAll({
								where: { dorm_id: req.params.dorm_id },
								include: [RoomSlot],
							}).then((foundRoom) => {
								getAvailableSlots(foundRoom).then((roomResults) => {
									sequelize
										.query(
											"SELECT * FROM room_slots JOIN users ON room_slots.occupant_id = users.user_id JOIN rooms ON  room_slots.room_id = rooms.room_id JOIN profiles ON users.user_id = profiles.user_id WHERE rooms.dorm_id = " +
												req.params.dorm_id,
											{ type: sequelize.QueryTypes.SELECT }
										)
										.then((occupant) => {
											sequelize
												.query(
													"SELECT AVG(room_amount) as average FROM rooms WHERE dorm_id = " +
														req.params.dorm_id,
													{ type: sequelize.QueryTypes.SELECT }
												)
												.then((average) => {
													sequelize
														.query(
															"SELECT COUNT(*) as slots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE room_slots.occupant_id is null and rooms.dorm_id = " +
																foundDorm.dorm_id,
															{ type: sequelize.QueryTypes.SELECT }
														)
														.then((slots) => {
															sequelize
																.query(
																	"SELECT COUNT(*) as allslots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE rooms.dorm_id = " +
																		foundDorm.dorm_id,
																	{ type: sequelize.QueryTypes.SELECT }
																)
																.then((availableslots) => {
																	User.find({
																		where: { user_id: foundDorm.owner_user_id },
																		include: [Profile],
																	}).then((ownerName) => {
																		res.render("listing/" + ver, {
																			dorm: foundDorm,
																			room: roomResults,
																			occupant: occupant,
																			average: average,
																			ownerName: ownerName,
																			availableslots: availableslots,
																			numberofslots: slots,
																			showReviewForm: showReviewForm,
																			anchor: anchor,
																			numberofreviews: countedReviews,
																			averagerating: averageRating,
																		});
																	});
																});
														});
												});
										});
								});
							});
						});
				}
			);
		} else {
			req.flash("errorheader", "Sorry, page is not found.");
			res.redirect("back");
		}
	});
}

async function getAvailableSlots(foundRoom) {
	let rooms = [];
	for (let room of foundRoom) {
		try {
			await RoomSlot.count({
				where: { occupant_id: null, room_id: room.room_id },
			}).then((availableslots) => {
				room.availableslots = availableslots;
			});
			await RoomSlot.count({ where: { room_id: room.room_id } }).then(
				(numberofslots) => {
					room.numberofslots = numberofslots;
				}
			);
		} catch (e) {
			console.log(e);
		}
		rooms.push(room);
	}
	return rooms;
}

module.exports = router;
