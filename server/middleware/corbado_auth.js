const Corbado = require('@corbado/node-sdk');

const CORBADO_PROJECT_ID = process.env.CORBADO_PROJECT_ID;
const CORBADO_API_SECRET = process.env.CORBADO_API_SECRET;
const config = new Corbado.Configuration(CORBADO_PROJECT_ID, CORBADO_API_SECRET);
const corbado = new Corbado.SDK(config);

const CorbadoAuth = async (req, res, next) => {
    const user = await corbado.session.getCurrentUser(req);
    if (user.authenticated) {
        next()
    } else {
        res.status(401).end();
    }
}
module.exports = CorbadoAuth;