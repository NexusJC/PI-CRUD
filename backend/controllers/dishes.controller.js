import { pool } from '../db.js';

// Crear un nuevo platillo (imagen ya viene como URL desde el front)
export const saveDish = async (req, res) => {
  try {
    console.log('Datos recibidos en /api/dishes:', req.body);

    const {
      nombre,
      descripcion,
      precio,
      categoria,
      imagen   // URL de Cloudinary
    } = req.body;

    // Validación básica
    if (!nombre || !descripcion || !precio || !categoria || !imagen) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        data: { nombre, descripcion, precio, categoria, imagen }
      });
    }

    const sql = `
      INSERT INTO platillos (nombre, descripcion, precio, categoria, imagen)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [nombre, descripcion, precio, categoria, imagen]);

    res.json({ message: 'Dish saved successfully' });
  } catch (err) {
    console.error('Error saving dish:', err);
    res.status(500).json({ message: 'Error saving dish', error: err.message });
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
