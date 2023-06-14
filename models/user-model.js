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

var passportLocal = require("passport-local-sequelize");

sequelize.authenticate();

var User = sequelize.define(
	"user",
	{
		user_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		username: Sequelize.TEXT,
		hash: Sequelize.TEXT,
		salt: Sequelize.TEXT,
		user_type: Sequelize.TEXT,
		oldpassword: Sequelize.TEXT,
		photo: Sequelize.STRING(70),
	},
	{
		timestamps: false,
	}
);

passportLocal.attachToUser(User, {
	usernameField: "username",
	hashField: "hash",
	saltField: "salt",
	resetPasswordKeyField: "oldpassword",
});

module.exports = User;
