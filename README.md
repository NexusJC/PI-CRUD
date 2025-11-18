# 🌮 La Parrilla Azteca · PI-CRUD

Sistema web tipo CRUD para la gestión completa de un restaurante mexicano: turnos, órdenes, platillos, empleados, cajas y usuarios.

---

## 🧾 Descripción

**La Parrilla Azteca** es una aplicación web desarrollada como parte de un proyecto académico que simula el funcionamiento de un sistema de gestión de restaurante. Permite a clientes ver el menú y a administradores agregar platillos, gestionar empleados y monitorear el estado de la caja.

---

## 🚀 Tecnologías utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **Base de datos**: MySQL (Railway)
- **Middleware**: Multer (para subida de imágenes)
- **Despliegue**: Railway
- **Control de versiones**: Git + GitHub

---

## 📁 Estructura del proyecto

```bash
PI-CRUD/
├── backend/                # API REST y lógica de servidor
│   ├── controllers/        # Controladores como dishes.controller.js
│   ├── routes/             # Rutas como dishes.route.js
│   ├── middlewares/        # Uploads (Multer)
│   └── db.js               # Conexión MySQL
├── frontend/               # Interfaz del cliente
│   ├── menu/               # Menú dinámico
│   ├── login/              # Login/Register
│   └── personal/           # Panel administrador (add_dishes, empleados, etc.)
├── uploads/                # Carpeta para imágenes subidas
├── package.json            # Dependencias
├── Procfile                # Config Railway
└── README.md
