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

// Ruta para obtener los datos del perfil del usuario
router.get("/get-profile", verifyToken, async (req, res) => {
  const userId = req.user.id; // Tomamos el ID del usuario desde el token
  try {
    const [rows] = await pool.query("SELECT name, email, telefono, gender, profile_picture FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(rows[0]);  // Devolvemos los datos del perfil
  } catch (error) {
    console.error("Error obteniendo el perfil:", error);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
});

export default router;
