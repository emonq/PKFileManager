const express = require('express');
const router = express.Router();

const Corbado = require('@corbado/node-sdk');

const CORBADO_PROJECT_ID = process.env.CORBADO_PROJECT_ID;
const CORBADO_API_SECRET = process.env.CORBADO_API_SECRET;
const config = new Corbado.Configuration(CORBADO_PROJECT_ID, CORBADO_API_SECRET);
const corbado = new Corbado.SDK(config);

router.get('/', (req, res) => {
    let corbadoAuthToken = req.query.corbadoAuthToken;
    let clientInfo = corbado.utils.getClientInfo(req);

    corbado.authTokens.validate(corbadoAuthToken, clientInfo)
        .then(response => {
            req.session.user = response.data.user;
            console.log(req.session)
            res.redirect(process.env.AUTH_REDIRECT_URL);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('error');
        });
});

module.exports = router;