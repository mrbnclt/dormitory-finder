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

var Comment = sequelize.define(
	"comment",
	{
		comment_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		post_id: Sequelize.INTEGER,
		commenter_id: Sequelize.INTEGER,
		comment_content: Sequelize.TEXT,
		date_commented: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
	},
	{
		timestamps: false,
	}
);

module.exports = Comment;
