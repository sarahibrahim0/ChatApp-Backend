const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    }
,
phone:{
type: String,

},
gender :
{
  type:String
},
birthDate: {
type: Date
},
    isDeleted:{
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      required: function() { return !this.isDeleted; },
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: true,
    },

      deletedAt: { type: Date },
    deletedEmail :{
      type: String,
      default : ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
        title: {
      type: String,
      default: ""
    }    ,
      profilePhoto: {
      type: Object, //data type of the field;
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        publicId: null,
      } }  
       ,
    isAdmin: {
      required: true,
      type: Boolean,
      default: false,
    },
    isVerified: {
      required: true,
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

//generate token
const secret = process.env.JWT_SECRET;

UserSchema.methods.generateAuthToken = function () {
  console.log(this._id, this.isAdmin);
  return jwt.sign(
    {
      id: this._id,
      isAdmin: this.isAdmin,
    },
    secret
  );
};

const User = mongoose.model("User", UserSchema);
//Validate user

function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().max(100).required().email(),
    password: joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}

//validate email
function validateEmail(obj) {
  const schema = joi.object({
    email: joi.string().trim().max(100).required().email(),
  });
  return schema.validate(obj);
}

function validateNewPassword(obj) {
  const schema = joi.object({
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}

function validateUser(obj) {
  const schema = joi.object({
    name: joi.string().trim().min(2).max(100).required(),
    email: joi.string().trim().max(100).required().email(),
    password: passwordComplexity().required(),
    isAdmin: joi.boolean().required(),
    isVerified: joi.boolean().required(),
    birthDate: joi.date(), // optional
    gender: joi.string(),  // optional
    phone: joi.string()    // optional
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateNewPassword,
  validateUser,
  validateLoginUser,
  validateEmail,
};

