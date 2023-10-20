const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(require('../config/smtp.config'));
const {SMTP_FROM} = process.env;

const smtpSender = {
    sendMail: async (to, subject, html) => {
        await transporter.sendMail({
            from: SMTP_FROM,
            to,
            subject,
            html
        });
    },
    sendCode: async (to, code) => {
        await smtpSender.sendMail(to, 'Your code', `Your code is ${code}`);
    }
}

module.exports = smtpSender;