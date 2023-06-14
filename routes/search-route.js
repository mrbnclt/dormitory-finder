var express = require("express");
var router = express.Router();
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

var Dorm = require("../models/dorm-model"),
	DormAddress = require("../models/address-dorm-model"),
	DormAmenities = require("../models/dorm-amenities-model"),
	DormRules = require("../models/dorm-rules-model"),
	Room = require("../models/room-model"),
	DormImage = require("../models/dorm-images-model"),
	DormRating = require("../models/dorm-rating-model");

Dorm.belongsTo(DormAddress, { foreignKey: "dorm_address_id" });
Dorm.belongsTo(DormAmenities, { foreignKey: "amenities_id" });
Dorm.belongsTo(DormRules, { foreignKey: "rules_id" });
Dorm.hasMany(DormImage, { foreignKey: "dorm_id" });

//pagination parameters
var totalRec = 0,
	pageSize = 10,
	pageCount = 0,
	start = 0,
	currentPage = 1;

router.get("/search", function (req, res) {
	var amenityFilter = {};
	var ruleFilter = {};
	var dormFilter = {
		[Op.or]: [
			{ dorm_complete_loc: { [Op.like]: "%" + req.query.location + "%" } },
			{ dorm_city: { [Op.like]: "%" + req.query.query_city + "%" } },
			{ dorm_region: { [Op.like]: "%" + req.query.location + "%" } },
			{ dorm_street: { [Op.like]: "%" + req.query.location + "%" } },
		],
	};
	var filterDefault = {};

	for (var filter in req.query) {
		switch (filter) {
			case "smoking":
				ruleFilter.dorm_smoking = req.query.smoking;
				break;
			case "pets":
				ruleFilter.dorm_pets = req.query.pets;
				break;
			case "parties":
				ruleFilter.dorm_parties = req.query.parties;
				break;
			case "wifi":
				amenityFilter.dorm_wifi = req.query.wifi;
				break;
			case "closet":
				amenityFilter.dorm_closetdrawers = req.query.closet;
				break;
			case "tv":
				amenityFilter.dorm_tv = req.query.tv;
				break;
			case "aircon":
				amenityFilter.dorm_aircon = req.query.aircon;
				break;
			case "iron":
				amenityFilter.dorm_iron = req.query.iron;
				break;
			case "kitchen":
				amenityFilter.dorm_kitchen = req.query.kitchen;
				break;
			case "washingmachine":
				amenityFilter.dorm_washingmachine = req.query.washingmachine;
				break;
			case "fireext":
				amenityFilter.dorm_fireext = req.query.fireext;
				break;
			case "cctv":
				amenityFilter.dorm_cctv = req.query.cctv;
				break;
			case "gender":
				filterDefault.dorm_gender = req.query.gender;
				break;
			case "bathrooms":
				filterDefault.dorm_bathroom = {
					[Op.between]: [0, Number(req.query.bathrooms)],
				};
				break;
		}
	}

	var filterBathroom = 10;
	if (req.query.bathrooms) {
		filterBathroom = req.query.bathrooms;
	}

	if (!req.query.fromAverageAmount) {
		req.query.fromAverageAmount = 500;
	}

	if (!req.query.toAverageAmount) {
		req.query.toAverageAmount = 10000;
	}

	var filters = [
		{ dormFilter: dormFilter },
		{ amenityFilter: amenityFilter },
		{ ruleFilter: ruleFilter },
		{
			otherFilter: {
				bathroom: filterBathroom,
				fromAverageAmount: req.query.fromAverageAmount,
				toAverageAmount: req.query.toAverageAmount,
			},
		},
		{ filterDefault: filterDefault },
		{ query: req.query.location },
		{ query_city: req.query.query_city },
		{ query_lat: req.query.query_lat },
		{ query_lng: req.query.query_lng },
	];

	var centerPoint = {
		lat: req.query.query_lat,
		lng: req.query.query_lng,
	};

	Dorm.findAll({
		where: filterDefault,
		include: [
			DormImage,
			{ model: DormAddress, where: dormFilter },
			{ model: DormAmenities, where: amenityFilter },
			{ model: DormRules, where: ruleFilter },
		],
	}).then((dorms) => {
		totalRec = dorms.length;
		pageCount = Math.ceil(totalRec / pageSize);
		if (typeof req.query.page !== "undefined") {
			currentPage = req.query.page;
		} else {
			currentPage = 1;
		}

		if (currentPage > 0) {
			start = (currentPage - 1) * pageSize;
		}
		Dorm.findAll({
			where: filterDefault,
			include: [
				DormImage,
				{ model: DormAddress, where: dormFilter },
				{ model: DormAmenities, where: amenityFilter },
				{ model: DormRules, where: ruleFilter },
			],
			offset: start,
			limit: pageSize,
		}).then((dorms) => {
			if (dorms.length > 0) {
				getDormListings(
					dorms,
					req.query.fromAverageAmount,
					req.query.toAverageAmount,
					centerPoint
				).then((results) => {
					if (results.length > 0) {
						var numberofresults = results.length;
						pageCount = Math.ceil(results.length / pageSize);
						res.render("index/search", {
							lists: results,
							pageSize: pageSize,
							pageCount: pageCount,
							currentPage: currentPage,
							filters: filters,
							numberofresults: numberofresults,
						});
					} else {
						req.flash("errorheader", "Sorry, no listing found.");
						res.redirect("back");
					}
				});
			} else {
				req.flash("errorheader", "Sorry, no listing found.");
				res.redirect("back");
			}
		});
	});
});

async function getDormListings(
	dorms,
	fromAverageAmount,
	toAverageAmount,
	centerPoint
) {
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
		if (
			dorm.avgrent[0].avgrent >= fromAverageAmount &&
			dorm.avgrent[0].avgrent <= toAverageAmount &&
			dorm.roomslots[0].slots > 0
		) {
			dormCoordinate = {
				lat: dorm.address_dorm.dorm_lat,
				lng: dorm.address_dorm.dorm_long,
			};
			if (dorm.dorm_verified == 1) {
				if (arePointsNear(dormCoordinate, centerPoint, 2)) {
					dormLists.push(dorm);
				}
			}
		}
	}
	return dormLists;
}

function withinRadius(point, interest, kms) {
	let R = 6371;
	let deg2rad = (n) => {
		return n * (Math.PI / 180);
	};

	let dLat = deg2rad(interest.lat - point.lat);
	let dLon = deg2rad(interest.lng - point.lng);

	let a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(point.lat)) *
			Math.cos(deg2rad(interest.lat)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	let c = 2 * Math.asin(Math.sqrt(a));
	let d = R * c;
	return d <= kms;
}

function arePointsNear(checkPoint, centerPoint, km) {
	var ky = 40000 / 360;
	var kx = Math.cos((Math.PI * centerPoint.lat) / 180.0) * ky;
	var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
	var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
	return Math.sqrt(dx * dx + dy * dy) <= km;
}

module.exports = router;
