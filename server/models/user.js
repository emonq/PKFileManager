const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CredentialSchema = new Schema(
    {
        credentialID: {type: Buffer, required: true},
        credentialPublicKey: {type: Buffer, required: true},
        credentialType: {type: String, required: true},
        counter: {type: Number, required: true, default: 0},
        active: {type: Boolean, default: false},
        transports: [{type: String, enum: ["usb", "nfc", "ble", "internal"]}],
    },
    {timestamps: true}
);

const UserSchema = new Schema(
    {
        id: {type: Schema.Types.ObjectId, required: true, index: {unique: true}},
        username: {type: String, required: true, maxLength: 100},
        email: {type: String, required: true, maxLength: 100},
        role: {type: String, enum: ["admin", "user"], default: "user"},
        credentials: [{type: CredentialSchema}],
        enabled: {type: Boolean, default: false},
        lastEmailTime: {type: Date, default: 0},
    },
    {timestamps: true}
);

const User = mongoose.model("User", UserSchema);
const Credential = mongoose.model("Credential", CredentialSchema);

module.exports = {User, Credential};