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

const Credential = mongoose.model("Credential", CredentialSchema);

module.exports = {CredentialSchema, Credential}