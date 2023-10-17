const Corbado = require('@corbado/node-sdk');

const CORBADO_PROJECT_ID = process.env.CORBADO_PROJECT_ID;
const CORBADO_API_SECRET = process.env.CORBADO_API_SECRET;
const config = new Corbado.Configuration(CORBADO_PROJECT_ID, CORBADO_API_SECRET);
const corbado = new Corbado.SDK(config);


exports.getMe = async (req, res) => {
    const user = await corbado.session.getCurrentUser(req);
    if (user.authenticated) {
        res.json({
            id: user.id,
            email: user.email,
            name: user.name
        })
    } else {
        res.status(401).end();
    }
}

exports.corbadoAuth = async function (req, res) {
    let corbadoAuthToken = req.query.corbadoAuthToken;
    let clientInfo = corbado.utils.getClientInfo(req);
    // let validate_result = await corbado.authTokens.validate(corbadoAuthToken, clientInfo);
    res.json("ok");
}