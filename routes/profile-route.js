var express = require("express");
var router = express.Router();

var path = require("path");
var multer = require("multer");
var crypto = require("crypto");
var middleware = require("../middleware");
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/images/user_images");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});
var file_upload = multer({
	storage: storage,
});

var Profile = require("../models/profile-model"),
	User = require("../models/user-model"),
	DormAddress = require("../models/address-dorm-model"),
	Reservation = require("../models/reservation-model"),
	Room = require("../models/room-model"),
	Dorm = require("../models/dorm-model"),
	RoomSlot = require("../models/room-slots-model"),
	DormImage = require("../models/dorm-images-model");

User.hasOne(Profile, { foreignKey: "user_id" });
Dorm.belongsTo(User, { foreignKey: "owner_user_id" });

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

router.get(
	"/profile/:user_id",
	middleware.checkProfileOwnership,
	function (req, res) {
		Profile.findOne({ where: { user_id: req.params.user_id } })
			.then((profile) => {
				User.findOne({ where: { user_id: req.params.user_id } }).then(
					(userResults) => {
						res.render("profile/index", {
							user_id: req.params.user_id,
							profile: profile,
							user_type: userResults.user_type,
						});
					}
				);
			})
			.catch((err) => {
				console.log(err);
			});
	}
);

router.put(
	"/profile/:user_id",
	middleware.checkProfileOwnership,
	function (req, res) {
		var updates = {
			first_name: req.body.first_name_profile,
			last_name: req.body.last_name_profile,
			birth_month: req.body.month,
			birth_day: req.body.day,
			birth_year: req.body.year,
			gender: req.body.gender,
			contact: req.body.contact,
			self_description: req.body.self_description,
		};
		Profile.update(updates, { where: { user_id: req.params.user_id } })
			.then((result) => {
				req.flash("success", "Successfully update user profile.");
				res.redirect("back");
			})
			.catch((err) => {
				req.flash("error", "Something went wrong. Try again later.");
				res.redirect("back");
			});
	}
);

router.get(
	"/profile/:user_id/password",
	middleware.checkUserOwnership,
	function (req, res) {
		User.findOne({ where: { user_id: req.params.user_id } }).then(
			(userResults) => {
				res.render("profile/password", {
					user_id: req.params.user_id,
					user_type: userResults.user_type,
				});
			}
		);
	}
);

router.put(
	"/profile/:user_id/password",
	middleware.checkUserOwnership,
	function (req, res) {
		User.resetPassword(
			req.user.username,
			req.body.new_password,
			req.body.old_password,
			function (err, newPassword) {
				if (err) {
					req.flash("error", "Old password does not match. Please try again.");
					res.redirect("back");
				} else {
					req.flash("success", "Successfully changed password.");
					res.redirect("back");
				}
			}
		);
	}
);

router.get(
	"/profile/:user_id/photo",
	middleware.checkUserOwnership,
	function (req, res) {
		User.findOne({ where: { user_id: req.params.user_id } }).then(
			(userResults) => {
				res.render("profile/photo", {
					user_id: req.params.user_id,
					user_type: userResults.user_type,
				});
			}
		);
	}
);

router.put(
	"/profile/:user_id/photo",
	middleware.checkUserOwnership,
	file_upload.single("user_photo"),
	function (req, res) {
		if (req.file) {
			User.update(
				{ photo: req.file.filename },
				{ where: { user_id: req.params.user_id } }
			)
				.then((result) => {
					req.flash("success", "Successfully updated user photo.");
					res.redirect("back");
				})
				.catch((err) => {
					req.flash("error", "Something went wrong. Try again later.");
					res.redirect("back");
				});
		} else {
			req.flash("error", "Only image file should be uploaded.");
			res.redirect("back");
		}
	}
);

router.get("/profile/:user_id/about", function (req, res) {
	User.findOne({
		where: { user_id: req.params.user_id },
		include: [Profile],
	}).then((foundedUser) => {
		if (foundedUser) {
			if (foundedUser.user_type === "Dorm Owner") {
				Dorm.findAll({ where: { owner_user_id: req.params.user_id } }).then(
					(foundedDorm) => {
						getDormListings(foundedDorm).then((foundedDorms) => {
							res.render("profile/about", {
								user: foundedUser,
								dorms: foundedDorms,
							});
						});
					}
				);
			} else {
				res.render("profile/about", { user: foundedUser });
			}
		} else {
			req.flash("errorheader", "User not found. Please try again.");
			res.redirect("back");
		}
	});
});

async function getDormListings(dorms) {
	let dormLists = [];
	for (let dorm of dorms) {
		try {
			await DormAddress.find({
				where: { dorm_address_id: dorm.dorm_address_id },
			}).then((address) => {
				dorm.address = address;
			});
			await DormImage.find({ where: { dorm_id: dorm.dorm_id } }).then(
				(image) => {
					dorm.image = image;
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
		dormLists.push(dorm);
	}
	return dormLists;
}

module.exports = router;
