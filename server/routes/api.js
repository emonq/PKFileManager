const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

const nocache = require("../middleware/nocache");

router.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
router.use(bodyParser.json());
// router.use(nocache);

router.use("/user", require("./api/user"));


module.exports = router;