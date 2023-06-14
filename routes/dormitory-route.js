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
	),
	Op = Sequelize.Op;

const paypal = require("paypal-rest-sdk");

paypal.configure({
	mode: "sandbox", //sandbox or live
	client_id: process.env.PAYPAL_CLIENTID,
	client_secret: process.env.PAYPAL_CLIENTSECRET,
});

var Reservation = require("../models/reservation-model"),
	RoomSlot = require("../models/room-slots-model"),
	Room = require("../models/room-model"),
	Dorm = require("../models/dorm-model"),
	DormImage = require("../models/dorm-images-model"),
	User = require("../models/user-model"),
	Profile = require("../models/profile-model"),
	Payment = require("../models/payment-model"),
	//Complaint 	= require("../models/complaint-model"),
	//Post 		= require("../models/post-model"),
	//Comment		= require("../models/comment-model"),
	DormAddress = require("../models/address-dorm-model"),
	DormRating = require("../models/dorm-rating-model");

DormRating.belongsTo(User, { foreignKey: "user_id" });
DormRating.belongsTo(Dorm, { foreignKey: "dorm_id" });
Room.belongsTo(Dorm, { foreignKey: "dorm_id" });
Room.hasMany(RoomSlot, { foreignKey: "room_id" });
Room.hasMany(Reservation, { foreignKey: "room_id" });
Reservation.belongsTo(Room, { foreignKey: "room_id" });
User.hasOne(Profile, { foreignKey: "user_id" });
Reservation.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(RoomSlot, { foreignKey: "occupant_id" });
RoomSlot.belongsTo(Room, { foreignKey: "room_id" });
User.hasMany(Dorm, { foreignKey: "owner_user_id" });
Dorm.hasMany(Room, { foreignKey: "dorm_id" });
Dorm.hasMany(DormImage, { foreignKey: "dorm_id" });
Dorm.belongsTo(DormAddress, { foreignKey: "dorm_id" });
RoomSlot.belongsTo(User, { foreignKey: "occupant_id" });
Payment.belongsTo(User, { foreignKey: "payer_id" });
//Complaint.belongsTo(User, {foreignKey: "complainant_id"});
Reservation.hasOne(Payment, { foreignKey: "reservation_id" });

// Post.belongsTo(User, {foreignKey: "author_id"});
// Comment.belongsTo(User, {foreignKey: "commenter_id"});
// Post.hasMany(Comment, {foreignKey: "post_id"});

var numOfReservationUpdates = 0;

router.get(
	"/dorm/",
	middleware.isLoggedIn,
	middleware.notAdmin,
	function (req, res) {
		if (req.user.user_type === "Tenant") {
			var filter = {
				user_id: req.user.user_id,
				status: {
					[Op.or]: ["pending", "owner confirmed", "cancelled", "no slots left"],
				},
			};
			if (req.query.filter) {
				switch (req.query.filter) {
					case "Pending Reservations":
						filter.status = { [Op.or]: ["pending", "owner confirmed"] };
						break;
					case "Cancelled Reservations":
						filter.status = { [Op.or]: ["cancelled", "no slots left"] };
						break;
				}
			}
			Reservation.findAll({
				where: filter,
				include: [
					{
						model: Room,
						include: [RoomSlot, { model: Dorm, include: [DormImage] }],
					},
					{ model: User, include: [Profile] },
				],
				order: sequelize.literal("updated_at ASC"),
			}).then((foundedDormReserved) => {
				Reservation.findAll({
					where: { user_id: req.user.user_id, status: "confirmed" },
					include: [
						Payment,
						{
							model: Room,
							include: [
								RoomSlot,
								{ model: Dorm, include: [DormImage, DormAddress] },
							],
						},
						{ model: User, include: [Profile] },
					],
					order: sequelize.literal("updated_at ASC"),
				}).then((foundedConfirmedDormReserved) => {
					Reservation.update(
						{ tenant_viewed: "1" },
						{ where: { user_id: req.user.user_id } }
					);
					User.findAll({ include: [Profile, RoomSlot] }).then((occupant) => {
						//res.send(foundedDormReserved);
						res.render("dorm/index", {
							userType: req.user.user_type,
							confirmedReservations: foundedConfirmedDormReserved,
							notConfirmedReservations: foundedDormReserved,
							occupant: occupant,
							filter: req.query.filter,
						});
					});
					//res.send(foundedConfirmedDormReserved)
				});
			});
		} else {
			Dorm.findAll({
				where: { owner_user_id: req.user.user_id },
				include: [DormImage],
			}).then((foundedDorm) => {
				getDormitoryInformation(foundedDorm).then((foundedDormResults) => {
					res.render("dorm/index", {
						userType: req.user.user_type,
						dorms: foundedDormResults,
					});
				});
			});
		}
	}
);

router.post(
	"/dorm/:reserve_id/reserve",
	middleware.isLoggedIn,
	middleware.checkReservationAuthorization,
	function (req, res) {
		if (req.body.action == "accepted") {
			Reservation.find({
				where: { reservation_id: req.params.reserve_id },
			}).then((foundReservation) => {
				RoomSlot.count({
					where: { room_id: foundReservation.room_id, occupant_id: null },
				}).then((foundSlot) => {
					if (foundSlot >= foundReservation.slots_reserved) {
						Room.find({ where: { room_id: foundReservation.room_id } }).then(
							(foundRoom) => {
								Dorm.find({ where: { dorm_id: foundRoom.dorm_id } }).then(
									(foundDorm) => {
										var advQuantity =
											foundDorm.dorm_advance_payment *
											foundReservation.slots_reserved;
										var firstMonthQuantity = foundReservation.slots_reserved;
										var deposit =
											foundDorm.dorm_deposit * foundReservation.slots_reserved;
										var totalPayment = Number(
											(advQuantity + foundReservation.slots_reserved) *
												foundRoom.room_amount +
												deposit
										);
										const create_payment_json = {
											intent: "sale",
											payer: {
												payment_method: "paypal",
											},
											redirect_urls: {
												return_url:
													"http://localhost:3000/dorm/" +
													req.params.reserve_id +
													"/successpayment",
												cancel_url:
													"http://localhost:3000/dorm/" +
													req.params.reserve_id +
													"/cancelpayment",
											},
											transactions: [
												{
													item_list: {
														items: [
															{
																name:
																	"Advance Payment for " +
																	foundDorm.dorm_name +
																	" for " +
																	foundDorm.dorm_advance_payment +
																	" months for " +
																	foundReservation.slots_reserved +
																	" slots",
																price: foundRoom.room_amount,
																currency: "PHP",
																quantity: advQuantity,
															},
															{
																name:
																	"Deposit for " +
																	foundDorm.dorm_name +
																	" for " +
																	foundReservation.slots_reserved +
																	" slots",
																price: foundDorm.dorm_deposit,
																currency: "PHP",
																quantity: foundReservation.slots_reserved,
															},
															{
																name:
																	"First Month Rent Payment for " +
																	foundDorm.dorm_name +
																	" for " +
																	foundReservation.slots_reserved +
																	" slots",
																price: foundRoom.room_amount,
																currency: "PHP",
																quantity: firstMonthQuantity,
															},
														],
													},
													amount: {
														currency: "PHP",
														total: totalPayment,
													},
													description: "Payment for " + foundDorm.dorm_name,
												},
											],
										};
										paypal.payment.create(
											create_payment_json,
											function (error, payment) {
												if (error) {
													res.send(error);
												} else {
													for (let i = 0; i < payment.links.length; i++) {
														if (payment.links[i].rel === "approval_url") {
															res.redirect(payment.links[i].href);
														}
													}
												}
											}
										);
									}
								);
							}
						);
					} else {
						req.flash(
							"errorheader",
							"This room cannot accommodate the number of slots you reserved."
						);
						res.redirect("back");
					}
				});
			});
		} else {
			Reservation.update(
				{
					status: "cancelled",
					update_made: "Tenant Updates",
					updated_at: sequelize.fn("NOW"),
				},
				{ where: { reservation_id: req.params.reserve_id } }
			).then((updateReserveResult) => {
				req.flash("successheader", "Reservation cancelled.");
				res.redirect("back");
			});
		}
	}
);

router.get("/dorm/:reserve_id/successpayment", function (req, res) {
	Reservation.find({ where: { reservation_id: req.params.reserve_id } }).then(
		(foundReservation) => {
			RoomSlot.findAll({
				where: { room_id: foundReservation.room_id, occupant_id: null },
				limit: foundReservation.slots_reserved,
			})
				.then((foundSlot) => {
					Room.find({ where: { room_id: foundReservation.room_id } }).then(
						(foundRoom) => {
							Dorm.find({ where: { dorm_id: foundRoom.dorm_id } }).then(
								(foundDorm) => {
									const payerId = req.query.PayerID;
									const paymentId = req.query.paymentId;
									var totalPayment = Number(
										(foundDorm.dorm_advance_payment *
											foundReservation.slots_reserved +
											foundReservation.slots_reserved) *
											foundRoom.room_amount +
											foundDorm.dorm_deposit * foundReservation.slots_reserved
									);
									const execute_payment_json = {
										payer_id: payerId,
										transactions: [
											{
												amount: {
													currency: "PHP",
													total: totalPayment,
												},
											},
										],
									};

									paypal.payment.execute(
										paymentId,
										execute_payment_json,
										function (error, payment) {
											if (error) {
												throw error;
											} else {
												if (payment.httpStatusCode == 200) {
													foundSlot.forEach(function (slot) {
														RoomSlot.update(
															{ occupant_id: foundReservation.user_id },
															{ where: { room_slot_id: slot.room_slot_id } }
														).then((updateSlotResult) => {});
													});
													Reservation.update(
														{
															status: "confirmed",
															update_made: "Tenant Updates",
															updated_at: sequelize.fn("NOW"),
														},
														{
															where: {
																reservation_id: foundReservation.reservation_id,
															},
														}
													).then((updateReservationResult) => {
														payOwner(
															payment.transactions[0].amount.total,
															foundDorm.owner_user_id,
															payment.payer.payer_info.first_name +
																" " +
																payment.payer.payer_info.last_name,
															payment.payer.payer_info.email,
															foundReservation.user_id,
															foundDorm.dorm_id,
															foundReservation.reservation_id,
															foundDorm.dorm_name,
															req,
															res,
															payment.id
														);
													});
												}
											}
										}
									);
								}
							);
						}
					);
				})
				.catch((err) => {
					req.flash(
						"errorheader",
						"The room from this reservation has all slots already occupied."
					);
					res.redirect("back");
				});
		}
	);
});

router.post(
	"/dorm/:dorm_id/reservation",
	middleware.isLoggedIn,
	function (req, res) {
		Profile.findOne({ where: { user_id: req.user.user_id } }).then(
			(foundedUser) => {
				if (
					(req.body.roomgender === "For males" &&
						foundedUser.gender === "Male") ||
					(req.body.roomgender === "For females" &&
						foundedUser.gender === "Female") ||
					(req.body.roomgender === "For males and females" &&
						foundedUser.gender === "Male") ||
					(req.body.roomgender === "For males and females" &&
						foundedUser.gender === "Female")
				) {
					if (req.body.move_in_date) {
						sequelize
							.query(
								"SELECT count(*) as numberOfAvailableSlot FROM room_slots WHERE occupant_id IS NULL AND room_id = " +
									req.body.selectedroomid,
								{ type: sequelize.QueryTypes.SELECT }
							)
							.then((results) => {
								if (
									results[0].numberOfAvailableSlot >= req.body.slots_reserved
								) {
									Reservation.create({
										user_id: req.body.user_id,
										room_id: req.body.selectedroomid,
										status: "pending",
										move_in_date: req.body.move_in_date,
										slots_reserved: req.body.slots_reserved,
										update_made: "Tenant Updates",
									}).then((reservation) => {
										req.flash(
											"successheader",
											"Successfully reserved. Please wait for the owner's approval."
										);
										res.redirect("/dorm");
									});
								} else {
									req.flash(
										"errorheader",
										"Remaining slots of this room cannot accommodate the number of slots you reserved."
									);
									res.redirect("back");
								}
							});
					} else {
						req.flash(
							"errorheader",
							"Please select a date when you will move in."
						);
						res.redirect("back");
					}
				} else {
					req.flash(
						"errorheader",
						"Sorry the gender for this room is opposite to yours. Please choose a different room."
					);
					res.redirect("back");
				}
			}
		);
	}
);

router.get(
	"/dorm/:dorm_id/reservation/",
	middleware.checkDormOwnership,
	function (req, res) {
		var filter = {};
		if (req.query.filter) {
			switch (req.query.filter) {
				case "Confirmed Reservations":
					filter.status = "confirmed";
					break;
				case "Pending Reservations":
					filter.status = { [Op.or]: ["pending", "owner confirmed"] };
					break;
				case "Cancelled Reservations":
					filter.status = "cancelled";
					break;
			}
		}
		Reservation.findAll({
			where: filter,
			order: sequelize.literal("reservation_date DESC"),
			include: [
				Payment,
				{
					model: Room,
					where: { dorm_id: req.params.dorm_id },
					include: [
						{ model: RoomSlot, include: [{ model: User, include: [Profile] }] },
						Dorm,
					],
				},
				{ model: User, include: [Profile] },
			],
		}).then((reservationInfo) => {
			Dorm.findOne({
				where: { dorm_id: req.params.dorm_id },
				include: [DormImage],
			}).then((foundedDorm) => {
				sequelize
					.query(
						"SELECT * FROM room_slots JOIN users ON room_slots.occupant_id = users.user_id JOIN rooms ON  room_slots.room_id = rooms.room_id JOIN profiles ON users.user_id = profiles.user_id WHERE rooms.dorm_id = " +
							req.params.dorm_id,
						{ type: sequelize.QueryTypes.SELECT }
					)
					.then((occupant) => {
						Room.findAll({ where: { dorm_id: req.params.dorm_id } }).then(
							(rooms) => {
								updateReservations(rooms);
							}
						);
						res.render("dorm/reservation/index", {
							reservationupdates: numOfReservationUpdates,
							selected: "reservation",
							results: reservationInfo,
							occupant: occupant,
							dorm: foundedDorm,
							dorm_id: req.params.dorm_id,
							filter: req.query.filter,
						});
					});
			});
		});
	}
);

router.put(
	"/dorm/:dorm_id/reservation/:reserve_id",
	middleware.checkDormOwnership,
	function (req, res) {
		Reservation.find({ where: { reservation_id: req.params.reserve_id } }).then(
			(foundReservation) => {
				RoomSlot.count({
					where: { room_id: foundReservation.room_id, occupant_id: null },
				}).then((foundSlot) => {
					if (foundSlot >= foundReservation.slots_reserved) {
						Reservation.update(
							{
								status: req.body.action,
								update_made: "Owner Updates",
								tenant_viewed: "0",
							},
							{ where: { reservation_id: req.params.reserve_id } }
						)
							.then((result) => {
								if (req.body.action == "owner confirmed") {
									req.flash(
										"successheader",
										"Reservation successfully accepted, wait for reserver's confirmation"
									);
									res.redirect("back");
								} else {
									req.flash(
										"successheader",
										"Reservation is successfully declined."
									);
									res.redirect("back");
								}
							})
							.catch((err) => {
								req.flash(
									"errorheader",
									"Something went wrong. Try again later."
								);
								res.redirect("back");
							});
					} else {
						req.flash(
							"erroheader",
							"Remaining slots cannot accommodate the number of slots reserved."
						);
						res.redirect("back");
					}
				});
			}
		);
	}
);

router.get(
	"/dorm/:dorm_id/home/",
	middleware.isLoggedIn,
	middleware.checkDormOwnership,
	function (req, res) {
		var whereClause = "WHERE rooms.dorm_id = " + req.params.dorm_id;
		var whereClauseRating = "";
		switch (req.query.month) {
			case "All Months":
				whereClause = "WHERE rooms.dorm_id = " + req.params.dorm_id;
				break;
			case "January":
				whereClause =
					"WHERE MONTH(reservation_date) = 1 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "February":
				whereClause =
					"WHERE MONTH(reservation_date) = 2 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "March":
				whereClause =
					"WHERE MONTH(reservation_date) = 3 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "April":
				whereClause =
					"WHERE MONTH(reservation_date) = 4 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "May":
				whereClause =
					"WHERE MONTH(reservation_date) = 5 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "June":
				whereClause =
					"WHERE MONTH(reservation_date) = 6 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "July":
				whereClause =
					"WHERE MONTH(reservation_date) = 7 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "August":
				whereClause =
					"WHERE MONTH(reservation_date) = 8 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "September":
				whereClause =
					"WHERE MONTH(reservation_date) = 9 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "October":
				whereClause =
					"WHERE MONTH(reservation_date) = 10 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "November":
				whereClause =
					"WHERE MONTH(reservation_date) = 11 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
			case "December":
				whereClause =
					"WHERE MONTH(reservation_date) = 12 AND YEAR(CURDATE()) AND rooms.dorm_id = " +
					req.params.dorm_id;
				break;
		}

		switch (req.query.rating) {
			case "All Ratings":
				whereClauseRating = "";
				break;
			case "0 Star":
				whereClauseRating =
					"WHERE rating = 0 AND dorm_id = " + req.params.dorm_id;
				break;
			case "1 Star":
				whereClauseRating =
					"WHERE rating = 1 AND dorm_id = " + req.params.dorm_id;
				break;
			case "2 Stars":
				whereClauseRating =
					"WHERE rating = 2 AND dorm_id = " + req.params.dorm_id;
				break;
			case "3 Stars":
				whereClauseRating =
					"WHERE rating = 3 AND dorm_id = " + req.params.dorm_id;
				break;
			case "4 Stars":
				whereClauseRating =
					"WHERE rating = 4 AND dorm_id = " + req.params.dorm_id;
				break;
			case "5 Stars":
				whereClauseRating =
					"WHERE rating = 5 AND dorm_id = " + req.params.dorm_id;
				break;
		}

		Dorm.findOne({
			where: { dorm_id: req.params.dorm_id },
			include: [DormImage],
		}).then((foundedDorm) => {
			sequelize
				.query(
					"SELECT SUM(room_amount) as income FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE rooms.dorm_id = " +
						req.params.dorm_id +
						" GROUP BY room_slots.room_id",
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((incomeEveryRooms) => {
					Room.count({ where: { dorm_id: req.params.dorm_id } }).then(
						(roomCount) => {
							RoomSlot.count({
								where: { occupant_id: null },
								include: [
									{ model: Room, where: { dorm_id: req.params.dorm_id } },
								],
							}).then((availableSlots) => {
								sequelize
									.query(
										"SELECT COUNT(*) as reservationCount FROM reservations JOIN rooms ON reservations.room_id = rooms.room_id " +
											whereClause,
										{ type: sequelize.QueryTypes.SELECT }
									)
									.then((reservationCount) => {
										sequelize
											.query(
												"SELECT COUNT(*) as ratingCount FROM dorm_ratings " +
													whereClauseRating,
												{ type: sequelize.QueryTypes.SELECT }
											)
											.then((ratingCount) => {
												sequelize
													.query(
														"SELECT * FROM room_slots JOIN users ON room_slots.occupant_id = users.user_id JOIN rooms ON  room_slots.room_id = rooms.room_id JOIN profiles ON users.user_id = profiles.user_id WHERE rooms.dorm_id = " +
															req.params.dorm_id +
															" GROUP BY users.user_id",
														{ type: sequelize.QueryTypes.SELECT }
													)
													.then((foundedMembers) => {
														res.render("dorm/home/index", {
															dorm: foundedDorm,
															reservationupdates: numOfReservationUpdates,
															dorm_id: req.params.dorm_id,
															selected: "home",
															incomeEveryRooms: incomeEveryRooms,
															roomCount: roomCount,
															availableSlots: availableSlots,
															reservationCount: reservationCount,
															ratingCount: ratingCount,
															members: foundedMembers,
															month: req.query.month,
															rating: req.query.rating,
														});
														//res.send(foundedMembers);
													});
											});
									});
							});
						}
					);
				});
		});
	}
);

router.get(
	"/dorm/:dorm_id/reviews",
	middleware.checkDormOwnership,
	function (req, res) {
		var sort = "date_rated DESC";
		if (req.query.sort) {
			if (req.query.sort === "Most Recent") {
				var sort = "date_rated DESC";
			} else if (req.query.sort === "Oldest") {
				var sort = "date_rated ASC";
			} else if (req.query.sort === "Rating (Lowest-Highest)") {
				var sort = "rating ASC";
			} else if (req.query.sort === "Rating (Highest-Lowest)") {
				var sort = "rating DESC";
			}
		}
		DormRating.findAll({
			where: { dorm_id: req.params.dorm_id },
			include: [{ model: User, include: [Profile] }],
			order: sequelize.literal(sort),
		}).then((foundedRatings) => {
			Dorm.findOne({
				where: { dorm_id: req.params.dorm_id },
				include: [DormImage],
			}).then((foundedDorm) => {
				res.render("dorm/reviews/index", {
					dorm: foundedDorm,
					reservationupdates: numOfReservationUpdates,
					dorm_id: req.params.dorm_id,
					selected: "reviews",
					reviews: foundedRatings,
					selected: req.query.sort,
				});
			});
		});
	}
);

router.post(
	"/dorm/:dorm_id/verify",
	middleware.userIsAdmin,
	function (req, res) {
		Dorm.update(
			{ dorm_verified: "1" },
			{ where: { dorm_id: req.params.dorm_id } }
		).then((updatedDorm) => {
			Dorm.findOne({ where: { dorm_id: req.params.dorm_id } }).then(
				(foundedDorm) => {
					req.flash(
						"successheader",
						"You have verified the listing with the name of " +
							foundedDorm.dorm_name
					);
					res.redirect("back");
				}
			);
		});
	}
);

// TO BE REMOVED

// router.post("/dorm/:dorm_id/post/new", middleware.isLoggedIn, middleware.checkDormOwnership, function(req, res){
// 	if(req.body.post_content){
// 		Post.create({
// 			author_id: req.user.user_id,
// 			dorm_id: req.params.dorm_id,
// 			post_content: req.body.post_content
// 		}).then(createdPost => {
// 			res.redirect("/dorm/"+ req.params.dorm_id +"/home/?anchor=" + createdPost.post_id);
// 		});
// 	}else{
// 		req.flash("errorheader", "Post content is empty.");
// 		res.redirect("back");
// 	}
// });

// router.post("/dorm/:dorm_id/post/:post_id/comment/new", middleware.isLoggedIn, middleware.checkDormOwnership, function(req, res){
// 	if(req.body.comment_content){
// 		Comment.create({
// 			post_id: req.params.post_id,
// 			commenter_id: req.user.user_id,
// 			comment_content: req.body.comment_content
// 		}).then(createdComment => {
// 			res.redirect("/dorm/"+ req.params.dorm_id +"/home/?anchor=" + req.params.post_id);
// 		});
// 	}else{
// 		req.flash("errorheader", "Comment content is empty.");
// 		res.redirect("back");
// 	}
// });

// router.get("/dorm/:dorm_id/complaints/", middleware.isLoggedIn, middleware.checkDormOwnership, function(req, res){
// 	Complaint.findAll({where: {dorm_id: req.params.dorm_id}, include: [ {model: User, include: [ Profile ]}]}).then(foundedComplaints => {
// 		Dorm.findOne({where: {dorm_id: req.params.dorm_id}, include: [DormImage]}).then(foundedDorm => {
// 			res.render("dorm/complaints/index", {reservationupdates: numOfReservationUpdates, complaints: foundedComplaints, dorm: foundedDorm, dorm_id: req.params.dorm_id, selected: "complaints"});
// 		});
// 	});
// });

// router.post("/dorm/:dorm_id/complaints/new", middleware.isLoggedIn, middleware.checkDormOwnership, function(req, res){
// 	if(req.body.complaint){
// 		Complaint.create({
// 			complainant_id: req.user.user_id,
// 			dorm_id: req.params.dorm_id,
// 			issue: req.body.issue,
// 			complaint: req.body.complaint
// 		}).then(createdComplaint => {
// 			req.flash("successheader", "Complaint sent to owner.");
// 			res.redirect("back");
// 		});
// 	}else{
// 		req.flash("errorheader", "Please don't leave your complaint blank.");
// 		res.redirect("back");
// 	}
// });

router.get(
	"/dorm/:dorm_id/payment/",
	middleware.checkDormOwnership,
	function (req, res) {
		var order;
		if (req.query.sort) {
			if (req.query.sort === "Oldest") {
				order = sequelize.literal("date_paid Desc");
			} else {
				order = sequelize.literal("date_paid Asc");
			}
		} else {
			order = sequelize.literal("date_paid Desc");
		}

		Payment.findAll({
			where: { dorm_id: req.params.dorm_id },
			order: order,
			include: [{ model: User, include: [Profile] }],
		}).then((foundedPayments) => {
			Dorm.findOne({
				where: { dorm_id: req.params.dorm_id },
				include: [DormImage],
			}).then((foundedDorm) => {
				res.render("dorm/payments/index", {
					reservationupdates: numOfReservationUpdates,
					selected: "payments",
					payments: foundedPayments,
					dorm_id: req.params.dorm_id,
					selected: req.query.sort,
					dorm: foundedDorm,
				});
			});
		});
	}
);

router.get(
	"/dorm/:dorm_id/rooms",
	middleware.isLoggedIn,
	middleware.checkDormOwnership,
	function (req, res) {
		Room.findAll({
			where: { dorm_id: req.params.dorm_id },
			include: [
				{ model: RoomSlot, include: [{ model: User, include: [Profile] }] },
			],
		}).then((foundedRooms) => {
			Dorm.findOne({
				where: { dorm_id: req.params.dorm_id },
				include: [DormImage],
			}).then((foundedDorm) => {
				res.render("dorm/rooms/index", {
					reservationupdates: numOfReservationUpdates,
					rooms: foundedRooms,
					selected: "rooms",
					dorm_id: req.params.dorm_id,
					dorm: foundedDorm,
				});
				//res.send(foundedRooms);
			});
		});
		// sequelize.query("SELECT * FROM room_slots JOIN users ON room_slots.occupant_id = users.user_id JOIN rooms ON  room_slots.room_id = rooms.room_id JOIN profiles ON users.user_id = profiles.user_id WHERE rooms.dorm_id = " + req.params.dorm_id, { type: sequelize.QueryTypes.SELECT }).then(foundedMembers => {
		// 	User.findOne({include: [ {model: Dorm, where: {dorm_id: req.params.dorm_id}}, Profile ]}).then(foundedOwner =>{
		// 		Dorm.findOne({where: {dorm_id: req.params.dorm_id}, include: [DormImage]}).then(foundedDorm => {
		// 			res.render("dorm/members/index", {reservationupdates: numOfReservationUpdates, selected: "members", members: foundedMembers, owner: foundedOwner, dorm_id: req.params.dorm_id, dorm: foundedDorm});
		// 		});
		// 	});
		// });
	}
);

router.get(
	"/reservation/:user_id/updates",
	middleware.isLoggedIn,
	function (req, res, next) {
		if (req.user.user_type === "Dorm Owner") {
			Dorm.findAll({
				where: { owner_user_id: req.user.user_id },
				include: [Room],
			}).then((foundedDormitories) => {
				countReservations(foundedDormitories).then((results) => {
					if (results.length > 0) {
						numOfReservationUpdates = results.length;
						res.send(results);
					} else {
						numOfReservationUpdates = results.length;
						res.send("none");
					}
				});
			});
		} else {
			Reservation.count({
				where: {
					user_id: req.user.user_id,
					update_made: { [Op.or]: ["System Updates", "Owner Updates"] },
					tenant_viewed: "0",
				},
				group: "room_id",
			}).then((countedReservationUpdate) => {
				if (countedReservationUpdate.length > 0) {
					res.send(countedReservationUpdate);
				} else {
					res.send("none");
				}
			});
		}
	}
);

router.post(
	"/dorm/:dorm_id/vacateroom/:room_id",
	middleware.checkDormOwnership,
	function (req, res) {
		RoomSlot.update(
			{ occupant_id: null },
			{ where: { room_id: req.params.room_id } }
		).then((results) => {
			req.flash("successheader", "Successfully vacate the selected room.");
			res.redirect("back");
		});
	}
);

async function updateReservations(rooms) {
	var whereClause = "";
	var i = 1;
	for (let room of rooms) {
		if (i == rooms.length) {
			whereClause += "'" + room.room_id + "'";
		} else {
			whereClause += "'" + room.room_id + "',";
		}
		i++;
	}
	sequelize
		.query(
			"UPDATE reservations set owner_viewed = '1' where room_id IN (" +
				whereClause +
				")"
		)
		.spread((results, metadata) => {});
}

async function getDormitoryInformation(dorms) {
	var dormLists = [];
	for (let dorm of dorms) {
		try {
			await Reservation.findAll({
				include: [{ model: Room, where: { dorm_id: dorm.dorm_id } }],
			}).then((foundedReservation) => {
				dorm.reservations = foundedReservation;
			});
			await Reservation.count({
				include: [{ model: Room, where: { dorm_id: dorm.dorm_id } }],
			}).then((countedReservation) => {
				dorm.reservationscount = countedReservation;
			});
			await Reservation.count({
				include: [{ model: Room, where: { dorm_id: dorm.dorm_id } }],
				where: { update_made: "Tenant Updates", owner_viewed: "0" },
			}).then((countedReservation) => {
				dorm.newreservation = countedReservation;
			});
			await sequelize
				.query(
					"SELECT COUNT(*) as slots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE room_slots.occupant_id is null and rooms.dorm_id = " +
						dorm.dorm_id,
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((slots) => {
					dorm.remainingslots = slots;
				});
			await sequelize
				.query(
					"SELECT COUNT(*) as allslots FROM rooms JOIN room_slots ON rooms.room_id = room_slots.room_id WHERE rooms.dorm_id = " +
						dorm.dorm_id,
					{ type: sequelize.QueryTypes.SELECT }
				)
				.then((availableslots) => {
					dorm.allslots = availableslots;
				});
		} catch (e) {
			console.log(e);
		}
		dormLists.push(dorm);
	}
	return dormLists;
}

async function countReservations(foundedDormitories) {
	var count = [];
	for (let dorm of foundedDormitories) {
		for (let room of dorm.rooms) {
			try {
				await Reservation.count({
					where: {
						room_id: room.room_id,
						update_made: { [Op.or]: ["System Updates", "Tenant Updates"] },
						owner_viewed: "0",
					},
				}).then((countedReservationUpdate) => {
					if (countedReservationUpdate > 0) {
						count.push(countedReservationUpdate);
					}
				});
			} catch (e) {
				console.log(e);
			}
		}
	}
	return count;
}

function payOwner(
	amount,
	owner_id,
	payer_name,
	payer_email,
	payer_id,
	dorm_id,
	reservation_id,
	dorm_name,
	req,
	res,
	id
) {
	var sender_batch_id = Math.random().toString(36).substring(9);
	User.findOne({ where: { user_id: owner_id } }).then((foundUser) => {
		var create_payout_json = {
			sender_batch_header: {
				sender_batch_id: sender_batch_id,
				email_subject: "A tenant paid their reservation for your dormitory",
			},
			items: [
				{
					recipient_type: "EMAIL",
					amount: {
						value: Math.round(amount - amount * 0.1),
						currency: "PHP",
					},
					receiver: foundUser.username,
					note:
						payer_name +
						"with an email of " +
						payer_email +
						" paid their first month rent and advance payment for your dormitory",
				},
			],
		};

		paypal.payout.create(create_payout_json, function (error, payout) {
			if (error) {
				console.log(error.response);
				throw error;
			} else {
				console.log(payout);
				paypal.payout.get(
					payout.batch_header.payout_batch_id,
					function (error, payout) {
						if (error) {
							throw error;
						} else {
							Payment.create({
								payer_id: payer_id,
								dorm_id: dorm_id,
								amount: payout.batch_header.amount.value,
								reservation_id: reservation_id,
								payment_id_paypal: id,
							}).then((createdPayment) => {});
							req.flash(
								"successheader",
								"You have successfully reserved in " +
									dorm_name +
									", please check your paypal account for the transaction made."
							);
							res.redirect("/dorm/");
						}
					}
				);
			}
		});
	});
}

module.exports = router;
