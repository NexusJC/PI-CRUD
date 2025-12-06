import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import dashboardRoutes from "./routes/dashboard.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import dishesRoutes from "./routes/dishes.route.js";
import authRouter from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import usersRouter from "./routes/users.routes.js";
import cajasRoutes from "./routes/cajas.routes.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["https://www.laparrilaazteca.online"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/dishes", dishesRoutes);
app.use("/api/users", usersRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api", cajasRoutes);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONT_ROOT = path.join(__dirname, "..", "frontend");

app.use(express.static(FRONT_ROOT));
app.use("/menu", express.static(path.join(FRONT_ROOT, "menu")));
app.use("/personal", express.static(path.join(FRONT_ROOT, "personal")));
app.use("/login", express.static(path.join(FRONT_ROOT, "login")));
app.use("/perfil", express.static(path.join(FRONT_ROOT, "perfil")));

app.get("/", (_req, res) => res.redirect(302, "/menu/"));

const testDbConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log("Conexión con la base de datos exitosa:", rows[0].ok);
  } catch (e) {
    console.error("Error DB:", e.message);
    process.exit(1);
  }
};

testDbConnection();

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en :${PORT}`));

export default app;

