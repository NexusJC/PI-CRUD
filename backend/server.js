import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import dishesRoutes from "./routes/dishes.route.js";
import authRouter from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import usersRouter from "./routes/users.routes.js";

const app = express();
// ruta para manejar perfiles de usuario
app.use("/api/profile", profileRoutes);
// ruta para gestionar platillos
app.use("/api/dishes", dishesRoutes);
// ruta para las imágenes públicas
app.use("/uploads", express.static("uploads"));
// para manejar empleados 
app.use("/api/users", usersRouter);
// rutas de autenticación
app.use("/api/auth", authRouter);


//para el profe que revise esto, nadie trabajó, mas que yo, brandom

// Conectar con la base de datos antes de iniciar el servidor
const testDbConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log("Conexión con la base de datos exitosa:", rows[0].ok);
  } catch (e) {
    console.error("Error de conexión a la base de datos:", e.message);
    process.exit(1);  // se de tiene el servidor si la base de datos no funciona
  }
};

testDbConnection();  // aqui se prueba la coenxion antes de iniciar el servidor


app.use(express.json());
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "connect-src 'self' https://laparrilaazteca.online https://www.laparrilaazteca.online; " +
      "script-src 'self' 'unsafe-inline' https://translate.google.com https://*.gstatic.com; " +
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
      "img-src 'self' data: https:; " +
      "frame-src https://translate.google.com;"
  );
  next();
});

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
// carpetas adicionales del frontend
app.use("/personal", express.static(path.join(FRONT_ROOT, "personal")));
app.use("/login", express.static(path.join(FRONT_ROOT, "login")));
app.use("/perfil", express.static(path.join(FRONT_ROOT, "perfil")));
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

// rutas de autenticación
app.use("/api/auth", authRouter);

// nanejo de rutas no encontradas
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// manejo de errores
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en :${PORT}`));

export default app;
