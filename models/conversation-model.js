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

var Conversation = sequelize.define(
	"conversation",
	{
		conversation_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		dorm_id: Sequelize.INTEGER,
		owner_id: Sequelize.INTEGER,
		inquirer_id: Sequelize.INTEGER,
	},
	{
		timestamps: false,
	}
);

module.exports = Conversation;
