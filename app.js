var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	flash = require("connect-flash"),
	User = require("./models/user-model");

var indexRoute = require("./routes/index-route"),
	profileRoute = require("./routes/profile-route"),
	listingRoute = require("./routes/listing-route"),
	dormitoryRoute = require("./routes/dormitory-route"),
	searchRoute = require("./routes/search-route"),
	messageRoute = require("./routes/message-route");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(
	require("express-session")({
		secret: "super",
		resave: false,
		saveUninitialized: false,
		cookie: { _expires: 180 * 60 * 1000 },
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.errorheader = req.flash("errorheader");
	res.locals.successheader = req.flash("successheader");
	next();
});

app.use(indexRoute);
app.use(profileRoute);
app.use(listingRoute);
app.use(dormitoryRoute);
app.use(searchRoute);
app.use(messageRoute);

app.listen(3000, function () {
	console.log("Server is Listening on PORT: 3000");
});
