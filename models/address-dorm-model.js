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

var DormAddress = sequelize.define(
	"address_dorm",
	{
		dorm_address_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		dorm_unit: Sequelize.TEXT,
		dorm_complete_loc: Sequelize.TEXT,
		dorm_street: Sequelize.TEXT,
		dorm_city: Sequelize.TEXT,
		dorm_region: Sequelize.TEXT,
		dorm_long: Sequelize.FLOAT,
		dorm_lat: Sequelize.FLOAT,
	},
	{
		timestamps: false,
	}
);

module.exports = DormAddress;
