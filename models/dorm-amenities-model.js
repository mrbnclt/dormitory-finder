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

var DormAmenities = sequelize.define(
	"dorm_amenities",
	{
		amenities_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		dorm_wifi: Sequelize.STRING(10),
		dorm_tv: Sequelize.STRING(10),
		dorm_closetdrawers: Sequelize.STRING(10),
		dorm_aircon: Sequelize.STRING(10),
		dorm_iron: Sequelize.STRING(10),
		dorm_fireext: Sequelize.STRING(10),
		dorm_cctv: Sequelize.STRING(10),
		dorm_kitchen: Sequelize.STRING(10),
		dorm_washingmachine: Sequelize.STRING(10),
		dorm_more_amenities: Sequelize.TEXT,
	},
	{
		timestamps: false,
	}
);

module.exports = DormAmenities;
