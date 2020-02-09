var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    User        = require("../models/user"),
    Campground  = require("../models/campground"),
    async       = require("async"),
    nodemailer  = require("nodemailer"),
    crypto      = require("crypto");

router.get("/", function(req,res) {
    res.render("landing");
});

// ----- SIGN UP ROUTES -----

// render sign up page
router.get("/register", function(req,res) {
    res.render("register", {page: "register"}); // Tell nav-bar that sign-up page is currently active
});
//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        }
    );
    // eval(require('locus'));
    if(req.body.adminCode === "secretcode123") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){ // Stores password as an Encrypted key-value pair
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        req.flash("success", "You are successfully registered, please log in");
        res.redirect("/login");
    });
});

// ----- LOGIN ROUTES -----

// render login page
router.get("/login", function(req,res) {
    res.render("login", { page: "login" }); // Tell nav-bar that login page is currently active
});
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
        req.flash("error", info.message); // Give the user a flash message for an incorrect login
        return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/campgrounds';
      delete req.session.redirectTo;
      req.flash("success", "You are now logged in");
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// ---- LOGOUT ROUTE -----

router.get("/logout", function(req,res) {
    req.logout(); // Delete all user data in the current session
    req.flash("success", "Successfully logged out");
    res.redirect("/login");
});

// ----- UPDATE : FINAL VERSION ----------
// Forgot Password
router.get("/forgot", function(req,res) {
    res.render("forgot");
});
router.post("/forgot", function(req,res,next) {
    async.waterfall([ // An array of functions that get called one after another
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex'); // token that gets created here is the token that is going to be send to the user's email address as a part of the URL and expires after an hour
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if(err) {
                    console.log(err);
                    req.flash("error","Sorry, en error occurred");
                    return res.redirect("/forgot");
                }
                if(!user) { // If no user is found with that email address
                    req.flash("error","No account with that email address exists.");
                    return res.redirect("/forgot");
                }
                // set the password token and expiration for the user
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // For 1 hour
                
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) { // This function sends the email
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: "sreeharims2000@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "sreeharims2000@gmail.com",
                subject: "Issue Tracker | Password Reset",
                text: "You are receiving this because you requested for Password reset of your Issue Tracker account\n"+
                    "\nPlease click on the following link or paste this in your browser to complete the process of resetting your password\n\n"+
                    "https://" + req.headers.host + "/reset/" + token + "\n\nThis token is valid for 1 hour.\n\n\n"+
                    "If you did not requested for Password reset please ignore this email."
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log("Mail sent to "+user.email);
                req.flash("success", "An email has been sent to "+user.email+" with further instructions.");
                done(err,"done");
            });
        }
    ], function(err) {
        if(err) return next(err);
        res.redirect("/forgot");
    });
});
// Reset Password
router.get("/reset/:token", function(req,res) {
    User.findOne( {resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) { // $gt stands for greater than
        if(err) {
            console.log(err);
            req.flash("error", "Sorry, an error occurred.");
            return res.redirect("/forgot");
        }
        if(!user) {
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot");
        }
        res.render("reset", { token: req.params.token });
    });
});
router.post("/reset/:token", function(req,res) {
    async.waterfall([
        function(done) {
            User.findOne( {resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) { // $gt stands for greater than
                if(err) {
                    console.log(err);
                    req.flash("error", "Sorry, an error occurred.");
                    return res.redirect("/forgot");
                }
                if(!user) {
                    req.flash("error", "Password reset token is invalid or has expired.");
                    return res.redirect("/forgot");
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) { // setPassword method is coming from passport-local-mongoose which will encrypt the password (hash-salt pair)
                    
                        if(err) {
                            console.log(err);
                            req.flash("error","Sorry, an error occurred");
                            return res.redirect("/forgot");
                        }
                        
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        
                        user.save(function(err) { // Update the user to the database
                            if(err) {
                                console.log(err);
                                req.flash("error", "Sorry, an error occurred.");
                                return res.redirect("/forgot");
                            }
                            req.logIn(user, function(err) { // log the user in after password is updated
                                done(err,user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect("back");
                }
            });
        },
        function(user,done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: "sreeharims2000@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "sreeharims2000",
                subject: "Issue Tracker | Password Reset Confirmation",
                text: "Hello,\n\nThis is a confirmation mail that the password for your account " + user.email + " has just been updated."
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log("Confirmation mail sent");
                req.flash("success", "Success! Your password has been updated successfully.");
                done(err);
            });
        }
    ], function(err){
        if(err) {
            console.log(err);
            req.flash("error", "Sorry, an error occurred.");
            return res.redirect("/forgot");
        }
        res.redirect("/campgrounds");
    });
});

// ----- UPDATE : FINAL VERSION ----------
// Add User Profile Route

router.get("/users/:user_id", function(req, res) {
    User.findById(req.params.user_id, function(err, foundUser) {
        if(err) {
            req.flash("error", "Something went wrong");
            return res.redirect("back");
        } else {
            // Find out the campgrounds (if any) that this user has created
            Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    return res.redirect("back");
                }
                res.render("users/show", { user: foundUser, campgrounds: campgrounds});
            });
        }
    })
});

module.exports = router;