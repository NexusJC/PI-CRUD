// kitchen_theme.js
// Control de sidebar + modo oscuro solo para el panel de cocina

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     TOGGLE SIDEBAR (empleados)
  ========================= */
  const sidebar = document.getElementById("kitchenSidebar");
  const sidebarToggle = document.getElementById("kitchenSidebarToggle");

  if (sidebar && sidebarToggle) {
    const toggleIcon = sidebarToggle.querySelector("i");
    const savedSidebar = localStorage.getItem("kitchen-sidebar-open");

    const setSidebarState = (isOpen) => {
      sidebar.classList.toggle("open", isOpen);
      sidebar.classList.toggle("collapsed", !isOpen);

      sidebarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (toggleIcon) {
        if (isOpen) {
          toggleIcon.classList.remove("bx-menu-alt-right");
          toggleIcon.classList.add("bx-menu");
        } else {
          toggleIcon.classList.remove("bx-menu");
          toggleIcon.classList.add("bx-menu-alt-right");
        }
      }

      localStorage.setItem("kitchen-sidebar-open", isOpen ? "1" : "0");
    };

    // Estado inicial
    if (savedSidebar === "0") {
      setSidebarState(false);
    } else {
      setSidebarState(true);
    }

    sidebarToggle.addEventListener("click", () => {
      const isOpenNow = sidebar.classList.contains("open");
      setSidebarState(!isOpenNow);
    });
  }

  /* =========================
     TOGGLE MODO OSCURO PANEL
  ========================= */
  const themeToggle = document.getElementById("kitchenThemeToggle");
  const icon = themeToggle?.querySelector("i");
  const text = themeToggle?.querySelector("span");

  const savedTheme = localStorage.getItem("kitchen-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("admin-dark");
    if (icon) icon.classList.replace("bx-moon", "bx-sun");
    if (text) text.textContent = "Modo claro";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nowDark = document.body.classList.toggle("admin-dark");
      localStorage.setItem("kitchen-theme", nowDark ? "dark" : "light");

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

  /* =========================
     BOTÓN TRADUCIR EN SIDEBAR
     (click = alterna ES / EN)
  ========================= */
  const translateBtn = document.getElementById("translateToggle");

  if (translateBtn) {
    translateBtn.addEventListener("click", () => {
      if (window.toggleKitchenLanguage) {
        window.toggleKitchenLanguage();
      }
    });
  }
});
// kitchen_theme.js
// Control de sidebar + modo oscuro solo para el panel de cocina

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     TOGGLE SIDEBAR (empleados)
  ========================= */
  const sidebar = document.getElementById("kitchenSidebar");
  const sidebarToggle = document.getElementById("kitchenSidebarToggle");

  if (sidebar && sidebarToggle) {
    const toggleIcon = sidebarToggle.querySelector("i");
    const savedSidebar = localStorage.getItem("kitchen-sidebar-open");

    const setSidebarState = (isOpen) => {
      sidebar.classList.toggle("open", isOpen);
      sidebar.classList.toggle("collapsed", !isOpen);

      sidebarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (toggleIcon) {
        if (isOpen) {
          toggleIcon.classList.remove("bx-menu-alt-right");
          toggleIcon.classList.add("bx-menu");
        } else {
          toggleIcon.classList.remove("bx-menu");
          toggleIcon.classList.add("bx-menu-alt-right");
        }
      }

      localStorage.setItem("kitchen-sidebar-open", isOpen ? "1" : "0");
    };

    // Estado inicial
    if (savedSidebar === "0") {
      setSidebarState(false);
    } else {
      setSidebarState(true);
    }

    sidebarToggle.addEventListener("click", () => {
      const isOpenNow = sidebar.classList.contains("open");
      setSidebarState(!isOpenNow);
    });
  }

  /* =========================
     TOGGLE MODO OSCURO PANEL
  ========================= */
  const themeToggle = document.getElementById("kitchenThemeToggle");
  const icon = themeToggle?.querySelector("i");
  const text = themeToggle?.querySelector("span");

  const savedTheme = localStorage.getItem("kitchen-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("admin-dark");
    if (icon) icon.classList.replace("bx-moon", "bx-sun");
    if (text) text.textContent = "Modo claro";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nowDark = document.body.classList.toggle("admin-dark");
      localStorage.setItem("kitchen-theme", nowDark ? "dark" : "light");

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

  /* =========================
     BOTÓN TRADUCIR EN SIDEBAR
     (click = alterna ES / EN)
  ========================= */
  const translateBtn = document.getElementById("translateToggle");

  if (translateBtn) {
    translateBtn.addEventListener("click", () => {
      if (window.toggleKitchenLanguage) {
        window.toggleKitchenLanguage();
      }
    });
  }
});
