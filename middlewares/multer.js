import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the upload directory exists



// Storage Configuration (for saving files on the server)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the upload directory
    cb(null, "public/upload-image");
  },
  filename: (req, file, cb) => {
    // Set the file name (with timestamp for uniqueness)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
 const  upload=multer({storage:storage})

 export default upload
