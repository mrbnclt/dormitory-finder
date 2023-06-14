var express = require("express");
var router = express.Router();
var Profile = require("../models/profile-model"),
	User = require("../models/user-model"),
	Message = require("../models/message-model"),
	Conversation = require("../models/conversation-model"),
	Dorm = require("../models/dorm-model"),
	DormImages = require("../models/dorm-images-model"),
	DormAddress = require("../models/address-dorm-model");
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

User.hasOne(Profile, { foreignKey: "user_id" });
Dorm.hasMany(DormImages, { foreignKey: "dorm_id" });
Conversation.hasMany(Message, { foreignKey: "conversation_id" });
Dorm.belongsTo(DormAddress, { foreignKey: "dorm_address_id" });

router.get("/message", middleware.isLoggedIn, function (req, res) {
	Conversation.findAll({
		where: {
			[Op.or]: { owner_id: req.user.user_id, inquirer_id: req.user.user_id },
		},
		include: [Message],
		order: sequelize.literal("date_sent DESC"),
	}).then((foundedConversationResult) => {
		getConversationData(foundedConversationResult, req.user).then(
			(conversationDataResults) => {
				res.render("messages/index", {
					conversations: conversationDataResults,
				});
			}
		);
	});
});

router.get(
	"/message/new",
	middleware.isLoggedIn,
	middleware.checkIfUserIsTenantType,
	function (req, res) {
		Conversation.count({
			where: { dorm_id: req.query.dorm_id, inquirer_id: req.user.user_id },
		}).then((countResults) => {
			if (countResults > 0) {
				Conversation.findOne({
					where: { dorm_id: req.query.dorm_id, inquirer_id: req.user.user_id },
				}).then((conversationResult) => {
					res.redirect("/message/" + conversationResult.conversation_id);
				});
			} else {
				Dorm.findOne({
					where: { dorm_id: req.query.dorm_id },
					include: [DormImages],
				}).then((dormResults) => {
					User.findOne({
						where: { user_id: dormResults.owner_user_id },
						include: [Profile],
					}).then((userResults) => {
						res.render("messages/new", {
							userInfo: userResults,
							dormInfo: dormResults,
						});
					});
				});
			}
		});
	}
);

router.post(
	"/message/new",
	middleware.isLoggedIn,
	middleware.checkIfUserIsTenantType,
	function (req, res) {
		Conversation.create({
			dorm_id: req.body.dorm_id,
			owner_id: req.body.to_id,
			inquirer_id: req.body.from_id,
		}).then((convoCreateResult) => {
			Message.create({
				conversation_id: convoCreateResult.conversation_id,
				from_user_id: req.body.from_id,
				to_user_id: req.body.to_id,
				message: req.body.message,
			}).then((messageCreateResult) => {
				res.redirect("/message/" + convoCreateResult.conversation_id);
			});
		});
	}
);

router.get(
	"/message/:conversation_id/",
	middleware.isLoggedIn,
	middleware.convoPermission,
	function (req, res) {
		Conversation.find({
			where: { conversation_id: req.params.conversation_id },
			include: [Message],
			order: sequelize.literal("date_sent ASC"),
		}).then((conversationResult) => {
			getMessageData(
				conversationResult.owner_id,
				conversationResult.inquirer_id,
				conversationResult.dorm_id
			).then((infoResults) => {
				var otherUserID;
				if (conversationResult.inquirer_id === req.user.user_id) {
					otherUserID = infoResults.owner;
				} else {
					otherUserID = infoResults.inquirer;
				}
				res.render("messages/show", {
					convo: conversationResult,
					info: infoResults,
					otherUser: otherUserID,
				});
			});
		});
	}
);

router.get(
	"/message/:conversation_id/new",
	middleware.isLoggedIn,
	middleware.convoPermission,
	function (req, res) {
		Message.findAll({
			where: {
				conversation_id: req.params.conversation_id,
				to_user_id: req.query.to_user,
				opened: "0",
			},
			order: sequelize.literal("date_sent ASC"),
		})
			.then((foundedMessages) => {
				foundedMessages.forEach(function (message) {
					Message.update(
						{ opened: "1" },
						{ where: { message_id: message.message_id } }
					);
				});
				res.send(foundedMessages);
			})
			.catch((err) => {
				res.send("failed");
			});
	}
);

router.get(
	"/message/:user_id/count",
	middleware.isLoggedIn,
	function (req, res) {
		Message.count({
			where: { to_user_id: req.params.user_id, opened: "0" },
			group: "conversation_id",
		}).then((countedMessageResults) => {
			if (countedMessageResults.length > 0) {
				res.send(countedMessageResults);
			} else {
				res.send("none");
			}
		});
	}
);

router.post(
	"/message/:conversation_id/new",
	middleware.isLoggedIn,
	middleware.convoPermission,
	function (req, res) {
		Message.create({
			conversation_id: req.params.conversation_id,
			from_user_id: req.body.from_user,
			to_user_id: req.body.to_user,
			message: req.body.message,
		})
			.then((createdMessage) => {
				res.send(createdMessage);
			})
			.catch((err) => {
				console.log("failed");
			});
	}
);

async function getConversationData(conversation, currentUser) {
	let convoLists = [];
	for (let convo of conversation) {
		var otherUserID;
		if (convo.owner_id === currentUser.user_id) {
			otherUserID = convo.inquirer_id;
		} else {
			otherUserID = convo.owner_id;
		}
		try {
			await Dorm.find({
				where: { dorm_id: convo.dorm_id },
				include: [DormImages, DormAddress],
			}).then((dormResults) => {
				convo.dorm = dormResults;
			});
			await User.find({
				where: { user_id: otherUserID },
				include: [Profile],
			}).then((otherUserResults) => {
				convo.otherUser = otherUserResults;
			});
		} catch (e) {
			console.log(e);
		}
		convoLists.push(convo);
	}
	return convoLists;
}

async function getMessageData(owner_id, inquirer_id, dorm_id) {
	var info = {};
	try {
		await Dorm.find({
			where: { dorm_id: dorm_id },
			include: [DormImages, DormAddress],
		}).then((dormResults) => {
			info.dorm = dormResults;
		});
		await User.find({ where: { user_id: owner_id }, include: [Profile] }).then(
			(ownerResults) => {
				info.owner = ownerResults;
			}
		);
		await User.find({
			where: { user_id: inquirer_id },
			include: [Profile],
		}).then((inquirerResults) => {
			info.inquirer = inquirerResults;
		});
	} catch (e) {
		return "error";
	}
	return info;
}

module.exports = router;
