import { Router } from "express";
import { pool } from "../db.js";
import { getUsers, login, register,resetPassword } from "../controllers/auth.controller.js";

const router = Router();

// ruta para obtener todos los usuarios
router.get("/users", getUsers);

// ruta para el inicio de sesión
router.post("/login", login);

// ruta para el registro de nuevos usuarios
router.post("/register", register);

// ruta para el reestablecimiento de contraseña
router.post("/reset-password", resetPassword);

// ruta para verificar correo electrónico
router.get("/verify", async (req, res) => {
  const { token } = req.query;

  try {
    // Buscar el token en la BD
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE verification_token = ?",
      [token]
    );

    if (rows.length === 0) {
      return res.send(`
        <h2 style="font-family:Arial;text-align:center;color:#b30000;">
           Enlace inválido o expirado
        </h2>
      `);
    }
//papoi?
    const user = rows[0];

    // Marcar como verificado
    await pool.query(
      "UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?",
      [user.id]
    );

    // Página de confirmación
    return res.send(`
      <div style="font-family:Arial; text-align:center; padding:50px;">
        <h2 style="color:#27ae60;"> Tu correo ha sido verificado</h2>
        <p>Ya puedes iniciar sesión con tu cuenta.</p>

        <a href="/login/login.html"
          style="padding:12px 22px; background:#e36842; color:white; 
                 text-decoration:none; border-radius:6px; font-size:17px;">
          Ir al inicio de sesión
        </a>
      </div>
    `);

  } catch (err) {
    console.error("Error verifying email:", err);
    return res.send(`
      <h2 style="font-family:Arial;text-align:center;color:#b30000;">
        ⚠ Error interno del servidor
      </h2>
    `);
  }
});
export default router;
