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

var Payment = sequelize.define(
	"payment",
	{
		payment_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		payer_id: Sequelize.INTEGER,
		dorm_id: Sequelize.INTEGER,
		reservation_id: Sequelize.INTEGER,
		amount: Sequelize.FLOAT,
		date_paid: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
		payment_id_paypal: Sequelize.STRING(255),
	},
	{
		timestamps: false,
	}
);

module.exports = Payment;
