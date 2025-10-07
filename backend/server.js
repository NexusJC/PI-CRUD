// ===== imports =====
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db.js";

// si usas .env local:
// import dotenv from "dotenv"; dotenv.config();

const app = express();

// ===== middlewares base (arriba) =====
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
  credentials: true,
}));

// ===== BLOQUE ESTÁTICO: pegar AQUÍ =====
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Servimos TODO el frontend
const FRONT_ROOT = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONT_ROOT));

// Home -> tu index en frontend/menu/index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONT_ROOT, "menu", "index.html"));
});

// (Opcional) catch-all para rutas no-API (útil si es SPA)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(FRONT_ROOT, "menu", "index.html"));
});
// ===== FIN BLOQUE ESTÁTICO =====

// ===== tus rutas API (DESPUÉS del bloque estático) =====
import authRouter from "./routes/auth.routes.js";
app.use("/api/auth", authRouter);

// ===== rutas de diagnóstico (pueden ir aquí o arriba) =====
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/ping-db", async (_req, res) => {
  try { const [r] = await pool.query("SELECT 1 AS ok"); res.json(r[0]); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== 404 y handler de errores (AL FINAL) =====
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== listen =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en :${PORT}`));
