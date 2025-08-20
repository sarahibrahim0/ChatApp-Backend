const express = require('express');
const {body} = require("express-validator");
const protect = require("../middlewares/protect");
const upload = require("../middlewares/multer");

const { registerUser , loginUser,editUserProfile, getUser, getUsers, verifyUserAccountCtrl, searchUserByEmail, deleteUserProfile, deactivateUser, activateUser } = require('./../controllers/userController');
const router = express.Router();
router.post('/register', [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter valid email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 character')
], registerUser  )

router.post('/login', [
    body('email').isEmail().withMessage('Enter valid email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 character')
], loginUser  )

router.put("/delete-profile", protect, deleteUserProfile);
router.put("/edit-profile/:userId", upload.single("profilePhoto"), editUserProfile);
router.put("/:id/deactivate",protect , deactivateUser);
router.put("/:id/activate", activateUser);



router.get("/search", searchUserByEmail);
router.get("/:userId/verify/:token", verifyUserAccountCtrl);
router.get("/", getUsers);
router.get("/:id", getUser);




module.exports = router