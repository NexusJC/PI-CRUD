const db = require('../db'); 

const getUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Error retrieving users:', err);
      return res.status(500).send('Error retrieving users');
    }
    res.json(results);
  });
};

// Controlador para iniciar sesión
const login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        console.error('Error logging in:', err);
        return res.status(500).send('Error logging in');
      }

      if (results.length > 0) {
        // Aquí podrías generar un token JWT si es necesario
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  );
};

// Controlador para registrar un nuevo usuario
const register = (req, res) => {
  const { name, email, password } = req.body;

  // Aquí podrías agregar una validación de datos antes de insertar en la base de datos
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err, results) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).send('Error registering user');
      }
      res.status(201).json({ message: 'User registered successfully' });
    }
  );
};

// Exportar los controladores
module.exports = {
  getUsers,
  login,
  register
};
