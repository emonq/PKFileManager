const express = require("express");
const router = express.Router();
const user_controller = require("../../controllers/userController");

router.get("/me", user_controller.getMe);
router.get("/auth", user_controller.corbadoAuth);

module.exports = router;