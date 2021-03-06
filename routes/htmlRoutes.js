var express = require("express");
var router = express.Router();

var db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app){


  app.get("/", function(req, res){
    
      db.Dish.findAll({
        include: [db.Meal]
      }).then(function(dbDish){
        console.log(req.query.search);

        var hbsObject = {
          Dish: dbDish,
          allTabisActive: true,
          searchTerm: req.query.search
        };

        res.render("index", hbsObject);       
       
      });
    
  });

  app.get("/search", function(req, res){

    console.log(req.query.search);
    //if user entered search term
        if(req.query.search){
          db.Dish.findAll({
            where: {
              $or: [
                  {
                      dish_name: 
                      {
                          $eq: req.query.search
                      }
                  }, 
                  {
                      restaurant: 
                      {
                          $eq: req.query.search
                      }
                  }
              ]
            },
            include: [db.Meal]
          }).then(function(dbSearchDish){
           
              var hbsObject = {
                Dish: dbSearchDish,
                allTabisActive: true,
                searchTerm: req.query.search
              };

              res.render("index", hbsObject);     
            

          });
        }else{
          res.redirect("/");
        }
        
  });

	app.get("/featured", function(req, res){

      db.Dish.findAll({
        order: [
          ["rating", "DESC"]
        ],
        include: [db.Meal]
      }).then(function(dbDish){
    		var hbsObject = {
          Dish: dbDish,
    			featuredTabisActive: true
    			//searchTerm: req.query.search
    		};
    		res.render("index", hbsObject);
      });
    
	});

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the login page

  app.get("/saved",isAuthenticated, function(req, res){
    console.log("req.user.id: ");
    console.log(req.user.id);
    db.Meal.findAll({
        where: {
            UserId: req.user.id
          },
          include: [db.Dish]
    }).then(function(dbMeal){
        // for(var i = 0; i < dbMeal.length; i++){
        //   console.log("dbMeal "+i);
        //   console.log(dbMeal[i]);
        // }
        var hbsObject = {
          Meal: dbMeal,
          savedTabIsActive: true
        };
        console.log("Saved tab is active:");
        console.log(hbsObject.savedTabIsActive);
        res.render("index", hbsObject);
    });
    
  });

	// When user clicks on the Sign up link, render the signup handlebars and override the default layout to use useraccount.hbs
	app.get("/signup", function(req,res){

		var hbsObject = {
			title: "Sign Up - Magic Prawns",
			layout: "useraccount"
		};

		res.render("signup", hbsObject);
	});

	// When user clicks on the Login link, render the login handlebars and override the default layout to use useraccount.hbs
	app.get("/login", function(req,res){

		var hbsObject = {
			title: "Login - Magic Prawns",
			layout: "useraccount"
		};

		res.render("login", hbsObject);
	});

	app.get("/testdish/:dishName/:rating", function(req, res) {
    	db.Dish.create({
    		dish_name: req.params.dishName,
    	 	restaurant: "test restaurant",
    	 	rating: req.params.rating,
    	 	zip_code: 27516,
    	 	cuisine: "test cuisine"
    	}).then(function(dbUser){
    		res.json(dbUser);
    	});
  	});

	app.get("/testuser/:id/:password", function(req, res) {
    	db.User.create({
    		user_email: req.params.id,
        password: req.params.password
    	}).then(function(dbUser){
    		res.json(dbUser);
    	});
  	});
  
  app.get("/testmeal/:dish_id/:user_id", function(req, res) {
      db.Meal.create({
        UserId: req.params.user_id,
        DishId: req.params.dish_id,
        rating: 3,
        description: "Was good",
        meal_name: "Test meal",
        restaurant: "The worst",
        zip_code: 27516
      }).then(function(dbUser){
        res.json(dbUser);
      });
    });  

};