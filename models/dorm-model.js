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

var Dorm = sequelize.define(
	"dorm",
	{
		dorm_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		owner_user_id: Sequelize.INTEGER,
		rules_id: Sequelize.INTEGER,
		amenities_id: Sequelize.INTEGER,
		dorm_type: Sequelize.STRING(255),
		dorm_address_id: Sequelize.INTEGER,
		dorm_name: Sequelize.STRING(255),
		dorm_bathroom: Sequelize.INTEGER,
		dorm_storey: Sequelize.STRING(20),
		dorm_gender: Sequelize.STRING(30),
		dorm_summary: Sequelize.TEXT,
		dorm_about: Sequelize.TEXT,
		dorm_access: Sequelize.TEXT,
		dorm_advance_payment: Sequelize.INTEGER,
		dorm_deposit: Sequelize.FLOAT,
		dorm_note: {
			allowNull: true,
			type: Sequelize.TEXT,
		},
		dorm_about_neigh: {
			allowNull: true,
			type: Sequelize.TEXT,
		},
		dorm_how_neigh: {
			allowNull: true,
			type: Sequelize.TEXT,
		},
		dorm_listed_at: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
		dorm_verified: {
			type: Sequelize.ENUM("0", "1"),
			defaultValue: "0",
		},
	},
	{
		timestamps: false,
	}
);

module.exports = Dorm;
