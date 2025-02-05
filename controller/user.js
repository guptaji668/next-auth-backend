import User from "../models/User.js";
import { generateOtp } from "../middlewares/otp.js";

import connectDB from "../config/db.js";
import { hashPassword } from "../middlewares/hashpassord.js";
import sendOtpEmail  from "../middlewares/mailer.js";

export const registerUser = async (newUser) => {
  await connectDB();
  const { name, email, phone, password } = newUser

  try {
    const hashedPassword = await hashPassword(password);
    const otp = generateOtp();

    await sendOtpEmail(email, otp);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      isVerified: false,
    });

    return({
      success: true,
      message: "OTP sent to your email. Verify to complete signup.",
      user: newUser,
    });
  } catch (error) {
    return({ success: false, message: "Error", error: error.message });
  }
};

export const verifyUserWithOTP = async ({ email, otp }) => {

  try {
    const user = await User.findOne({ email });
    if (!user) return ({ success: false, message: "User not found" });

    if (user.otp !== otp) {
      return ({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    return({ success: true, message: "User verified successfully", user });
  } catch (error) {
    return({ success: false, message: "Internal server error", error: error.message });
  }
};
