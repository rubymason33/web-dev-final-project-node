import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from './Kambaz/Assignments/routes.js';

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING
mongoose.connect(CONNECTION_STRING);

const app = express();

// configure for branch deploys
const allowedOrigins = [
    process.env.NETLIFY_URL,
    'http://localhost:5173',
];

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
        return callback(null, true);
        } else {
        return callback(new Error("Not allowed by CORS"));
        }
    }
}));

// app.use(cors({
//     credentials: true,
//     origin: process.env.NETLIFY_URL || "http://localhost:5173",
//     })
// );
const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
};
if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
        secure: true,
        domain: process.env.NODE_SERVER_DOMAIN,
    };
}
app.use(session(sessionOptions));
app.use(express.json());
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
app.listen(process.env.PORT || 4000);