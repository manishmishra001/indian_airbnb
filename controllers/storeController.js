const { Result } = require("postcss");
const Home = require("../models/home");
const User = require("../models/user");
const pathUtil = require("../utils/pathUtil");
const path = require('path');
const rootDir = require("../utils/pathUtil");


exports.getIndex = (req, res, next) => {
  console.log("session", req.session);
  Home.find().then(registeredHomes =>{
     res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLogedin: req.isLogedin,
      user : req.session.user
    })
  })
};

exports.getHomes = (req, res, next) => {
  Home.find().then(registeredHomes =>{
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLogedin: req.isLogedin, 
    user : req.session.user
    })
});
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLogedin: req.isLogedin, 
    user : req.session.user
  })
};

// exports.getFavouriteList = (req, res, next) => {
//   Favourite.find().populate('homeId').then(favourites => {
//     favourites = favourites.map(favourites => favourites.homeId);

//       res.render("store/favourite-list", {
//         favouriteHomes: favourites,
//         pageTitle: "My Favourites",
//         currentPage: "favourites",
//       })
//     });
//   };


exports.getFavouriteList = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('favourites');
    const favouriteHomes = user.favourites || [];
    console.log("Favourite Homes: ", favouriteHomes);
    res.render("store/favourite-list", {
      favouriteHomes: favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLogedin: req.isLogedin,
      user: req.session.user
    });
  } catch (err) {
    console.error("Error fetching favourites:", err);
    res.redirect("/homes");
  }
}


exports.postAddToFavourite = async (req, res, next) => {
  try {
    const homeId = req.body.id;
    const userId = req.session.user?._id;  // safe check

    if (!userId) {
      return res.redirect("/login"); // or handle guest case
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/login"); // invalid session
    }

    // Ensure homeId is an ObjectId when comparing
    if (!user.favourites.map(fav => fav.toString()).includes(homeId)) {
      user.favourites.push(homeId);
      await user.save();
    }

    res.redirect("/favourites");
  } catch (err) {
    console.error("Error adding to favourites:", err);
    res.redirect("/homes");
  }
};


exports.postRemoveFromFavourite = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (user && user.favourites.includes(homeId)) {
      user.favourites = user.favourites.filter(favId => favId.toString() !== homeId);
      await user.save();
    }
    console.log("Removed from favourites");
    res.redirect("/favourites");
  } catch (err) {
    console.error("Error while removing from favourites: ", err);
    res.redirect("/favourites");
  }
}

// exports.getHomeDetails = (req, res, next) => {
//   const homeId = req.params.homeId;
//   Home.findById(homeId).then(([Homes] ) => {
//     const home = home[0];
//     if (!home) {
//       console.log("Home not found");
//       res.redirect("/homes");
//     } else {
//       res.render("store/home-detail", {
//         home: home,
//         pageTitle: "Home Detail",
//         currentPage: "Home",
//       });
//     }
//   })
// };


exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then(homes => {
    if (!homes) {
      console.log("Home not found");
      return res.redirect("/homes");
    }
    res.render("store/home-detail", {
      home: homes,
      pageTitle: "Home Detail",
      currentPage: "Home",
      isLogedin: req.isLogedin, 
    user : req.session.user
    });
  }).catch(err => {
    console.error(err);
    res.redirect("/homes");
  });
};


