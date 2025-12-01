import { pool } from '../db.js';

// Crear un nuevo platillo
export const saveDish = async (req, res) => {
  try {
    // ACEPTA tanto español como inglés por si el front no quedó igual
    const nombre      = req.body.nombre      || req.body.name;
    const descripcion = req.body.descripcion || req.body.description;
    const precio      = req.body.precio      || req.body.price;
    const categoria   = req.body.categoria   || req.body.category;

    console.log('BODY recibido en /api/dishes:', req.body);
    console.log('FILE recibido en /api/dishes:', req.file);

    // Validación básica para evitar 500 tontos
    if (!nombre || !descripcion || !precio || !categoria) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        data: { nombre, descripcion, precio, categoria }
      });
    }

    // URL de la imagen (Cloudinary o donde la tengas configurada)
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
