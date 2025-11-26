import bcrypt from "bcrypt";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";
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

// Inicio de sesión
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Verificar que el correo esté confirmado
    if (!user.email_verified) {
      return res.status(403).json({
        message: "Debes confirmar tu correo antes de iniciar sesión."
      });
    }

    // Generar token JWT
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
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Registrar usuario + enviar correo de verificación
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1) Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2) Generar token de verificación
    const verificationToken = crypto.randomBytes(40).toString("hex");

    // 3) Insertar usuario con token y email_verified = 0
    await pool.query(
      "INSERT INTO users (name, email, password, verification_token, email_verified) VALUES (?, ?, ?, ?, 0)",
      [name, email, hashedPassword, verificationToken]
    );

    // 4) URL de verificación
    const verifyURL = `https://laparrillaazteca.online/api/auth/verify?token=${verificationToken}`;

    // 5) Configuración de Nodemailer (Brevo, como ya usas en forgotPassword)
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER, // SMTP user
        pass: process.env.MAIL_PASS  // SMTP password
      }
    });

    // 6) Enviar correo HTML
    await transporter.sendMail({
      from: `"La Parrilla Azteca" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Confirma tu correo — La Parrilla Azteca",
      html: `
        <div style="font-family: Arial; text-align:center; background:#f5f0e9; padding:40px; border-radius:10px;">
          <img src="https://laparrillaazteca.online/img/logo_1.png" width="120" alt="La Parrilla Azteca"/>
          <h2 style="color:#e36842;">Confirma tu cuenta</h2>
          <p>Gracias por registrarte en <b>La Parrilla Azteca</b>.</p>
          <p>Haz clic en el siguiente botón para activar tu cuenta:</p>

          <a href="${verifyURL}"
            style="background:#e36842;color:white;padding:14px 28px;
            text-decoration:none;border-radius:6px;font-size:18px; display:inline-block; margin-top:20px;">
            Confirmar mi correo
          </a>

          <p style="margin-top:30px;font-size:14px;color:#333;">
            Si no solicitaste esta cuenta, ignora este correo.
          </p>
        </div>
      `
    });

    res.status(201).json({
      message: "Usuario registrado. Revisa tu correo para confirmar la cuenta."
    });

  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Error registering user" });
  }
};

// 1) Solicitar recuperación por correo
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

    // configuracion de nodemailer (Brevo)
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
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
// 2) Establecer nueva contraseña
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

export default { 
  getUsers, 
  login, 
  register, 
  forgotPassword, 
  resetPassword 
};
