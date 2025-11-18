import { pool } from '../db.js';

// Crear un nuevo platillo
export const saveDish = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
      INSERT INTO platillos (nombre, descripcion, precio, categoria, imagen)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [name, description, price, category, image]);

    res.json({ message: 'Dish saved successfully' });
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
