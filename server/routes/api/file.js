const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();

const fileController = require("../../controllers/fileController");
const authenticated = require("../../middleware/require_authentication");

router.use(fileUpload({
        limits: {fileSize: 50 * 1024 * 1024}, // 50MB
        defParamCharset: "utf8",
        abortOnLimit: true,
        createParentPath: true,
        useTempFiles: true,
        tempFileDir: process.env.TMP_FILE_DIR || "/tmp/",
    })
)
router.use(authenticated)

router.post("/upload", fileController.upload);
router.post("/list", fileController.list);
router.get("/:id", fileController.download)
router.delete("/:id", fileController.delete)

module.exports = router;