var express = require("express");
var router = express.Router();
var Profile = require("../models/profile-model"),
	User = require("../models/user-model");
var passport = require("passport");
var request = require("request");
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
	),
	Op = Sequelize.Op;

var app = express();

var RoomSlot = require("../models/room-slots-model"),
	Room = require("../models/room-model"),
	Dorm = require("../models/dorm-model"),
	User = require("../models/user-model"),
	DormAddress = require("../models/address-dorm-model"),
	DormImage = require("../models/dorm-images-model"),
	Reservation = require("../models/reservation-model"),
	DormRating = require("../models/dorm-rating-model"),
	DormDocument = require("../models/dorm-documents-model");

Dorm.hasMany(Room, { foreignKey: "dorm_id" });
Room.hasMany(RoomSlot, { foreignKey: "room_id" });
RoomSlot.belongsTo(User, { foreignKey: "occupant_id" });

Dorm.hasMany(DormDocument, { foreignKey: "dorm_id" });
Dorm.belongsTo(DormAddress, { foreignKey: "dorm_address_id" });
Dorm.hasMany(DormImage, { foreignKey: "dorm_id" });

setInterval(function () {
	Reservation.findAll({
		where: { status: { [Op.or]: ["pending", "owner confirmed"] } },
	}).then((foundedReservation) => {
		foundedReservation.forEach(function (reservation) {
			RoomSlot.count({
				where: { room_id: reservation.room_id, occupant_id: null },
			}).then((countedSlot) => {
				if (countedSlot < reservation.slots_reserved) {
					Reservation.update(
						{
							status: "no slots left",
							update_made: "System Updates",
							tenant_viewed: "0",
							owner_viewed: "0",
						},
						{ where: { reservation_id: reservation.reservation_id } }
					);
				}
			});
		});
	});
}, 10000);

router.get("/", function (req, res) {
	Dorm.findAll({
		order: sequelize.literal("dorm_listed_at DESC"),
		include: [DormAddress, DormImage],
		limit: 4,
	}).then((dorms) => {
		getDormListings(dorms).then((newDorms) => {
			sequelize
				.query(
					"SELECT dorm_id FROM dorm_ratings GROUP BY dorm_id ORDER BY AVG(rating) ASC LIMIT 4",
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((topRateID) => {
					getDormID(topRateID).then((topRatedIDResults) => {
						Dorm.findAll({
							where: { dorm_id: { [Op.in]: topRatedIDResults } },
							include: [DormAddress, DormImage],
						}).then((topRatedDorms) => {
							getDormListings(topRatedDorms).then((topRated) => {
								sequelize
									.query(
										"SELECT dorm_id FROM dorm_ratings GROUP BY dorm_id ORDER BY COUNT(*) DESC LIMIT 4",
										{ type: sequelize.QueryTypes.SELECT }
									)
									.then((mostReviewedID) => {
										getDormID(mostReviewedID).then((mostReviewedIDResults) => {
											Dorm.findAll({
												where: { dorm_id: { [Op.in]: mostReviewedIDResults } },
												include: [DormAddress, DormImage],
											}).then((topRatedDorms) => {
												getDormListings(topRatedDorms).then((mostReviewed) => {
													res.render("index/index", {
														newDorms: newDorms,
														topRated: topRated,
														mostReviewed: mostReviewed,
													});
												});
											});
										});
									});
							});
						});
					});
				});
		});
	});
});

router.get("/signup", middleware.notLoggedIn, function (req, res) {
	res.render("index/signup");
});

router.post("/signup", middleware.notLoggedIn, function (req, res) {
	var photo;
	if (req.body.gender == "Male") {
		photo = "avatar_male.png";
	} else {
		photo = "avatar_female.png";
	}
	var newUser = new User({
		username: req.body.username,
		user_type: req.body.user_type,
		oldpassword: req.body.password,
		photo: photo,
	});
	User.register(newUser, req.body.password, function (err, user) {
		if (err) {
			req.flash("errorheader", "Sorry your email is already taken.");
			res.redirect("back");
		} else {
			var newProfile = {
				user_id: user.user_id,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				birth_month: req.body.month,
				birth_day: req.body.day,
				birth_year: req.body.year,
				gender: req.body.gender,
				contact: req.body.contact,
				self_description: req.body.self_description,
			};
			Profile.create(newProfile)
				.then(() => {})
				.catch((err) => {
					req.flash(
						"errorheader",
						"Something went wrong. Please try again later."
					);
					res.redirect("back");
				});
			passport.authenticate("local")(req, res, function () {
				req.flash("successheader", "You have successfully signed up.");
				res.redirect("/");
			});
		}
	});
});

router.get("/login", middleware.notLoggedIn, function (req, res) {
	res.render("index/login", { referer: req.headers.referer });
});

router.post("/login", middleware.notLoggedIn, function (req, res, next) {
	passport.authenticate("local", function (err, user, info) {
		req.logIn(user, function (err) {
			if (!user) {
				req.flash(
					"errorheader",
					"Username and password not found. Please try again."
				);
				res.redirect("back");
			} else {
				if (req.user.user_type === "Tenant") {
					if (
						req.body.referer &&
						req.body.referer !== undefined &&
						req.body.referer.slice(-6) !== "/login"
					) {
						res.redirect(req.body.referer);
					} else {
						res.redirect("/dorm/");
					}
				} else if (req.user.user_type === "Dorm Owner") {
					Dorm.findAll({ where: { owner_user_id: req.user.user_id } }).then(
						(foundDorm) => {
							if (foundDorm) {
								res.redirect("/dorm/");
							} else {
								res.redirect("/listing/new");
							}
						}
					);
				} else if (req.user.user_type === "Admin") {
					res.redirect("/admin");
				}
			}
		});
	})(req, res, next);
});

router.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

router.get("/geocode", function (req, res, next) {
	request(
		"https://maps.googleapis.com/maps/api/geocode/json?address=" +
			req.query.address +
			"&key=AIzaSyAeqKaE2xSUv_iplHE5GK1baRKlwKyURrE",
		function (error, response, body) {
			if (!error && response.statusCode == "200") {
				var data = JSON.parse(body);
				res.send(data.results[0].geometry.location);
			} else {
			}
		}
	);
});

router.get("/admin", middleware.userIsAdmin, function (req, res, next) {
	User.findOne({
		where: { user_id: req.user.user_id },
		include: [Profile],
	}).then((foundedAdmin) => {
		Dorm.findAll({
			where: { dorm_verified: "0" },
			order: sequelize.literal("dorm_listed_at DESC"),
			include: [DormAddress, DormImage],
		}).then((dorms) => {
			getDormNotVerified(dorms).then((newlyListed) => {
				Dorm.findAll({
					where: { dorm_verified: "1" },
					order: sequelize.literal("dorm_listed_at DESC"),
					include: [DormAddress, DormImage],
				}).then((verified) => {
					getDormListings(verified).then((verifiedDorms) => {
						res.render("index/admin", {
							admin: foundedAdmin,
							list: newlyListed,
							verified: verifiedDorms,
						});
						//res.send(foundedAdmin);
					});
				});
			});
		});
	});
});

async function getDormID(dorms) {
	let dormIDLists = [];
	for (let dorm of dorms) {
		await dormIDLists.push(dorm.dorm_id);
	}
	return dormIDLists;
}

async function getDormListings(dorms) {
	let dormLists = [];
	for (let dorm of dorms) {
		if (dorm.dorm_verified == 1) {
			try {
				await sequelize
					.query(
						"SELECT AVG(rating) as averagerating FROM dorm_ratings WHERE dorm_id = " +
							dorm.dorm_id,
						{ type: sequelize.QueryTypes.SELECT }
					)
					.then((averageRating) => {
						dorm.averagerating = averageRating;
					});
				await DormRating.count({ where: { dorm_id: dorm.dorm_id } }).then(
					(countedReviews) => {
						dorm.countedreviews = countedReviews;
					}
				);
				await Room.sum("room_count", { where: { dorm_id: dorm.dorm_id } }).then(
					(roomcount) => {
						dorm.roomcount = roomcount;
					}
				);
				await sequelize
					.query(
						"SELECT COUNT(*) as slots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE room_slots.occupant_id is null and rooms.dorm_id = " +
							dorm.dorm_id,
						{ type: sequelize.QueryTypes.SELECT }
					)
					.then((slots) => {
						dorm.roomslots = slots;
					});
				await sequelize
					.query(
						"SELECT COUNT(*) as allslots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE rooms.dorm_id = " +
							dorm.dorm_id,
						{ type: sequelize.QueryTypes.SELECT }
					)
					.then((availableslots) => {
						dorm.availableslots = availableslots;
					});
				await sequelize
					.query(
						"SELECT AVG(room_amount) as avgrent FROM rooms JOIN dorms ON rooms.dorm_id = dorms.dorm_id WHERE dorms.dorm_id = " +
							dorm.dorm_id,
						{ type: sequelize.QueryTypes.SELECT }
					)
					.then((avgrent) => {
						dorm.avgrent = avgrent;
					});
			} catch (e) {
				console.log(e);
			}
			if (dorm.roomslots[0].slots > 0) {
				if (dorm.dorm_verified == 1) {
					dormLists.push(dorm);
				}
			}
		}
	}
	return dormLists;
}

async function getDormNotVerified(dorms) {
	let dormLists = [];
	for (let dorm of dorms) {
		try {
			await sequelize
				.query(
					"SELECT AVG(rating) as averagerating FROM dorm_ratings WHERE dorm_id = " +
						dorm.dorm_id,
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((averageRating) => {
					dorm.averagerating = averageRating;
				});
			await DormRating.count({ where: { dorm_id: dorm.dorm_id } }).then(
				(countedReviews) => {
					dorm.countedreviews = countedReviews;
				}
			);
			await Room.sum("room_count", { where: { dorm_id: dorm.dorm_id } }).then(
				(roomcount) => {
					dorm.roomcount = roomcount;
				}
			);
			await sequelize
				.query(
					"SELECT COUNT(*) as slots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE room_slots.occupant_id is null and rooms.dorm_id = " +
						dorm.dorm_id,
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((slots) => {
					dorm.roomslots = slots;
				});
			await sequelize
				.query(
					"SELECT COUNT(*) as allslots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE rooms.dorm_id = " +
						dorm.dorm_id,
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((availableslots) => {
					dorm.availableslots = availableslots;
				});
			await sequelize
				.query(
					"SELECT AVG(room_amount) as avgrent FROM rooms JOIN dorms ON rooms.dorm_id = dorms.dorm_id WHERE dorms.dorm_id = " +
						dorm.dorm_id,
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((avgrent) => {
					dorm.avgrent = avgrent;
				});
		} catch (e) {
			console.log(e);
		}
		if (dorm.roomslots[0].slots > 0) {
			dormLists.push(dorm);
		}
	}
	return dormLists;
}

module.exports = router;
