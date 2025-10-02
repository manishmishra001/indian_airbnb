
const home = require("./home");
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstname: {type: String, required: true},
  lastname: {type: String},
  email: {type: String, required:[true, 'Email required'] , unique: true},
  password: {type: String, required: [true, 'Password required']},
  usertype: {type: String, required: true, enum: ['guest', 'host'], default: 'guest' },
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Home' }]
});


module.exports = mongoose.model('user', userSchema);