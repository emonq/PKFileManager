const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const {isoBase64URL, isoUint8Array, isoCBOR} = require('@simplewebauthn/server/helpers');
const {User, Credential} = require('../models/user');

const {rpName, rpID, origin} = require('../config/rp.config');
const mongoose = require("mongoose");

const extractUserInfo = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        credentials: user.credentials.map(credential => ({
            id: credential.credentialID.toString('base64'),
            type: credential.credentialType
        }))
    }
}

exports.getMe = async (req, res) => {
    const user = await User.findOne({_id: req.session.user._id})
    const info = extractUserInfo(user)
    res.json(info);
}

const webauthnRegistrationStart = async () => {

}

exports.signUpStart = async (req, res) => {
    let uid, username, excludeCredentials = [];
    // if user is logged in, register a new key for the user
    if (req.session.user) {
        uid = req.session.user.id;
        username = req.session.user.username;
        const user = await User.findOne({id: uid});
        excludeCredentials = user.credentials.map(credential => ({
            id: credential.credentialID,
            type: credential.credentialType
        }));
        req.session.registration = {}
    }
    // new user, check if username and email are available
    else {
        if (!req.body.username || !req.body.email) {
            res.status(400).json({error: 'Parameter missing'});
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            res.status(400).json({error: 'Invalid email format'});
            return;
        }

        let user = await User.findOne({username: req.body.username});
        if (user) {
            res.status(400).json({error: 'Username already exists'});
            return;
        }

        uid = new mongoose.Types.ObjectId();
        username = req.body.username;
        req.session.registration = {
            registrationId: uid,
            username: req.body.username,
            email: req.body.email,
        }
    }

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: uid,
        userName: username,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
        },
        excludeCredentials,
        requireUserVerification: true,
        extensions: {
            credProps: true
        }
    });
    req.session.registration.challenge = options.challenge;
    res.json(options);
}

exports.signUpFinish = async (req, res) => {
    let verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge: req.session.registration.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
    });

    const {verified, registrationInfo} = verification;
    if (!verified) {
        res.status(400).json({error: 'Invalid registration response'});
        return;
    }
    const {credentialPublicKey, credentialID, counter, credentialType} = registrationInfo;

    let credential = new Credential({
        credentialID: Buffer.from(credentialID),
        credentialPublicKey: Buffer.from(credentialPublicKey),
        active: true,
        counter: counter,
        credentialType: credentialType,
        transports: req.body.response.transports,
    });

    let user;
    //new user registration
    if (req.session.registration.username) {
        user = new User({
            id: req.session.registration.registrationId,
            username: req.session.registration.username,
            email: req.session.registration.email,
            credentials: [],
            enabled: true
        })
    } else {
        user = await User.findOne({id: req.session.user.id});
    }
    user.credentials.push(credential);
    await user.save();
    req.session.registration = null;
    res.json(extractUserInfo(user));
}

exports.login = async (req, res) => {
    if (req.body.username) {
        req.session.username = req.body.username;
        let user = await User.findOne({username: req.body.username});
        if (!user) {
            res.status(400).json({error: 'User not found'});
            return;
        }
        const credentials = user.credentials;
        const allowedCredentials = credentials.map(credential => {
            return {
                id: credential.credentialID,
                type: 'public-key',
            }
        });

        const options = await generateAuthenticationOptions({
            allowCredentials: allowedCredentials,
            userVerification: 'preferred',
        });
        req.session.login = {
            uid: user.id,
            challenge: options.challenge
        };
        res.json(options);
    }
    // finish login
    else {
        const user = await User.findOne({id: req.session.login.uid});
        if (!user) {
            res.status(400).json({error: "User not found"});
            return;
        }
        const credentialIDBase64 = Buffer.from(isoBase64URL.toBuffer(req.body.id)).toString('base64');
        const credential = user.credentials.find(credential => credential.credentialID.toString('base64') === credentialIDBase64);
        if (!credential) {
            res.status(400).json({error: 'Invalid credential ID'});
            return;
        }
        let verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: req.session.login.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: credential,
            requireUserVerification: true,
        });

        const {verified, authenticationInfo} = verification;
        if (!verified) {
            res.status(400).json({error: 'Invalid authentication response'});
            return;
        }
        credential.counter = authenticationInfo.newCounter;
        await user.save();
        req.session.user = user;
        req.session.login = null;
        res.json(extractUserInfo(user));
    }
}

exports.logout = async (req, res) => {
    req.session.destroy();
    res.status(200).end();
}