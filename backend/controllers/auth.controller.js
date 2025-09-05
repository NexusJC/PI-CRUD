const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos' });
    }

    const [existe] = await pool.query('SELECT id FROM users WHERE correo=?', [correo]);
    if (existe.length) {
      return res.status(409).json({ ok: false, msg: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (nombre, correo, `contraseña`, rol) VALUES (?,?,?,?)',
      [nombre, correo, hash, 'normal']
    );

    res.json({ ok: true, msg: 'Usuario registrado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE correo=? LIMIT 1',
      [correo]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.contraseña);

    if (!match) {
      return res.status(401).json({ ok: false, msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '8h' }
    );

    res.json({ ok: true, token, user: { id: user.id, nombre: user.nombre, correo: user.correo } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};
