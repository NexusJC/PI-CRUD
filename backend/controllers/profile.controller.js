import { pool } from "../db.js";

export const updateProfileCloudinary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ message: "Falta image_url" });
    }

    await pool.query(
      "UPDATE users SET image_url = ? WHERE id = ?",
      [image_url, userId]
    );

    return res.json({
      message: "Imagen de perfil actualizada correctamente",
      image_url
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la imagen" });
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