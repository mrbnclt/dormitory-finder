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

var DormDocument = sequelize.define(
	"dorm_document",
	{
		dorm_document_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		dorm_id: Sequelize.INTEGER,
		caption: Sequelize.TEXT,
		image: Sequelize.TEXT,
	},
	{
		timestamps: false,
	}
);

module.exports = DormDocument;
