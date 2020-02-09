# YelpCamp

**YelpCamp** is a web application built using NodeJS, ExpressJS, RESTFUL Routes, Embedded JavaScript (EJS) with a few more frameworks and middle-wares used as the application is developed. This application is a clone of [Yelp](https://www.yelp.com/), a US based, popular social networking site, that focuses on reviewing businesses and sharing information about them.

It is made while pursuing [The Web Developer Bootcamp](https://www.udemy.com/the-web-developer-bootcamp/) course on [Udemy](https://www.udemy.com/).

### Course Instructor: [Colt Steele](https://www.linkedin.com/in/coltsteele/)

## Description

### Frameworks & Middlewares

* **[ExpressJS](https://expressjs.com/)** is used for Server Side Routing applications.
* **[MongooseJS](http://mongoosejs.com/)** is used for Back-End Database operations with MongoDB NoSQL Database.
* **[Body-Parser](https://github.com/expressjs/body-parser/)** is used to parse the data that was received as a result of HTTP POST request.
* **[Express.Static()](https://expressjs.com/en/starter/static-files.html)** is used to serve the Static files CSS, JS, etc. in the directory as specified.
* **[Embedded JavaScript]()** is used to embed the JavaScript within the HTML tags to implement the logic.
* **[PassportJS](www.passportjs.org/)** is used to provide user authentication to the application.
* **Sanitizer** to sanitize the values of the HTML input that arrives as a result of POST request.
* Used **module.exports** to refactor the app.js file into multiple sub-files.
* Some other self-defined middlewares to improve the application such as:
	* to prevent unauthorised access to POST routes.
	* to check whether a user has logged in or not.
* Added **Google Maps location** for a Campground.
* Applied **dotenv** to keep the Google API key safe and hidden.
* Added **Time created since** using **MomentJS**.
* Added **Image upload** for a Campground using [Cloudinary](https://cloudinary.com), a cloud service for hosting images.
* Used **nodemailer** to have a Reset Password functionality if a User forgets his/her password.
* Used **req.originalUrl** and saved it to **req.session.redirectTo** to redirect back to the previous URL after successful authentication.

### RESTFUL Routes

Application of REpresentational State Transfer (REST)

#### Campground Routes

| Name    | Path                    | HTTP Verb | Purpose                                                 | Mongoose Method                |
| ------- | ----------------------- | --------- | ------------------------------------------------------- | ------------------------------ |
| Index   | `/campgrounds`          | GET       | List all campgrounds                                    | Campground.find()              |
| New     | `/campgrounds/new`      | GET       | Show a form to add a new campground                     | N/A                            |
| Create  | `/campgrounds`          | POST      | Create a new campground, then redirect somewhere        | Campground.create()            |
| Show    | `/campgrounds/:id`      | GET       | Show info about one specific campground                 | Campground.findById()          |
| Edit    | `/campgrounds/:id/edit` | GET       | Show edit form for one campground                       | Campground.findById()          |
| Update  | `/campgrounds/:id`      | PUT       | Update a particular campground, then redirect somewhere | Campground.findByIdAndUpdate() |
| Destroy | `/campgrounds/:id`      | DELETE    | Delete a particular campground, then redirect somewhere | Campground.findByIdAndRemove() |

#### Comment Routes

| Name    | Path                                         | HTTP Verb | Purpose                                                 | Mongoose Method             |
| ------- | -------------------------------------------- | --------- | ------------------------------------------------------- | --------------------------- |
| New     | `/campgrounds/:id/comments/new`              | GET       | Show a form to add a new comment                        | N/A                         |
| Create  | `/campgrounds/:id/comments/`                 | POST      | Create a new comment, then redirect somewhere           | Comment.create()            |
| Edit    | `/campgrounds/:id/comments/:comment_id/edit` | GET       | Show edit form for one comment                          | Comment.findById()          |
| Update  | `/campgrounds/:id/comments/:comment_id`      | PUT       | Update a particular comment, then redirect somewhere    | Comment.findByIdAndUpdate() |
| Delete  | `/campgrounds/:id/comments/:comment_id`      | DELETE    | Delete a particular comment, then redirect somewhere    | Comment.findByIdAndRemove() |

### NOTE:

The application is hosted on [Cloud9 IDE](https://aws.amazon.com/cloud9/), an open-source Cloud Service provided by Amazon Web Services (AWS) for developing web applications.Issue Tracker
