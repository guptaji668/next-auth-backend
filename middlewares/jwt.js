import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;

export const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
