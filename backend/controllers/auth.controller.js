import { pool } from "../db.js";

export const getUsers = async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).send("Error retrieving users");
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length > 0) {
     
      return res.status(200).json({ message: "Login successful" });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Error logging in");
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Error registering user");
  }
};

export default { getUsers, login, register };
