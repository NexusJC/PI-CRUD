// admin_theme.js
// Control de sidebar + modo oscuro solo para vistas de admin

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     TOGGLE SIDEBAR ADMIN
  ========================= */
  const sidebar       = document.getElementById("adminSidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (sidebar && sidebarToggle) {
    const toggleIcon = sidebarToggle.querySelector("i");

    // Cargar estado guardado del sidebar
    const savedSidebar = localStorage.getItem("admin-sidebar-open");

    const setSidebarState = (isOpen) => {
      // open / collapsed
      sidebar.classList.toggle("open", isOpen);
      sidebar.classList.toggle("collapsed", !isOpen);

      // atributo accesibilidad
      sidebarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

      // icono del botón hamburguesa
      if (toggleIcon) {
        if (isOpen) {
          toggleIcon.classList.remove("bx-menu-alt-right");
          toggleIcon.classList.add("bx-menu");
        } else {
          toggleIcon.classList.remove("bx-menu");
          toggleIcon.classList.add("bx-menu-alt-right");
        }
      }

      // guardar estado
      localStorage.setItem("admin-sidebar-open", isOpen ? "1" : "0");
    };

    // Estado inicial
    if (savedSidebar === "0") {
      setSidebarState(false); // cerrado
    } else {
      setSidebarState(true);  // abierto por defecto
    }

    // Click en botón hamburguesa
    sidebarToggle.addEventListener("click", () => {
      const isOpenNow = sidebar.classList.contains("open");
      setSidebarState(!isOpenNow);
    });
  }

  /* =========================
     TOGGLE MODO OSCURO ADMIN
  ========================= */
  const themeToggle = document.getElementById("adminThemeToggle");
  const icon  = themeToggle?.querySelector("i");
  const text  = themeToggle?.querySelector("span");

  // cargar preferencia previa
  const savedTheme = localStorage.getItem("admin-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("admin-dark");
    if (icon) icon.classList.replace("bx-moon", "bx-sun");
    if (text) text.textContent = "Modo claro";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nowDark = document.body.classList.toggle("admin-dark");
      localStorage.setItem("admin-theme", nowDark ? "dark" : "light");

      if (icon && text) {
        if (nowDark) {
          icon.classList.replace("bx-moon", "bx-sun");
          text.textContent = "Modo claro";
        } else {
          icon.classList.replace("bx-sun", "bx-moon");
          text.textContent = "Modo oscuro";
        }
      }
    });
  }
});

// =========================
// SESIÓN / LOGOUT ADMIN (fusionado)
// =========================
function getLoginUrl() {
  const isLocal =
    location.hostname === "127.0.0.1" ||
    location.hostname === "localhost";

  // misma ruta que usas en index/admin
  return isLocal ? "../../../login/login.html" : "/login/login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg = document.getElementById("sidebarUserImg");

// Leer user de localStorage de forma segura
function readCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error parseando user de localStorage:", e);
    return null;
  }
}

// Verificar que exista sesión de admin
function ensureAdminSession() {
  const token = localStorage.getItem("token");
  const user = readCurrentUser();

  if (!token || !user || user.role !== "admin") {
    // replace para que el botón "atrás" no vuelva a esta página
    window.location.replace(getLoginUrl());
    return null;
  }

  return user;
}

// 🔒 Comprobación inicial al cargar la página
const currentUser = ensureAdminSession();

// Pintar datos del usuario en el sidebar
if (currentUser && sidebarUserName) {
  sidebarUserName.textContent = currentUser.name || "Usuario";

  if (currentUser.profile_picture && sidebarUserImg) {
    // misma lógica que en el index/admin
    sidebarUserImg.src = "/uploads/" + currentUser.profile_picture;
  }
}

// 🔁 Proteger también al usar el botón "atrás" del navegador (bfcache)
window.addEventListener("pageshow", (event) => {
  // event.persisted === true → viene del caché del navegador
  if (event.persisted) {
    const token = localStorage.getItem("token");
    const user = readCurrentUser();

    if (!token || !user || user.role !== "admin") {
      window.location.replace(getLoginUrl());
    }
  }
});

// =========================
// LOGOUT ADMIN CON MODAL BONITO
// =========================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Crear overlay del modal
    const modal = document.createElement("div");
    modal.id = "logoutConfirmModal";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(0,0,0,0.55)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
      <div style="
        background: #fff;
        padding: 22px 26px;
        border-radius: 14px;
        width: 320px;
        text-align: center;
        font-family: Poppins, system-ui, sans-serif;
        box-shadow: 0 8px 25px rgba(0,0,0,0.25);
      ">
        <h3 style="margin: 0 0 10px; font-size: 1.1rem; font-weight: 700;">
          Cerrar sesión
        </h3>
        <p style="margin: 0 0 18px; font-size: 0.92rem;">
          ¿Seguro que deseas cerrar tu sesión?
        </p>

        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="cancelLogout" style="
            padding: 8px 14px;
            border-radius: 999px;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            cursor: pointer;
            font-weight: 600;
          ">Cancelar</button>

          <button id="confirmLogout" style="
            padding: 8px 14px;
            border-radius: 999px;
            background: linear-gradient(90deg,#ef4444,#f97316);
            color:#fff;
            border: none;
            cursor: pointer;
            font-weight: 600;
          ">Salir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // ❌ Cancelar → solo cerrar modal
    document.getElementById("cancelLogout").onclick = () => {
      modal.remove();
    };

    // ✅ Confirmar → limpiar sesión + redirigir
    document.getElementById("confirmLogout").onclick = () => {
      // Limpieza completa de localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("preferredLanguage");
      localStorage.removeItem("admin-theme");
      localStorage.removeItem("admin-sidebar-open");
      // Si usas sessionStorage en algo:
      // sessionStorage.clear();

      const box = modal.querySelector("div");
      if (box) {
        box.innerHTML = `
          <p style="font-size:1rem; margin-bottom:12px;">
            Cerrando sesión...
          </p>
        `;
      }

      setTimeout(() => {
        // replace para que el botón atrás no recupere esta página
        window.location.replace(getLoginUrl());
      }, 500);
    };
  });
}
