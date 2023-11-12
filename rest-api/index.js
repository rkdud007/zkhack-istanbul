const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require('dotenv').config();
const config = require('./config');

/// REST-API CONFIG
const PORT = process.env.PORT || 5001

const app = express();


/// DB CONNECTION
const mongoString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qmdgalj.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(mongoString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

mongoose.connection.on("error", (error) => {
    if (process.env.NODE_ENV === "development") {
        console.log(error)
    }
});

mongoose.connection.on("open", () => {
    console.log("Connected to MongoDB database.")
});


/// REST-API CONFIG
app.enable('trust proxy');
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", config.productionWebsiteUrl);
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

app.use(helmet());

app.use(cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : config.productionWebsiteUrl,
    credentials: true
}));


/// PARSER
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());


/// ROUTES
app.get("/", (_, res) => res.send("rest-api is working, kel!")); // debugger

app.use(require("./routes/users/index.js"));
app.use(require("./routes/items/index.js"));
app.use(require("./routes/comments/index.js"));
app.use(require("./routes/moderation/index.js"));
app.use(require('./routes/discord/index.js'));


/// RUN SERVER
app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
});
