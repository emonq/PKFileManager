const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const nocache = require("../middleware/nocache");

router.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
router.use(bodyParser.json());
router.use(cookieParser());
// router.use(nocache);

router.use("/user", require("./api/user"));

module.exports = router;