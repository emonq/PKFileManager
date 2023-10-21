const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        mimetype: {type: String, required: true, maxLength: 100},
        size: {type: Number, required: true},
        md5: {type: String, required: true, maxLength: 100},
    },
    {timestamps: true}
);

const File = mongoose.model("File", FileSchema);

module.exports = {FileSchema, File}