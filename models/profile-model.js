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

var Profile = sequelize.define(
	"profile",
	{
		profile_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: Sequelize.INTEGER,
		first_name: Sequelize.STRING(30),
		last_name: Sequelize.TEXT,
		birth_month: Sequelize.STRING(30),
		birth_day: Sequelize.INTEGER,
		birth_year: Sequelize.INTEGER,
		gender: Sequelize.STRING(30),
		contact: {
			allowNull: true,
			type: Sequelize.STRING(14),
		},
		self_description: {
			allowNull: true,
			type: Sequelize.TEXT,
		},
	},
	{
		timestamps: false,
	}
);

module.exports = Profile;
