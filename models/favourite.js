const { default: mongoose } = require("mongoose");
const homeSchema = require("./home");


const favouriteSchema = mongoose.Schema({
  homeId :{
    type : mongoose.Schema.Types.ObjectId,
    reg:'Home',
    required: true,
    unique : true
  }
});



module.exports = mongoose.model('Favourite', favouriteSchema);
  