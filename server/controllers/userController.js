const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const {isoBase64URL, isoUint8Array, isoCBOR} = require('@simplewebauthn/server/helpers');
const {User} = require('../models/user');
const {Credential} = require('../models/credential');

const {rpName, rpID, origin} = require('../config/rp.config');
const mongoose = require("mongoose");
const smtpSender = require('../utils/smtpSender');

const EMAIL_CODE_MAX_TRIES = process.env.EMAIL_CODE_MAX_TRIES || 3;
const EMAIL_SEND_INTERVAL = process.env.EMAIL_SEND_INTERVAL || 1000 * 60; // 1000*60 ms = 1 minute
const EMAIL_CODE_EXPIRATION = process.env.EMAIL_CODE_EXPIRATION || 1000 * 60 * 5; // 1000*60*5 ms = 5 minutes

const {customAlphabet, nanoid} = require('nanoid');

const extractUserInfo = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        allowEmailLogin: user.allowEmailLogin,
        credentials: user.credentials.map(credential => ({
            id: credential.credentialID.toString('base64'),
            type: credential.credentialType,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
        }))
    }
}

exports.getMe = async (req, res) => {
    const user = await User.findOne({_id: req.session.user._id})
    if (!user) {
        req.session.destroy();
        res.status(401).end();
        return;
    }
    const info = extractUserInfo(user)
    res.json(info);
}

exports.removeKey = async (req, res) => {
    if (!req.body.id) {
        res.status(400).json({error: 'Invalid credential ID'});
        return;
    }
    const user = await User.findOne({id: req.session.user.id});
    if (!user) {
        req.session.destroy();
        res.status(401).end();
        return;
    }
    const credential = user.credentials.find(credential => credential.credentialID.toString('base64') === req.body.id);
    if (!credential) {
        res.status(400).json({error: 'Invalid credential ID'});
        return;
    }
    await user.credentials.id(credential._id).deleteOne();
    await user.save();

    res.json(extractUserInfo(user));
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

        uid = nanoid();
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
    try {
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
        req.session.user = user;
        res.json(extractUserInfo(user));
    } catch (e) {
        console.log(e);
        res.status(500).end();
    } finally {
        req.session.registration = null;
    }
}

exports.loginStart = async (req, res) => {
    const method = req.body.method || 'passkey';

    let user = await User.findOne({username: req.body.username});
    if (!user) {
        res.status(400).json({error: 'User not found'});
        return;
    }
    req.session.login = {
        uid: user.id,
        method: method,
    };
    if (method === 'passkey') {
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

        req.session.login.challenge = options.challenge;
        res.json(options);
    } else if (method === 'email') {
        if (new Date() - user.lastEmailTime < EMAIL_SEND_INTERVAL) {
            res.status(403).json({error: 'Email sent too frequently'});
            return;
        }

        const code = customAlphabet('0123456789', 6)();

        try {
            await smtpSender.sendCode(user.email, code)
            user.lastEmailTime = new Date();
            await user.save();
            req.session.login.code = code;
            req.session.login.codeSentAt = new Date();
            req.session.login.retries = EMAIL_CODE_MAX_TRIES;
            res.json({message: 'Email sent'});
        } catch (err) {
            console.log(err);
            req.session.login = null;
            res.status(500).json({error: 'Failed to send email'});
            return;
        }

    } else {
        req.login = null;
        res.status(400).json({error: `authentication method ${method} is not supported`})
    }
}

exports.loginFinish = async (req, res) => {
    if (!req.session.login) {
        res.status(400).json({error: "Login not started"});
        return;
    }

    const user = await User.findOne({id: req.session.login.uid});
    if (!user) {
        res.status(400).json({error: "User not found"});
        req.session.destroy();
        return;
    }

    if (req.session.login.method === 'passkey') {
        if (!req.body.id) {
            res.status(400).json({error: "Invalid credential ID"});
            req.session.login = null;
            return;
        }
        const credentialIDBase64 = Buffer.from(isoBase64URL.toBuffer(req.body.id)).toString('base64');
        const credential = user.credentials.find(credential => credential.credentialID.toString('base64') === credentialIDBase64);
        if (!credential) {
            res.status(400).json({error: 'Invalid credential ID'});
            req.session.login = null;
            return;
        }
        try {
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
                req.session.login = null;
                return;
            }
            credential.counter = authenticationInfo.newCounter;
            await user.save();
            req.session.user = user;
            res.json(extractUserInfo(user));
        } catch (e) {
            res.status(403).json({error: 'Invalid authentication response'});
        } finally {
            req.session.login = null;
        }
    } else if (req.session.login.method === 'email') {
        if (new Date() - req.session.login.codeSentAt > EMAIL_CODE_EXPIRATION) {
            res.status(403).json({error: 'Code expired'});
            req.session.login = null;
            return;
        }
        if (req.body.code !== req.session.login.code) {
            req.session.login.retries--;
            if (req.session.login.retries <= 0) {
                req.session.login = null;
                res.status(403).json({error: 'Too many retries'});
            } else {
                res.status(400).json({error: 'Invalid code'});
            }
            return;
        }
        req.session.login = null;
        req.session.user = user;
        res.json(extractUserInfo(user));
    } else {
        req.session.login = null;
        res.status(403).json({error: 'Invalid login method'});
    }
}

exports.logout = async (req, res) => {
    req.session.destroy();
    res.status(200).end();
}