import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.routes.js";

// Conectar con la base de datos antes de iniciar el servidor
const testDbConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log("Conexión con la base de datos exitosa:", rows[0].ok);
  } catch (e) {
    console.error("Error de conexión a la base de datos:", e.message);
    process.exit(1);  // Detener el servidor si la base de datos no está disponible
  }
};

testDbConnection();  // Probar la conexión a la base de datos antes de iniciar el servidor

const app = express();
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONT_ROOT = path.join(__dirname, "..", "frontend");

app.use(express.static(FRONT_ROOT));
app.use("/menu", express.static(path.join(FRONT_ROOT, "menu")));
app.get("/", (_req, res) => res.redirect(302, "/menu/"));
app.get("/health", (_req, res) => res.status(200).send("ok"));

app.get("/ping-db", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Usar las rutas de autenticación
app.use("/api/auth", authRouter);

// Manejo de rutas no encontradas
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en :${PORT}`));

export default app;
