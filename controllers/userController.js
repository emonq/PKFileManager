const Corbado = require('@corbado/node-sdk');

const config = new Corbado.Configuration(process.env.CORBADO_PROJECT_ID, process.env.CORBADO_API_SECRET);
const corbado = new Corbado.SDK(config);


exports.getMe = (req, res) => {
    res.json({
        msg: "Hello from the backend!"
    })
}

exports.corbadoAuth = async function (req, res) {
    let corbadoAuthToken = req.query.corbadoAuthToken;
    let clientInfo = corbado.utils.getClientInfo(req);
    console.log(corbadoAuthToken)
    res.json("ok");
}
