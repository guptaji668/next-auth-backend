import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter =nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_HOST,
        pass:process.env.EMAIL_PASSWORD
    }
})

 const sendOtpEmail =async(email,otp)=>{
    const mailOptions={
        from:process.env.EMAIL_HOST,
        to: email,
        subject: "Welcome to My Authentication Application - Your OTP Code",
        text: `Hello,

        Welcome to My Authentication Application! We're excited to have you on board.
        
        To complete your authentication process, please use the OTP below:
        
        Your OTP is: ${otp}
        
        Thank you,
       
        `,
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response); // Logs the server's response
        return { success: true, message: "OTP Send on Your Email successfully" };
      } catch (error) {
        console.error("Error sending email:", error.message); // Logs the error
        return { success: false, message: "Failed to send email", error: error.message };
      }
    

}

 export default sendOtpEmail