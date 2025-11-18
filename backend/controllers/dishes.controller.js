const db = require('../db');

// Crear un nuevo platillo
const saveDish = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
      INSERT INTO platillos (nombre, descripcion, precio, categoria, imagen)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [name, description, price, category, image]);

    res.json({ message: 'Dish saved successfully' });
  } catch (err) {
    console.error('Error saving dish:', err);
    res.status(500).json({ message: 'Error saving dish' });
  }
};

// Obtener todos los platillos
const getAllDishes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM platillos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ message: 'Error fetching dishes' });
  }
};

module.exports = {
  saveDish,
  getAllDishes
};
