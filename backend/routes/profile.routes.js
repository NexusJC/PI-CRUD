import { Router } from "express";
import multer from "multer";
import { updateProfilePicture } from "../controllers/profile.controller.js";
import { updateProfile } from "../controllers/profile.controller.js"; 
import { verifyToken } from "../middlewares/verifyToken.js"; // si ya tienes middleware
import { pool } from "../db.js";

const router = Router();


const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ruta para actualizar datos
router.put("/update-profile", verifyToken, updateProfile);

// ruta para imagen
router.post("/upload-profile", verifyToken, upload.single("profile"), updateProfilePicture);

// ruta para obtener perfil
router.get("/get-profile", verifyToken, async (req, res) => {
  const { id } = req.user;

  try {
    const [rows] = await pool.query(
      "SELECT name, email, telefono, gender, profile_picture FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
});

export default router;