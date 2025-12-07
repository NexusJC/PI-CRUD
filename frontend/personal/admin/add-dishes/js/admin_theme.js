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

/* =========================
   LOGOUT ADMIN
========================= */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {

    // Crear modal de confirmación
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
        font-family: Poppins;
        box-shadow: 0 8px 25px rgba(0,0,0,0.25);
      ">
        <h3 style="margin: 0 0 10px; font-size: 1.1rem; font-weight: 700;">Cerrar sesión</h3>
        <p style="margin: 0 0 18px; font-size: 0.92rem;">
          ¿Seguro que deseas cerrar tu sesión?
        </p>

        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="cancelLogout" style="
            padding: 8px 14px;
            border-radius: 999px;
            border: 1px solid #ccc;
            background: #f8f8f8;
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

    // Botón cancelar → cerrar modal
    document.getElementById("cancelLogout").onclick = () => {
      modal.remove();
    };

    // Botón confirmar → limpiar sesión + redirigir
    document.getElementById("confirmLogout").onclick = () => {

      // Limpieza completa
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("preferredLanguage");
      localStorage.removeItem("admin-theme");
      localStorage.removeItem("admin-sidebar-open");

      // Mensaje suave antes de irse
      modal.querySelector("div").innerHTML = `
        <p style="font-size:1rem; margin-bottom:12px;">Cerrando sesión...</p>
      `;

      setTimeout(() => {
        window.location.href = "/login/login.html";
      }, 600);
    };
  });
}
