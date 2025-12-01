import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "parrilla_azteca",
    upload_preset: "unsigned_preset"
  }
});

export const upload = multer({ storage });
