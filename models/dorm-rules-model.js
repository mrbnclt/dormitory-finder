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

var DormRules = sequelize.define(
	"dorm_rule",
	{
		rules_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		dorm_smoking: Sequelize.STRING(10),
		dorm_pets: Sequelize.STRING(10),
		dorm_parties: Sequelize.STRING(10),
		dorm_more_rules: Sequelize.TEXT,
	},
	{
		timestamps: false,
	}
);

module.exports = DormRules;
