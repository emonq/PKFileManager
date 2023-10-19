const express = require("express");
const dotenv = require("dotenv")
const morgan = require('morgan');
const session = require('express-session');

dotenv.config()

const EXPRESS_PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || (Math.random() * 100000000000000000).toString(36);

const app = express();

const mongoose = require("mongoose");
const mongoDB = "mongodb://localhost:27017/";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(morgan('dev'));
// app.use(cookieParser({
//     secret: SESSION_SECRET
// }))
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60, // 1 hour
        rolling: true
    }
}));


app.use("/api", require("./routes/api"));

// serve vue frontend
// const staticFileMiddleware = express.static("./dist");
// app.use(staticFileMiddleware);
// app.use(history({
//     index: '/index.html',
//     disableDotRule: true,
//     verbose: true
// }));
// app.use(staticFileMiddleware);

app.listen(EXPRESS_PORT,
    () => {
        console.log(`Server running on port ${EXPRESS_PORT}`);
    });