import { Router } from "express";
import multer from "multer";
import { updateProfilePicture } from "../controllers/profile.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js"; // si ya tienes middleware
import { getProfile, updateProfileData, updateProfilePicture } from '../controllers/profile.controller.js';

const router = Router();


// Ruta para obtener los datos del perfil
router.get("/", verifyToken, getProfile); // CORRECTO: ya está importado getProfile

// Ruta para actualizar los datos del perfil
router.put("/", verifyToken, updateProfileData);

// Ruta para subir imagen de perfil
router.post("/upload-profile", verifyToken, upload.single("profile"), updateProfilePicture);

export default router;

