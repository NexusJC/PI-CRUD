import bcrypt from 'bcrypt';
import { pool } from "../db.js";
import jwt from 'jsonwebtoken';

// Obtener todos los usuarios
export const getUsers = async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).send("Error retrieving users");
  }
};

// inicio de sesion
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "2h" }
        );

        return res.status(200).json({
          message: "Login exitoso",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } else {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
    }

    res.status(401).json({ message: "Usuario no encontrado" });
  } catch (err) {
  console.error("Error logging in:", err);  
  res.status(500).json({ message: "Error en el servidor" });
}
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // encriptacion de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Error registering user" });
  }
};

export default { getUsers, login, register };
