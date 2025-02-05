import express from "express";
import fs from "fs";
import bcrypt from "bcryptjs";

import { registerUser, verifyUserWithOTP } from "../controller/user.js";
import User from "../models/User.js";
import { generateToken } from "../middlewares/jwt.js";
import authenticate from "../middlewares/auth.js";
import  upload  from "../middlewares/multer.js";
import UploadFileOnCloudinary from "../config/cloudinary.js";

const router = express.Router();

// Signup Route
router.post("/signup", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { email,name,phone,password } = req?.body;
    const file = req.file;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (file) fs.unlinkSync(file.path); // Delete uploaded file
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Validate file upload
    if (!file) {
      return res.status(400).json({ success: false, message: "Profile photo is required" });
    }

    // Upload file to Cloudinary
    const cloudinaryResponse = await UploadFileOnCloudinary(file.path);
    if (!cloudinaryResponse.success) {
      fs.unlinkSync(file.path); // Remove local file if upload fails
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
        error: cloudinaryResponse.error,
      });
    }

    const newUser = {
      name,
      phone,
      password,
      email,
      profileImageUrl: cloudinaryResponse.url,
      profileImgPublicId: cloudinaryResponse.public_id,
    };

    const createUserResponse = await registerUser(newUser);

    if (!createUserResponse.success) {
      return res.status(400).json({ success: false, message: createUserResponse.message });
    }

    res.status(201).json({
      success: true,
      message: createUserResponse.message,
      data: createUserResponse.user,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const result = await verifyUserWithOTP({ email, otp });
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Generate JWT token
    const token = generateToken(result.data);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    console.error("OTP Verification error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    // Generate JWT token
    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Protected Route
router.get("/protectedRoute", authenticate, (req, res) => {
  res.status(200).json({ message: "Access granted to protected route", user: req.user });
});

export default router;
