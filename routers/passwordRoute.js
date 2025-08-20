const { resetPasswordCtrl, forgetPasswordCtrl } = require("../controllers/passwordController");

const router = require("express").Router();

router.post("/reset-password-link",forgetPasswordCtrl);


router.post("/reset-password/:userId/:token",resetPasswordCtrl);


module.exports = router