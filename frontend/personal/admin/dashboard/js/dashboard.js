// ===============================================
// PROTECCIÓN CONTRA BACK NAVIGATION (bfcache)
// ===============================================
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // La página está siendo restaurada desde caché
    localStorage.clear();
    window.location.replace("/login/login.html");
  }
});

// ===============================================
// VALIDACIÓN DE SESIÓN AL CARGAR
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user || user.role !== "admin") {
    window.location.replace("/login/login.html");
    return;
  }
});

// ===============================================
// TOGGLE SIDEBAR + MODO OSCURO
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".menu-dashboard");
  const toggle = document.querySelector(".toggle");
  const toggleIcon = toggle ? toggle.querySelector("i") : null;

  if (!sidebar) {
    console.error("❌ No se encontró .menu-dashboard");
    return;
  }

  if (!toggle) {
    console.error("❌ No se encontró .toggle");
    return;
  }

  // === Toggle del sidebar ===
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");

    if (toggleIcon) {
      if (sidebar.classList.contains("open")) {
        toggleIcon.classList.remove("bx-menu");
        toggleIcon.classList.add("bx-x");
      } else {
        toggleIcon.classList.remove("bx-x");
        toggleIcon.classList.add("bx-menu");
      }
    }
  });

  // === Abrir sidebar al navegar entre enlaces ===
  const links = document.querySelectorAll(".menu .enlace");
  links.forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.add("open");
      if (toggleIcon) {
        toggleIcon.classList.remove("bx-menu");
        toggleIcon.classList.add("bx-x");
      }
    });
  });

  /* =========================
     TOGGLE MODO OSCURO ADMIN
     (misma lógica que en add-dishes)
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

      // avisar a otras partes (gráficas) que cambió el tema
      document.dispatchEvent(new CustomEvent("admin-theme-changed", {
        detail: { dark: nowDark }
      }));
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
// LOGOUT ADMIN CON MODAL BONITO (CLARO / OSCURO)
// =========================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("admin-dark");

    const modalBg      = isDark ? "#020617" : "#ffffff";
    const modalText    = isDark ? "#e5e7eb" : "#111827";
    const modalShadow  = isDark ? "0 8px 25px rgba(0,0,0,0.65)" : "0 8px 25px rgba(0,0,0,0.25)";

    const cancelBg     = isDark ? "#020617" : "#f9fafb";
    const cancelBorder = isDark ? "#1f2937" : "#e5e7eb";
    const cancelColor  = isDark ? "#e5e7eb" : "#111827";

    const confirmGradient = isDark
      ? "linear-gradient(90deg,#b91c1c,#f97316)"
      : "linear-gradient(90deg,#ef4444,#f97316)";

    const confirmShadow = isDark
      ? "0 0 0 rgba(0,0,0,0)"
      : "0 4px 12px rgba(0,0,0,0.25)";

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
        background: ${modalBg};
        color: ${modalText};
        padding: 22px 26px;
        border-radius: 14px;
        width: 320px;
        text-align: center;
        font-family: Poppins, system-ui, sans-serif;
        box-shadow: ${modalShadow};
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
            border: 1px solid ${cancelBorder};
            background: ${cancelBg};
            cursor: pointer;
            font-weight: 600;
            color: ${cancelColor};
          ">Cancelar</button>

          <button id="confirmLogout" style="
            padding: 8px 14px;
            border-radius: 999px;
            background: ${confirmGradient};
            color:#fff;
            border: none;
            cursor: pointer;
            font-weight: 600;
            box-shadow: ${confirmShadow};
          ">Salir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancelLogout").onclick = () => {
      modal.remove();
    };

    document.getElementById("confirmLogout").onclick = () => {
      // Limpieza completa de localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("preferredLanguage");
      localStorage.removeItem("admin-theme");
      localStorage.removeItem("admin-sidebar-open");

      const box = modal.querySelector("div");
      if (box) {
        box.innerHTML = `
          <p style="font-size:1rem; margin-bottom:12px; color:${modalText};">
            Cerrando sesión...
          </p>
        `;
      }

      setTimeout(() => {
        window.location.replace(getLoginUrl());
      }, 500);
    };
  });
}
