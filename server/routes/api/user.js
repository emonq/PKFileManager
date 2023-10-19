const express = require("express");
const router = express.Router();
const user_controller = require("../../controllers/userController");

const authenticated = require("../../middleware/authed_user_only");

router.get("/me", authenticated, user_controller.getMe);
router.post("/logout", authenticated, user_controller.logout);
router.post("/signUpStart", user_controller.signUpStart);
router.post("/signUpFinish", user_controller.signUpFinish);
router.post("/login", user_controller.login);

module.exports = router;