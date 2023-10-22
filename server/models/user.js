const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { CredentialSchema } = require("./credential");
const { FileSchema } = require("./file");

const UserSchema = new Schema(
    {
        id: { type: String, required: true, index: true, unique: true },
        username: { type: String, required: true, maxLength: 100 },
        email: { type: String, required: true, maxLength: 100 },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        credentials: [{ type: CredentialSchema }],
        enabled: { type: Boolean, default: false },
        lastEmailTime: { type: Date, default: 0 },
        allowEmailLogin: { type: Boolean, default: true },
        files: [{ type: FileSchema }],
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };