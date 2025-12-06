import jwt from "jsonwebtoken";

export const authRequired = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Token requerido" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token no válido" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};
