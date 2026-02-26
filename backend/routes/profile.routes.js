import { Router } from "express";
import multer from "multer";
import { updateProfileCloudinary } from "../controllers/profile.controller.js";
import { updateProfile } from "../controllers/profile.controller.js"; 
import { verifyToken } from "../middlewares/verifyToken.js";
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

router.put("/update-profile", verifyToken, updateProfile);

router.put("/update-profile-image", verifyToken, updateProfileCloudinary);

router.get("/get-profile", verifyToken, async (req, res) => {
  const { id } = req.user;

  try {
    const [rows] = await pool.query(
      "SELECT name, email, telefono, gender, image_url FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    res.json(user);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
});

export default router;