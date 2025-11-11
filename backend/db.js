import mysql from "mysql2/promise";

function fromUrl(urlStr) {
  const u = new URL(urlStr);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username || "root"),
    password: decodeURIComponent(u.password || ""),
    database: u.pathname.replace(/^\//, "") || "railway"
  };
}
function fromDiscreteEnv() {
  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || "root",
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || "railway"
  };
}

const cfg = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL
  ? fromUrl(process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL)
  : fromDiscreteEnv();

export const pool = mysql.createPool({
  ...cfg,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
