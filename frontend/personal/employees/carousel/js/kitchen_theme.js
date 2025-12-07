// js/kitchen_theme.js
// Control de sidebar, modo oscuro y traducción solo para el panel de cocina

(function () {
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

      // Estado inicial del sidebar
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
    const themeIcon = themeToggle?.querySelector("i");
    const themeText = themeToggle?.querySelector("span");

    const applyThemeFromStorage = () => {
      const savedTheme = localStorage.getItem("kitchen-theme") || "light";
      const isDark = savedTheme === "dark";

      document.body.classList.toggle("admin-dark", isDark);

      if (themeIcon && themeText) {
        if (isDark) {
          themeIcon.classList.replace("bx-moon", "bx-sun");
          themeText.textContent = "Modo claro";
        } else {
          themeIcon.classList.replace("bx-sun", "bx-moon");
          themeText.textContent = "Modo oscuro";
        }
      }
    };

    // Estado inicial de tema
    applyThemeFromStorage();

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const nowDark = !document.body.classList.contains("admin-dark");
        document.body.classList.toggle("admin-dark", nowDark);
        localStorage.setItem("kitchen-theme", nowDark ? "dark" : "light");

        if (themeIcon && themeText) {
          if (nowDark) {
            themeIcon.classList.replace("bx-moon", "bx-sun");
            themeText.textContent = "Modo claro";
          } else {
            themeIcon.classList.replace("bx-sun", "bx-moon");
            themeText.textContent = "Modo oscuro";
          }
        }
      });
    }

    /* =========================
       BOTÓN TRADUCIR EN SIDEBAR
       (usa tu API de translate.js)
    ========================= */
    const translateBtn = document.getElementById("translateToggle");
    let translateScriptLoaded = false;

    const getCurrentLanguage = () =>
      localStorage.getItem("preferredLanguage") ||
      document.documentElement.lang ||
      "es";

    const updateTranslateButtonLabel = (lang) => {
      if (!translateBtn) return;
      const span = translateBtn.querySelector("span");
      if (!span) return;

      // Cuando está en ES → muestra "Traducir"
      // Cuando está en EN → muestra "Español"
      span.textContent = lang === "en" ? "Español" : "Traducir";
    };

    // Inicializar texto del botón según idioma guardado
    updateTranslateButtonLabel(getCurrentLanguage());

    const loadTranslateScriptIfNeeded = () =>
      new Promise((resolve, reject) => {
        if (translateScriptLoaded || window.translateContent) {
          translateScriptLoaded = true;
          resolve();
          return;
        }

       const script = document.createElement("script");
// En el carrusel, translate.js está junto a este archivo en /js
script.src = "js/translate.js";
script.async = true;

        script.onload = () => {
          translateScriptLoaded = true;
          resolve();
        };

        script.onerror = () => {
          console.error("No se pudo cargar translate.js");
          alert(
            "No se pudo cargar el sistema de traducción. Intenta de nuevo más tarde."
          );
          reject(new Error("No se pudo cargar translate.js"));
        };

        document.head.appendChild(script);
      });

    async function handleTranslateToggle() {
      try {
        await loadTranslateScriptIfNeeded();

        if (typeof window.translateContent !== "function") {
          console.warn("translateContent no está disponible.");
          return;
        }

        const current = getCurrentLanguage();
        const target = current === "es" ? "en" : "es";

        // Llamamos a tu función principal que usa la API de Google
        await window.translateContent(target);

        // Guardamos idioma preferido y actualizamos label del botón
        localStorage.setItem("preferredLanguage", target);
        document.documentElement.lang = target;
        updateTranslateButtonLabel(target);
      } catch (err) {
        console.error("Error al alternar idioma en panel de cocina:", err);
      }
    }

    // Hacemos accesible si quieres llamarlo desde otros lados
    window.toggleKitchenLanguage = handleTranslateToggle;

    if (translateBtn) {
      translateBtn.addEventListener("click", () => {
        handleTranslateToggle();
      });
    }
  });
})();
