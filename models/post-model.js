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

var Post = sequelize.define(
	"post",
	{
		post_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		author_id: Sequelize.INTEGER,
		dorm_id: Sequelize.INTEGER,
		post_content: Sequelize.TEXT,
		date_posted: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
	},
	{
		timestamps: false,
	}
);

module.exports = Post;
