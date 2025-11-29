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

// profile.controller.js

// Función para obtener los datos del perfil
export const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [user] = await pool.query('SELECT name, telefono, email, gender, profile_picture FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user[0]); // Devuelve los datos del perfil
  } catch (err) {
    console.error('Error al obtener los datos del perfil:', err);
    res.status(500).json({ message: 'Error al obtener los datos del perfil' });
  }
};

// Función para actualizar los datos del perfil
export const updateProfileData = async (req, res) => {
  const userId = req.user.id;
  const { name, telefono, gender } = req.body; // Recibir los datos

  try {
    await pool.query("UPDATE users SET name = ?, telefono = ?, gender = ? WHERE id = ?", [name, telefono, gender, userId]);
    res.json({ message: "Datos de perfil actualizados correctamente" });
  } catch (err) {
    console.error("Error al actualizar los datos del perfil:", err);
    res.status(500).json({ message: "Error al actualizar los datos del perfil" });
  }
};