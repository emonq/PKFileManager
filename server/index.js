const express = require("express");
const dotenv = require("dotenv")
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const crypto = require('crypto');

dotenv.config()

const EXPRESS_PORT = process.env.EXPRESS_PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(56).toString('hex');
const {MONGODB_HOST, MONGODB_PORT} = process.env;
const app = express();

const mongoose = require("mongoose");
const mongoDB = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/`;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("MongoDB connected"))
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(morgan('dev'));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: mongoDB}),
    cookie: {
        secure: process.env.SECURE_COOKIE === 'true',
        httpOnly: false,
        maxAge: 1000 * 60 * 60, // 1 hour
        rolling: true
    }
}));

app.use("/api", require("./routes/api"));

app.listen(EXPRESS_PORT,
    () => {
        console.log(`Server running on port ${EXPRESS_PORT}`);
    });