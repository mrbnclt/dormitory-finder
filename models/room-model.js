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

sequelize.authenticate();

var Dorm = require("../models/dorm-model");

var Room = sequelize.define(
	"room",
	{
		room_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		dorm_id: Sequelize.INTEGER,
		room_amount: Sequelize.FLOAT,
		slots: Sequelize.STRING(30),
		queensize: Sequelize.INTEGER,
		singlebed: Sequelize.INTEGER,
		sofabed: Sequelize.INTEGER,
		doubledecker: Sequelize.INTEGER,
		room_description: Sequelize.TEXT,
		room_utility: Sequelize.STRING(30),
		room_count: Sequelize.INTEGER,
		room_gender: Sequelize.STRING(255),
	},
	{
		timestamps: false,
	}
);

module.exports = Room;
