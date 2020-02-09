var express     = require("express"),
    router      = express.Router({ mergeParams: true}), // mergeParms object will merge /:id route so that id is accessible.
    Comment     = require("../models/comment"),
    Campground  = require("../models/campground"),
    middleware  = require("../middleware");

// render new comment page
router.get("/new", middleware.isLoggedIn, function(req,res) { // isLoggedIn functionality added so, UNAUTHORIZED users can not add a comment
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("/campgrounds/"+foundCampground._id);
        } else {
            req.flash("success", "You are now logged in, please add your comment.");
            res.redirect("/campgrounds/"+foundCampground._id);
        }
    });
});

// Add this comment to DB and associate it with the Campground
router.post("/", middleware.isLoggedIn, function(req,res) { // isLoggedIn functionality added to Prevent someone from accessing the POST route
    Campground.findById(req.params.id, function(err,foundCampground) {
        if(err) {
            console.log(err);
            req.flash("error","Error occurred");
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err,comment) {
                if(err) {
                    console.log(err);
                    req.flash("error", err.message);
                    res.redirect("/campgrounds/" + foundCampground._id);
                } else {
                    // ------ UPDATE IN V8 -------
                    // add username and id to the comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + foundCampground._id); // Redirecting back to the SHOW Route
                }
            });
        }
    });
});

// UPDATE COMMENT ROUTE
router.put("/:comment_id", middleware.isLoggedIn, middleware.checkCommentOwnership, function(req,res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err) {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("success", "Successfully updated comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DELETE COMMENT ROUTE
router.delete("/:comment_id", middleware.isLoggedIn, middleware.checkCommentOwnership, function(req,res) {
    var commentId = req.params.comment_id;
    Comment.findByIdAndRemove(commentId, function(err) {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            Campground.findById(req.params.id, function(err, foundCampground) {
                var index = foundCampground.comments.indexOf(commentId); // Find the index location of the deleted comment using the ID value
                foundCampground.comments.splice(index,1); // Delete that ID from the Campground's comment array
                foundCampground.save(); // Save this state of the Database
            });

            req.flash("success", "Successfully deleted comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;