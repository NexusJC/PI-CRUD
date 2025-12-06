import { pool } from '../db.js';

// ==========================================================
//  CREAR PLATILLO
// ==========================================================
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

// ==========================================================
//  OBTENER TODOS LOS PLATILLOS
// ==========================================================
export const getAllDishes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM platillos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ message: 'Error fetching dishes' });
  }
};

// ==========================================================
//  ELIMINAR PLATILLO
// ==========================================================
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

// ==========================================================
//  ACTUALIZAR PLATILLO (CORRECCIÓN COMPLETA)
// ==========================================================
export const updateDish = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      categoria,
      imagen // puede ser nueva o la anterior
    } = req.body;

    if (!nombre || !descripcion || !precio || !categoria || !imagen) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
        data: { nombre, descripcion, precio, categoria, imagen }
      });
    }

    const sql = `
      UPDATE platillos
      SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, imagen = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      nombre,
      descripcion,
      precio,
      categoria,
      imagen,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Platillo no encontrado" });
    }

    res.json({ message: "Dish updated successfully" });

  } catch (err) {
    console.error("Error updating dish:", err);
    res.status(500).json({
      message: "Error updating dish",
      error: err.message
    });
  }
};
