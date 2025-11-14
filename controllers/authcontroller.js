const { check, validationResult } = require("express-validator");
const { on } = require("nodemon");
const User = require("../models/user");
const bcrypt = require("bcryptjs");


exports.getLogin = (req, res, next) => {
  // Pass an empty array for errors on the initial page load
  res.render("auth/login", { 
    isLogedin: false, 
    pageTitle: "Login",
    errors: [], // <--- This is the fix
    oldInput: { email: "" },
    user : {}
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {;
  res.redirect("/");
  })}

exports.postLogin = async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.status (422).render("auth/login",{
      isLogedin : false,
      errors : ["User not found"],
      oldInput:{email : ""},
    user : {}
    });
  } 
  const ismatch = await bcrypt.compare(password, user.password);
  if(!ismatch){
    return res.status (422).render("auth/login",{
      isLogedin : false,
      errors : ["Invalid password"],
      oldInput:{email}
    });
  }

  req.session.isLogedin = true;
  req.session.user = user;
  res.redirect("/");
}  

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    isLogedin: false,
    errors : [],
    oldInput:{firstname : "", lastname : "", email : "",  usertype : ""},
    user : {}
  });
};

exports.postSignup = [
  check("firstname").trim().isLength({min:2}).withMessage("First name atleast contain 2 letters").matches(/^[A-Za-z]+$/).withMessage("First name must contain only letters"),
  check("lastname").matches(/^[A-Za-z]*$/).withMessage("Last name must contain only letters"),
  check("email").isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
  check("password").isLength({ min: 5}).withMessage("Password must be at least 5 characters long").matches(/[A-Z]/).withMessage("Password must contain a uppercase letter").matches(/[a-z]/).withMessage("Password must contain a lowecase").matches(/[0-9]/).withMessage("Password must contain a number").matches(/[!@#$%^&*~`<>?/|]/).withMessage("Password must contain special character").trim(),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }).trim(),
  check("usertype").not().isEmpty().withMessage("Please select a user type").isIn(['guest','host']).withMessage("Invalid user type"),
  check("terms").notEmpty().withMessage("please accept terms and conditions")
    .custom((v) => {
      if (v !== "on") throw new Error("please accept terms and conditions");
      return true;
    }),

  (req, res, next) => {
    const { firstname, lastname, email, password, usertype } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        isLogedin: false,
        errors: errors.array().map(err => err.msg),
        oldInput: { firstname, lastname, email, usertype }
      });
    }

    // 🔥 FIRST CHECK IF EMAIL ALREADY EXISTS
    User.findOne({ email })
      .then(existingUser => {
        if (existingUser) {
          return res.status(422).render("auth/signup", {
            isLogedin: false,
            errors: ["Email already exists"],
            oldInput: { firstname, lastname, email, usertype }
          });
        }

        return bcrypt.hash(password, 12);
      })
      .then(hashedPassword => {
        if (!hashedPassword) return; // already handled duplicate email above

        const user = new User({
          firstname,
          lastname,
          email,
          password: hashedPassword,
          usertype
        });

        return user.save();
      })
      .then(() => {
        console.log("User created");
        res.redirect("/login");
      })
      .catch(err => {
        // 🔥 HANDLE DUPLICATE KEY FROM MONGODB SAFELY
        if (err.code === 11000) {
          return res.status(422).render("auth/signup", {
            isLogedin: false,
            errors: ["Email already exists"],
            oldInput: { firstname, lastname, email, usertype }
          });
        }

        // fallback error
        next(err); // send to global error handler
      });
  }
];

