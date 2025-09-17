const { User } = require("../models/user");
const VerificationToken = require("../models/verificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");


const forgetPasswordCtrl = asyncHandler(async(req,res ) =>{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({msg : "User not found"})
            };
if(user.isDeleted){
              return res.status(404).json({msg : "This Account Has Been Deleted"})

}
  let verificationToken = await VerificationToken.findOne({ userId: user._id });
  if (!verificationToken) {
    verificationToken = new VerificationToken({
      userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
  }

  await verificationToken.save();

  //creating link
  const link = `http://localhost:5173/api/reset-password/${user._id}/${verificationToken.token}`;
  //creating html template
  const htmlTemplate = `
    <a href="${link}">
    click here to reset password
    </a>
    `;
  //sending email
  await sendEmail(user.email, "Reset Password", htmlTemplate);
  //response to the client
  res.status(200).json({ message:  user.email });
});

 const resetPasswordCtrl = asyncHandler(async(req,res)=>{
        const {userId , token} = req.params;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({msg : "User not found"})
            }
            const verificationToken = await VerificationToken.findOne({ userId: user._id, token: token});
            if(!verificationToken){
                return res.status(404).json({msg : "Invalid link or expired"})
            }
            if(!user.isVerified){
                user.isVerified = true;
            };
        
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
            user.password = hashedPassword;
            await user.save();
            await verificationToken.deleteOne({
                userId: user._id,
                token: verificationToken.token,
              });
        
            res.status(200).json({message : "Password reset successfully"});

    
});

module.exports = {forgetPasswordCtrl, resetPasswordCtrl}