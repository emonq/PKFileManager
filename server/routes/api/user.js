const express = require("express");
const router = express.Router();
const user_controller = require("../../controllers/userController");

const authenticated = require("../../middleware/authed_user_only");

router.get("/me", authenticated, user_controller.getMe);
router.post("/logout", authenticated, user_controller.logout);
router.delete("/removeKey", authenticated, user_controller.removeKey);
router.post("/signUpStart", user_controller.signUpStart);
router.post("/signUpFinish", user_controller.signUpFinish);
router.post("/loginStart", user_controller.loginStart);
router.post("/loginFinish", user_controller.loginFinish);

module.exports = router;