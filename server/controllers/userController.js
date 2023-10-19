const axios = require('axios');
const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const { isoBase64URL, isoUint8Array, isoCBOR } = require('@simplewebauthn/server/helpers');
const { User, Credential } = require('../models/user');

const { rpName, rpID, origin } = require('../config/rp.config');

const http = axios.create({
    baseURL: 'https://backendapi.corbado.io',
    headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.CORBADO_PROJECT_ID}:${process.env.CORBADO_API_SECRET}`).toString('base64')
    }
});

exports.getMe = async (req, res) => {
    res.json({
        email: req.session.user.email,
        username: req.session.user.username
    })
}

exports.webauthnStart = async (req, res) => {
    try {
        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: req.body.id,
            userName: req.body.username,
            authenticatorSelection: {
                // "Discoverable credentials" used to be called "resident keys". The
                // old name persists in the options passed to `navigator.credentials.create()`.
                residentKey: 'required',
                userVerification: 'preferred',
            },
        });
        res.json(options);
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
}

exports.signUpStart = async (req, res) => {
    if (!req.body.username || !req.body.email) {
        res.status(400).json({ error: 'Parameter missing' });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }

    let user = await User.findOne({ username: req.body.username });
    if (user) {
        res.status(400).json({ error: 'Username already exists' });
        return;
    }

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: req.body.username,
        userName: req.body.email,
        attestationType: 'direct',
        authenticatorSelection: {
            // "Discoverable credentials" used to be called "resident keys". The
            // old name persists in the options passed to `navigator.credentials.create()`.
            residentKey: 'required',
            userVerification: 'preferred',
        },
        requireUserVerification: true,
    });
    req.session.user = {
        username: req.body.username,
        email: req.body.email,
        challenge: options.challenge,
    }
    res.json(options);
}

exports.signUpFinish = async (req, res) => {
    verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge: req.session.user.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
    });

    const { verified, registrationInfo } = verification;
    if (!verified) {
        res.status(400).json({ error: 'Invalid registration response' });
        return;
    }
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    let credential = new Credential({
        credentialID: Buffer.from(credentialID),
        credentialPublicKey: Buffer.from(credentialPublicKey),
        active: true
    });
    await credential.save();
    let user = new User({
        username: req.session.user.username,
        email: req.session.user.email,
        credentials: [credential],
        enabled: true
    })
    await user.save();
    res.json({
        username: user.username,
        email: user.email,
    });
}

exports.login = async (req, res) => {
    if (req.body.username) {
        req.session.username = req.body.username;
        let user = await User.findOne({ username: req.body.username });
        if (!user) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const authenticators = user.credentials;
        const allowedCredentials = authenticators.map(authenticator => {
            return {
                id: authenticator.credentialID,
                type: 'public-key',
            }
        });
        const options = await generateAuthenticationOptions({
            allowCredentials: allowedCredentials,
            userVerification: 'preferred',
        });
        req.session.loginChallenge = options.challenge;
        res.json(options);
    }
    // finish login
    else {
        const authenticator = await Credential.findOne(({ credentialID: Buffer.from(isoBase64URL.toBuffer(req.body.id)) }));
        if (!authenticator) {
            res.status(400).json({ error: 'Invalid credential ID' });
            return;
        }
        let verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: req.session.loginChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator,
            requireUserVerification: true,
        });

        const { verified, authenticationInfo } = verification;
        if (!verified) {
            res.status(400).json({ error: 'Invalid authentication response' });
            return;
        }
        authenticator.counter = authenticationInfo.newCounter;
        await authenticator.save();
        const user = await User.findOne({ username: req.session.username });
        req.session.user = user;
        req.session.loginChallenge = null;
        res.json({
            username: user.username,
            email: user.email,
        });
    }
}

exports.logout = async (req, res) => {
    req.session.destroy();
    res.status(200).end();
}