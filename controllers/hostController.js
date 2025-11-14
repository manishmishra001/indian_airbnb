const Home = require("../models/home");
const fs = require('fs');

// exports.getAddHome = (req, res, next) => {
//   res.render("host/edit-home", {
//     pageTitle: "Add Home to airbnb",
//     currentPage: "addHome",
//     editing: false,
//     isLogedin: req.isLogedin, 
//     user : req.session.user
//   });

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLogedin: req.session.isLoggedIn,
    user: req.session.user,
  });
};    



exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === 'true';

  Home.findById(homeId).then(homes => {
    if (!homes) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }

    console.log(homeId, editing, homes);
    res.render("host/edit-home", {
      home: homes,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLogedin: req.isLogedin, 
    user : req.session.user
    });
  }).catch(err => {
    console.error(err);
    res.redirect("/host/host-home-list");
  isLogedin: req.isLogedin });
};


exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes)=>{
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLogedin: req.isLogedin, 
    user : req.session.user
    })
  });
};

exports.postAddHome = (req, res, next) => {
  const {  houseName, price, location, rating,  description } = req.body;

  if(!req.file){[p]
    return res.status(400).send('No file uploaded.');
    return res.redirect('/host/host-home-list');
  }
  const home = new Home({houseName, price, location, rating, photo: req.file.path, description});
  home.save().then(()=>{ 
    console.log("Home Created");
  });

  res.redirect("/host/host-home-list");
};



exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;

  Home.findById(id)
    .then((foundHome) => {
      if (!foundHome) {
        console.error("Home not found");
        return res.redirect("/host/host-home-list");
      }

      foundHome.houseName = houseName;
      foundHome.price = price;
      foundHome.location = location;
      foundHome.rating = rating;
      foundHome.description = description;

      if (req.file) {
        fs.unlink(foundHome.photo, (err) => {
          if (err) {
            console.error("Error deleting old photo:", err);
          } else {
            console.log("Old photo deleted successfully.");
          }
        });
        foundHome.photo = req.file.path;
      }
      return foundHome.save();
    })
    .then(() => {
      console.log("Home updated successfully.");
      res.redirect("/host/host-home-list");
    })
    .catch(err => {
      console.error("Error:", err);
      res.redirect("/host/host-home-list");
    });
};





exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log('Came to delete ', homeId);

  Home.findByIdAndDelete(homeId)
    .then(() => {
      console.log('Home deleted successfully.');
      res.redirect("/host/host-home-list");
    })
    .catch(error => {
      console.error('Error while deleting:', error);
      res.redirect("/host/host-home-list");
    });
};
