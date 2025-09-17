const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User}  = require("../models/user");
const { validationResult } = require("express-validator");
const VerificationToken = require("../models/verificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { cloudinaryUploadFile, cloudinaryRemoveFile } = require("../utils/cloudinary");
const fs = require("fs/promises"); // بدل fs العادي
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async(req,res , next) =>{
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0].msg });
  }
  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ email });
   
    if (user) {
      return res.status(400).json({ message: "User already exist" });
    }
        if (user && user.isDeleted) {
      return res.status(400).json({ message: "Account Deleted" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashPassword });
    await newUser.save();

    const verificationToken = new VerificationToken({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();

    // make the link
    const link = `http://localhost:5173/api/users/${newUser._id}/verify/${verificationToken.token}`;

    //    putting the link into an html template
    const htmlTemplate = `
      <div>
  <p> click on the link below to verify your email</p>
  <a href="${link}">Verify</a>
      </div>`;

    //sending email to the user
    await sendEmail(newUser.email, "verify your email", htmlTemplate);
    //response to the client

    // const token = jwt.sign(
    //   {
    //     id: newUser._id,
    //     email: newUser.email,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1h" }
    // );

    res.status(201).json({ message: ` ${newUser.email}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

);

/**
 *@description verify user account
 *
 * @router /api/auth/:userId/verify/:token
 *
 * @method GET
 *
 * @access public
 *
 */

const verifyUserAccountCtrl = asyncHandler(async(req,res , next) =>{
  try{
    const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }

  user.isVerified = true;
  await user.save();

setTimeout(async () => {
  await VerificationToken.deleteOne({
    userId: user._id,
    token: req.params.token,
  });
}, 10000); // 10000 = 10 ثواني
  res.status(200).json({ message: "Your account verified" });
  }
  catch(error){
  res.status(500).json({message: 'Internal server error'})
  }
}
);

const loginUser = asyncHandler(async(req,res , next) =>{

  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0].msg });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user doesn't exist" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
 if (user.isDeleted) {
  return res.status(403).json({ message: "This account has been deleted" });
}
if (!user.isActive) {
 return res.status(403).json({
    message: "Account is deactivated",
    userId: user._id 
  });};

    if (!user.isVerified) {
      let verificationToken = await VerificationToken.findOne({
        userId: user._id,
      });
      if (!verificationToken) {
        verificationToken = new VerificationToken({
          userId: user._id,
          token: crypto.randomBytes(32).toString(),
        });
      }
      await verificationToken.save();

      const link = `http://localhost:5173/api/users/${user._id}/verify/${verificationToken.token}`;

      //    putting the link into an html template
      const htmlTemplate = `
      <div>
  <p> click on the link below to verify your email</p>
  <a href="${link}">Verify You Email</a>
      </div>`;

      //sending email to the user
      await sendEmail(user.email, "verify your email", htmlTemplate);

      return res
        .status(400)
        .json({ message: "we sent to you an email please verify it" });
    }
    //generate token(jwt)
    const token = user.generateAuthToken();

    //send response to client
    res.status(200).send({
      _id: user._id,
      isAdmin: user.isAdmin,
      token,
      gender: user.gender,
      username: user.name,
      profilePhoto: user.profilePhoto,
      title: user.title,
      birthDate: user.birthDate,
      phone:user.phone,
      email:user.email,
      isActive: user.isActive,
      isDeleted: user.isDeleted,
      deletedEmail: user.deletedEmail


      
    });


  } catch (error) {

    return res.status(500).json({ message: error.message });
  }
});

const getUser = asyncHandler(async(req,res , next) =>{
  const userId = req.params.id;
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(500).json({ message: "internal server error" });
    });
});

const getUsers = asyncHandler(async(req,res , next) =>{
  User.find({},'name')
    .then((users) => {
      if (!users) {
        return res.status(404).json({ message: "user not found" });
      }
      res.status(200).json(users);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
})

const searchUserByEmail = asyncHandler(async(req,res , next) =>{
  
    const email = req.query.email;
      if(!email){
      return res.status(400).json({ message: 'Email is required' });
  }
  try{
    const user = await User.findOne({email}).select('-password'); 
       if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  }
  catch(error){
    res.status(501).json({ message: 'Server error' });
  }

});

const editUserProfile = asyncHandler (async(req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phone, gender, birthDate, password
      ,title
     } = req.body;

    // ✅ تحديث الصورة لو فيه صورة مرفوعة
    if (req.file) {
      if (user.profilePhoto.publicId) {
        await cloudinaryRemoveFile(user.profilePhoto.publicId);
      }

      const uploadedImage = await cloudinaryUploadFile(req.file.path);
      await fs.unlink(req.file.path);

      console.log(uploadedImage)

      user.profilePhoto = {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
      };
    }

    // ✅ تحديث الحقول المسموح بها
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (birthDate) user.birthDate = birthDate;
        if (title) user.title = title;


    // ✅ تحديث الباسورد لو موجود
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // ✅ إرسال اليوزر بدون الباسورد
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const deleteUserProfile = asyncHandler(async(req,res , next) =>{

  const userId = req.user._id.toString(); // جاي من التوكن بعد التحقق
  try{
  let user = await User.findById(userId);
  if(!user){
    res.status(401).json("user not found");
  }

   if (user.profilePhoto?.publicId) {
      await cloudinaryRemoveFile(user.profilePhoto.publicId);
    };


  await User.findByIdAndUpdate(userId , {
  name: "Deleted User",
  deletedEmail: user.email,
  email: `deleted_${userId}@example.com`, // بديل للإيميل عشان يفضل unique
  phone: "",
  gender: "",
  birthDate: null,
  title:"",
  profilePhoto: {
    url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    publicId: null
  },
  isDeleted: true,
  deletedAt: new Date()

  });

    res.status(200).json({message: "Account Deleted Successfully"} );
}
   catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const deactivateUser = asyncHandler(async(req,res ) =>{
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activate user
const activateUser = asyncHandler(async(req,res , next) =>{
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "User is already active" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ message: "Cannot activate deleted account" });
    }

    user.isActive = true;
    await user.save();

    res.json({
      message: "User activated successfully",
      user: {
        _id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  verifyUserAccountCtrl,
  searchUserByEmail,
  editUserProfile,
  deleteUserProfile,
  deactivateUser,
  activateUser
};
