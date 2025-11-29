import { Router } from "express";
import multer from "multer";
import { updateProfilePicture } from "../controllers/profile.controller.js";
import { updateProfile } from "../controllers/profile.controller.js"; 
import { verifyToken } from "../middlewares/verifyToken.js"; // si ya tienes middleware

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Ruta para actualizar datos de perfil (nombre y teléfono)
router.put("/update-profile", verifyToken, updateProfile);

// Ruta para subir imagen de perfil
router.post("/upload-profile", verifyToken, upload.single("profile"), updateProfilePicture);

export default router;
