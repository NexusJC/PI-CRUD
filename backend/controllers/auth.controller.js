const bcrypt = require('bcrypt');
const pool = require('../db');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email y password son obligatorios' });
    }

    // ¿email ya existe?
    const [exists] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (exists.length) return res.status(409).json({ error: 'Ese correo ya está registrado' });

    const hash = await bcrypt.hash(password, 10);

    // role es opcional; por defecto 'usuario' según tu tabla
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?, COALESCE(?, DEFAULT(role)))',
      [name, email, hash, role ?? null]
    );

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
