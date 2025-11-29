import { pool } from "../db.js";

export const updateProfilePicture = async (req, res) => {
  const userId = req.user.id;
  const imagePath = req.file.filename;

  try {
    await pool.query("UPDATE users SET profile_picture = ? WHERE id = ?", [imagePath, userId]);
    res.json({ message: "Foto de perfil actualizada", image: imagePath });
  } catch (err) {
    console.error("Error al subir imagen:", err);
    res.status(500).json({ message: "Error al guardar imagen" });
  }
};
