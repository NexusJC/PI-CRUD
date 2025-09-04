import bcrypt from "bcryptjs";
import { pool } from "../db.js"; // Conexión a la base de datos

// Registro de usuario
export const register = async (req, res) => {
    const { nombre, correo, contraseña, rol } = req.body;  // Usando los nuevos nombres

    if (!nombre || !correo || !contraseña || !rol) {
        return res.status(400).json({ msg: "Faltan datos" });
    }

    try {
        // Verificamos si el correo ya está registrado
        const [exists] = await pool.query("SELECT id FROM usuarios WHERE correo = ?", [correo]);
        if (exists.length > 0) {
            return res.status(409).json({ msg: "Correo ya registrado" });
        }

        // Hasheamos la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertamos el usuario en la base de datos
        await pool.query(
            "INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)",
            [nombre, correo, hashedPassword, rol]
        );

        res.status(201).json({ msg: "Usuario registrado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Login de usuario
export const login = async (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ msg: "Faltan credenciales" });
    }

    try {
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo=?", [correo]);
        if (rows.length === 0) {
            return res.status(401).json({ msg: "Credenciales incorrectas" });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(contraseña, user.contraseña);

        if (!validPassword) {
            return res.status(401).json({ msg: "Credenciales incorrectas" });
        }

        // Aquí podrías generar un JWT y enviarlo al cliente si lo deseas
        res.status(200).json({ msg: "Login exitoso", user: { id: user.id, nombre: user.nombre, rol: user.rol } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};
