import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectDB from "./config/db.js";
import authRoutes from "./routes/route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Necessary for form data

app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Routes
app.use("/rohan", authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
