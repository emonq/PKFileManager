const {SMTP_USERNAME, SMTP_PASSWORD, SMTP_SERVER, SMTP_SERVER_PORT} = process.env;

let config = {
    host: SMTP_SERVER,
    port: SMTP_SERVER_PORT,
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
    }
}

module.exports = config;