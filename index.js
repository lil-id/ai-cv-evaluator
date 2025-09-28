import http from "http";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import bodyParser from "body-parser";
import logger from "./utils/logger/logger.js";
import morganMiddleware from "./middlewares/morganMiddleware.js";
import routes from "./routes/index.js";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    process.env.ALLOWED_ORIGIN || "http://localhost:3000",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const err = new Error("Not allowed by CORS");
                logger.error(err);
                return callback(err, false);
            }
            callback(null, true);
        },
    })
);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morganMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);

routes(app);

server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

server.on("error", (error) => {
    logger.error(`Error occurred: ${error.message}`);
});