import { pool } from '../db.js';

// Crear un nuevo platillo - ahora usando Cloudinary
export const saveDish = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria } = req.body;

    // URL final de Cloudinary
    const imageUrl = req.file?.path || null;

    const sql = `
      INSERT INTO platillos (nombre, descripcion, precio, categoria, imagen)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [nombre, descripcion, precio, categoria, imageUrl]);

    res.json({
      message: 'Dish saved successfully',
      image: imageUrl
    });

  } catch (err) {
    console.error('Error saving dish:', err);
    res.status(500).json({ message: 'Error saving dish' });
  } 
};

// Obtener todos los platillos
export const getAllDishes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM platillos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ message: 'Error fetching dishes' });
  }
};

// Borrar platillo
export const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM platillos WHERE id = ?', [id]);
    res.json({ message: 'Dish deleted successfully' });
  } catch (err) {
    console.error('Error deleting dish:', err);
    res.status(500).json({ message: 'Error deleting dish' });
  }
};
