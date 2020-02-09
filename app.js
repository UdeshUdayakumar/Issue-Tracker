require("dotenv").config(); // dotenv package -> to add an environment variable (Google Maps APT Key here)

var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    flash               = require("connect-flash"),
    expressSanitizer    = require("express-sanitizer"),
    localStratergy      = require("passport-local"),
    methodOverride      = require("method-override"),
    User                = require("./models/user");

var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

mongoose.connect("mongodb://localhost/issue_tracker");
app.use(bodyParser.urlencoded({extended: true})); // using the body-parser
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(expressSanitizer());

// ---------- MOMENT JS --------
app.locals.moment = require('moment');

// -------------- PASSPORT CONFIGURATION -------------------

app.use(require("express-session")({
    secret: "keyboard cat", // Secret Key for the session
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// Responsible for:-
// reading the session, taking the data from the session which is encoded and unencoding it. -> DeserialiseUser
// then, encoding it, serializing it, and putting it back to the session. -> SerializeUser
passport.use(new localStratergy(User.authenticate())); // coming from passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --------------------------------------------------------

// This function adds the currentUser value to all the templates
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next(); // proceed to next ROUTE
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, function() {
    console.log("Issue Tracker Started Working...");
});