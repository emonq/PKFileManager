const express = require("express");
const router = express.Router();
const user_controller = require("../../controllers/userController");

router.use(require("../../middleware/authed_user_only"));

router.get("/me", user_controller.getMe);
router.post("/logout", user_controller.logout);
router.post("/webauthn/start", user_controller.webauthnStart);
router.post("/webauthn/finish", user_controller.webauthnFinish);
router.get("/test", user_controller.test)
// router.get("/auth", user_controller.corbadoAuth);

module.exports = router;