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

export const updateProfile = async (req, res) => {
  const { name, telefono, gender } = req.body;
  const userId = req.user.id; // Tomamos el id del usuario logueado

  try {
    await pool.query(
      'UPDATE users SET name = ?, telefono = ?, gender = ? WHERE id = ?',
      [name, telefono, gender, userId]
    );
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};