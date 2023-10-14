const express = require("express");
const router = express.Router();
const cors = require("cors");

const nocache = require("../middleware/nocache");

router.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
router.use(nocache);
router.use("/user", require("./api/user"));

module.exports = router;