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

var RoomSlot = sequelize.define(
	"room_slot",
	{
		room_slot_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		room_id: Sequelize.INTEGER,
		occupant_id: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
	},
	{
		timestamps: false,
	}
);

module.exports = RoomSlot;
