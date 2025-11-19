import bcrypt from 'bcrypt';
import { pool } from "../db.js";
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import nodemailer from "nodemailer";

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
// -----------------------------
// 1) Solicitar recuperación por correo
// -----------------------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No existe un usuario con ese correo" });
    }

    const user = rows[0];

    // generar token
    const token = crypto.randomBytes(32).toString("hex");

    // guardar token y expiración (1 hora)
    await pool.query(
      "UPDATE users SET resetToken = ?, resetTokenExpire = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?",
      [token, user.id]
    );

    // enlace que va en el correo
    const link = `https://laparrillaazteca.online/login/new_password.html?token=${token}`;

    // configuracion de nodemailer
   const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER, // Username SMTP de Brevo
    pass: process.env.MAIL_PASS  // Contraseña SMTP de Brevo
  }
});


    // enviar correo
    await transporter.sendMail({
      from: `"La Parrilla Azteca" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Restablecer contraseña</h2>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${link}">${link}</a>
        <p>Este enlace expira en 1 hora.</p>
      `
    });

    res.json({ message: "Correo enviado. Revisa tu bandeja." });

  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};


// -----------------------------
// 2) Establecer nueva contraseña
// -----------------------------
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // buscar token en bd
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpire > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const user = rows[0];

    // encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // actualizar contraseña y borrar token
    await pool.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
export default { getUsers, login, register, forgotPassword, resetPassword};

