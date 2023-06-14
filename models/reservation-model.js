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

var Reservation = sequelize.define(
	"reservation",
	{
		reservation_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: Sequelize.INTEGER,
		room_id: Sequelize.INTEGER,
		status: Sequelize.STRING(50),
		reservation_date: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
		move_in_date: Sequelize.DATE,
		slots_reserved: Sequelize.INTEGER,
		owner_viewed: {
			type: Sequelize.ENUM("0", "1"),
			defaultValue: "0",
		},
		tenant_viewed: {
			type: Sequelize.ENUM("0", "1"),
			defaultValue: "0",
		},
		update_made: Sequelize.STRING(255),
	},
	{
		timestamps: false,
	}
);

module.exports = Reservation;
