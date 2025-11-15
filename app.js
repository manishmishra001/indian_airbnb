// Core Module
const path = require('path');

require("dotenv").config();


// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const authRouter = require('./routes/authRouter');
const { default: mongoose } = require('mongoose');

const app = express();

const MONGO_URL = "mongodb+srv://manish1525t_db_user:manish123@rudra.wdgvr3t.mongodb.net/airbnb?retryWrites=true&w=majority&appName=rudra";

app.set('view engine', 'ejs');
app.set('views', 'views');

// MongoDB session store
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions'
});





const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.use(multer({ storage: storage, fileFilter: fileFilter }).single('photo')); 





// Body parser
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store
}));


// Set login flag
app.use((req, res, next) => {
  req.isLogedin = req.session.isLogedin;
  next();
});

// Routers without file uploads
app.use(authRouter);
app.use(storeRouter);

// Debug logs
app.use((req, res, next) => {
  console.log("[DEBUG] req.session.isLogedin:", req.session.isLogedin);
  console.log("[DEBUG] req.isLogedin:", req.isLogedin);
  next();
});

// Host routes authentication
app.use("/host", (req, res, next) => {
  if (req.isLogedin) next();
  else res.redirect("/login");
});

// Host router
app.use("/host", hostRouter);

// Static folders
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/host/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/homes/uploads', express.static(path.join(rootDir, 'uploads')));



// 404 error controller
app.use(errorsController.pageNotFound); // 404 for wrong routes

app.use((err, req, res, next) => {
  console.error(err);

  res
    .status(404)
    .render("globalerror", {
      pageTitle: "Error",
      currentPage: "globalerror",
      isLogedin: req.isLogedin,
      user: req.session.user || null,
    });
});

// Connect MongoDB & start server
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.log('Error while connecting to MongoDB: ', err));
