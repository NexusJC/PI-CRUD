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
// SESIÓN / LOGOUT (MISMO QUE EN INDEX)
// =========================
function getLoginUrl() {
    const isLocal =
        location.hostname === "127.0.0.1" ||
        location.hostname === "localhost";

    if (isLocal) {
        return "../../../login/login.html";
    }

    return "/login/login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg = document.getElementById("sidebarUserImg");

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!token || !user || user.role !== "admin") {
    window.location.href = getLoginUrl();
}

if (user && sidebarUserName) {
    sidebarUserName.textContent = user.name || "Usuario";
    if (user.profile_picture) {
        sidebarUserImg.src = "/uploads/" + user.profile_picture;
    }
}

logoutBtn?.addEventListener("click", () => {
    const confirmar = confirm("¿Seguro que quieres cerrar sesión?");
    if (!confirmar) return;

    localStorage.clear();
    window.location.href = getLoginUrl();
});