import { verifyToken } from "./jwt.js";

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized Access" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};
export default authenticate
