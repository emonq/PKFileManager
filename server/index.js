const express = require("express");
const dotenv = require("dotenv")
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require("cookie-parser");

dotenv.config()

const EXPRESS_PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || (Math.random() * 100000000000000000).toString(36);

const app = express();

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
app.use("/auth", require("./routes/auth"));

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