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

var Message = sequelize.define(
	"message",
	{
		message_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		conversation_id: Sequelize.INTEGER,
		from_user_id: Sequelize.INTEGER,
		to_user_id: Sequelize.INTEGER,
		message: Sequelize.TEXT,
		date_sent: {
			type: Sequelize.DATEONLY,
			defaultValue: Sequelize.NOW,
		},
		opened: {
			type: Sequelize.ENUM("0", "1"),
			defaultValue: "0",
		},
	},
	{
		timestamps: false,
	}
);

module.exports = Message;
