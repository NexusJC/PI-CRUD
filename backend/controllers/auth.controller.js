import bcrypt from "bcrypt";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import SibApiV3Sdk from "sib-api-v3-sdk";

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
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(40).toString("hex");

    // Insertar usuario
    await pool.query(
      "INSERT INTO users (name, email, password, verification_token, email_verified) VALUES (?, ?, ?, ?, 0)",
      [name, email, hashedPassword, verificationToken]
    );

    // URL de verificación
    const verifyURL = `https://www.laparrilaazteca.online/api/auth/verify?token=${verificationToken}`;

    // CONFIG BREVO API
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // ENVIAR EMAIL CON API
    await apiInstance.sendTransacEmail({
      sender: {
        name: "La Parrilla Azteca",
        email: "jacobocisnerosbrandomyair@gmail.com" // remitente verificado en Brevo
      },
      to: [{ email }],
      subject: "Confirma tu correo — La Parrilla Azteca",
      htmlContent: `
        <div style="font-family: Arial; text-align:center; background:#f5f0e9; padding:40px; border-radius:10px;">
          <img src="https://www.laparrilaazteca.online/img/logo_1.png" width="120"/>
          <h2 style="color:#e36842;">Confirma tu cuenta</h2>
          <p>Gracias por registrarte en <b>La Parrilla Azteca</b>.</p>
          <p>Haz clic en el siguiente botón para activar tu cuenta:</p>

          <a href="${verifyURL}"
            style="background:#e36842;color:white;padding:14px 28px;
            text-decoration:none;border-radius:6px;font-size:18px;
            display:inline-block;margin-top:20px;">
            Confirmar mi correo
          </a>

          <br><br>
          <small>Si no solicitaste esta cuenta, ignora este correo.</small>
        </div>
      `
    });

    res.status(201).json({
      message: "Usuario registrado. Revisa tu correo."
    });

  } catch (err) {
    console.error("Error registering user:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    return res.status(500).json({
      error: err.message || "Error registrando usuario"
    });
  }
};

// Resetear contraseña
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Buscar token en la base de datos
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpire > NOW()",
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }

        const user = rows[0];

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar contraseña y borrar el token
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
  resetPassword 
};
