import fs from "fs" ;
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();


//to upload the image ont he cloudinary
// Configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// console.log("envv",process.env.CLOUDINARY_SECRET_KEY)

const UploadFileOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    console.log("localpath", localFilePath);
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "profile-images",
    });
    console.log("file upload", response.secure_url); // file path retrun karta hai respopnse url uploaded file ka
    fs.unlinkSync(localFilePath); // remove the localfilepath
    return {
      success: true,
      url: response.secure_url, // Uploaded file's URL
      public_id: response.public_id, // Cloudinary file ID
    };
  } catch (error) {
    // remove the locally saved temopory file as the upload operation got faild
    fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload error:", error.message);
    return { success: false, error: error.message };
  }
};

export default UploadFileOnCloudinary;
