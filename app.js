// Core Module
const path = require('path');

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

app.set('view engine', 'ejs');
app.set('views', 'views');

// MongoDB session store
const store = new MongoDBStore({
  uri: 'mongodb+srv://manish1525t_db_user:manish123@rudra.wdgvr3t.mongodb.net/airbnb?retryWrites=true&w=majority&appName=rudra',
  collection: 'sessions'
});

// // Random string for filenames
// const randomstr = (length) => {
//   let result = '';
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

// Multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, randomstr(10) + '-' + file.originalname);
//   }
// });

// // Multer instance for images
// const uploadImage = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) cb(null, true);
//     else cb(new Error('Only images allowed'), false);
//   }
// }).single('photo'); // <input name="photo">

//   { name: 'photo', maxCount: 1 },
//   { name: 'pdf', maxCount: 1 }
// ]);

// module.exports = { uploadFiles };



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
  secret: "my secret key",
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
app.use(errorsController.pageNotFound);

// Connect MongoDB & start server
const PORT = 3000;
mongoose.connect("mongodb+srv://manish1525t_db_user:manish123@rudra.wdgvr3t.mongodb.net/airbnb?retryWrites=true&w=majority&appName=rudra")
.then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => console.log('Error while connecting to MongoDB: ', err));
