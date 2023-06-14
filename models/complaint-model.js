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

var Complaint = sequelize.define(
	"complaint",
	{
		complaint_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		complainant_id: Sequelize.INTEGER,
		dorm_id: Sequelize.INTEGER,
		issue: Sequelize.STRING(255),
		complaint: Sequelize.TEXT,
		date_complained: {
			type: Sequelize.DATEONLY,
			defaultValue: Sequelize.NOW,
		},
	},
	{
		timestamps: false,
	}
);

module.exports = Complaint;
