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

var DormRating = sequelize.define(
	"dorm_rating",
	{
		dorm_rating_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: Sequelize.INTEGER,
		dorm_id: Sequelize.INTEGER,
		rating: Sequelize.INTEGER,
		comment: Sequelize.TEXT,
		date_rated: {
			type: Sequelize.DATEONLY,
			defaultValue: Sequelize.NOW,
		},
	},
	{
		timestamps: false,
	}
);

module.exports = DormRating;
