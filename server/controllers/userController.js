const axios = require('axios');

const http = axios.create({
    baseURL: 'https://backendapi.corbado.io',
    headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.CORBADO_PROJECT_ID}:${process.env.CORBADO_API_SECRET}`).toString('base64')
    }
});

exports.getMe = async (req, res) => {
    res.json({
        id: req.session.user.ID,
        email: req.session.user.name,
        name: req.session.user.fullName
    })
}

exports.test = async (req, res) => {
    let result = await http.get('/v1/users');
    console.log(req.headers.origin);
    res.send(result.data);
};

exports.webauthnStart = async (req, res) => {
    console.log(req.body);
    try {
        let result = await http.post(
            '/v1/webauthn/register/start',
            {
                username: req.body.username,
                origin: req.headers.origin,
                clientInfo: {
                    remoteAddress: req.connection.remoteAddress,
                    userAgent: req.headers['user-agent']
                }
            }
        );
        res.json(JSON.parse(result.data.publicKeyCredentialCreationOptions));
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
}

exports.webauthnFinish = async (req, res) => {
    try {
        let result = await http.post(
            '/v1/webauthn/register/finish',
            {
                publicKeyCredential: req.body.publicKeyCredential,
                origin: req.headers.origin,
                clientInfo: {
                    remoteAddress: req.connection.remoteAddress,
                    userAgent: req.headers['user-agent']
                }
            }
        );
        let credentialID = result.data.credentialID;
        result = await http.put(
            `/v1/webauthn/credential/${credentialID}`,
            { status: 'active' }
        );
        res.json(result.data);
    }
    catch (err) {
        console.log(err.response.data.error);
        res.status(500).end();
    }
}

exports.logout = async (req, res) => {
    req.session.destroy();
    res.status(200).end();
}