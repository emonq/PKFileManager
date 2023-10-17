const express = require("express");
const dotenv = require("dotenv")
const morgan = require('morgan');
const cors = require("cors");

dotenv.config()

const EXPRESS_PORT = process.env.PORT || 3000;


let app = express();


app.use(morgan('dev'));


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