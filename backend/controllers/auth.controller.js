import bcrypt from "bcryptjs";
import { pool } from "../db.js"; // Conexión a la base de datos

// Registro de usuario
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ msg: "Faltan datos" });
    }

    try {
        // Verificamos si el correo ya está registrado
        const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (exists.length > 0) {
            return res.status(409).json({ msg: "Correo ya registrado" });
        }

        // Hasheamos la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertamos el usuario en la base de datos
        await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ msg: "Usuario registrado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Login de usuario
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Faltan credenciales" });
    }

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ msg: "Credenciales incorrectas" });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ msg: "Credenciales incorrectas" });
        }

        // Aquí podrías generar un JWT y enviarlo al cliente si lo deseas
        res.status(200).json({ msg: "Login exitoso", user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};
