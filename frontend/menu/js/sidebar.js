// ================== SIDEBAR, CATEGORÍAS, SESIÓN, TEMA ==================
document.addEventListener("DOMContentLoaded", () => {
  /* ----- TOGGLE DEL SIDEBAR IZQUIERDO ----- */
  const menuToggle = document.getElementById("menuToggle");
  const sidebar    = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      menuToggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
    });
  }

  /* ----- FILTRO DE CATEGORÍAS (MENÚ NUEVO) ----- */

  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  function initCategoryFilter() {
    const buttons  = document.querySelectorAll(".category-btn");
    const sections = document.querySelectorAll(".menu-category-block");
    const cards    = document.querySelectorAll("#menuGrid .menu-card");

    // Si no hay botones o no hay platillos, no hacemos nada
    if (!buttons.length || (!sections.length && !cards.length)) return;

    function aplicarFiltro(category) {
      const cat = normalize(category);

      // 1) Layout nuevo: secciones por categoría (Entradas, Tacos, etc.)
      if (sections.length) {
        sections.forEach((sec) => {
          const secCat = normalize(sec.dataset.category);
          const mostrar =
            !cat ||
            cat === "todos" ||
            cat === "todo" ||
            cat === "all" ||
            secCat === cat;

          sec.style.display = mostrar ? "" : "none";
        });
      } else {
        // 2) Fallback por si algún día vuelves al layout viejo (tarjetas sueltas)
        cards.forEach((card) => {
          const cardCat = normalize(card.dataset.category);
          const mostrar =
            !cat ||
            cat === "todos" ||
            cat === "todo" ||
            cat === "all" ||
            cardCat === cat;

          card.style.display = mostrar ? "" : "none";
        });
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.category || "todos";

        // marcar botón activo
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        aplicarFiltro(cat);
      });
    });

    // Estado inicial: mostrar todo
    aplicarFiltro("todos");
  }

  document.addEventListener("dishesLoaded", initCategoryFilter);

  setTimeout(initCategoryFilter, 1200);

  /* ----- SESIÓN: LOGIN / LOGOUT + NOMBRE ----- */
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");

  const btnLogin        = document.getElementById("btn-login");
  const btnLogout       = document.getElementById("btn-logout");
  const usernameText    = document.getElementById("username-text");
  const usernameValue   = document.getElementById("username");
  const usernameDefault = document.getElementById("username-default");

  if (btnLogin && btnLogout) {
    if (token && user) {
      btnLogin.style.display  = "none";
      btnLogout.style.display = "block";
    } else {
      btnLogin.style.display  = "block";
      btnLogout.style.display = "none";
    }

    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        const confirmLogout = confirm("¿Seguro que quieres cerrar sesión?");
        if (confirmLogout) {
          localStorage.clear();
          window.location.href = "../login/login.html";
        }
      });
    }
  }

  if (usernameText && usernameValue && usernameDefault) {
    if (token && user) {
      usernameText.style.display    = "block";
      usernameValue.textContent     = user.name;
      usernameDefault.style.display = "none";
    } else {
      usernameText.style.display    = "none";
      usernameDefault.style.display = "block";
    }
  }

  /* ----- MENÚ LATERAL SEGÚN ROL ----- */
  const menuList = document.getElementById("menuList");
  const role     = user?.role;

  if (menuList) {
    if (!role) {
      menuList.innerHTML = ``;
    } else if (role === "admin") {
      menuList.innerHTML = `
        <li data-no-translate>
          <a href="/personal/admin/add-dishes/admin.html" data-no-translate>
            <i class="fas fa-pizza-slice" data-no-translate></i>
            <span>Gestionar Platillos</span>
          </a>
        </li>
        <li data-no-translate>
          <a href="/personal/employees/employee.html" data-no-translate>
            <i class="fas fa-users" data-no-translate></i>
            <span>Gestionar Empleados</span>
          </a>
        </li>
      `;
    } else if (role === "empleado") {
      menuList.innerHTML = `
        <li data-no-translate>
          <a href="/menu/index.html" data-no-translate>
            <i class="fas fa-pizza-slice" data-no-translate></i>
            <span>Menú</span>
          </a>
        </li>      `;
    } else if (role === "usuario") {
      menuList.innerHTML = `  
        <li data-no-translate>
          <a href="/menu/index.html" data-no-translate>
            <i class="fas fa-utensils" data-no-translate></i>
            <span>Ver Menú</span>
          </a>
        </li>
        <li data-no-translate>
          <a href="/perfil/perfil.html" data-no-translate>
            <i class="fas fa-user" data-no-translate></i>
            <span>Mi Perfil</span>
          </a>
        </li>
        <li data-no-translate>
          <a href="/shifts/shifts.html" data-no-translate>
            <i class="fas fa-clock icon" data-no-translate></i>
            <span>Turnos</span>
          </a>
        </li>
      `;
    }
  }

  /* ----- MODO OSCURO ----- */
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      updateThemeButton(true);
    }

    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateThemeButton(isDark);
    });

    function updateThemeButton(isDark) {
      const icon = themeToggle.querySelector("i");
      const text = themeToggle.querySelector("span");
      if (!icon || !text) return;

      if (isDark) {
        icon.classList.replace("fa-moon", "fa-sun");
        text.textContent = "Modo claro";
      } else {
        icon.classList.replace("fa-sun", "fa-moon");
        text.textContent = "Modo oscuro";
      }
    }
  }
});

// ========== CERRAR SIDEBAR AL HACER CLICK FUERA ==========
document.addEventListener("click", (e) => {
  const sidebar    = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");

  if (!sidebar || !menuToggle) return;

  if (sidebar.classList.contains("active")) {
    const clickInsideSidebar = sidebar.contains(e.target);
    const clickOnToggle      = menuToggle.contains(e.target);
    if (!clickInsideSidebar && !clickOnToggle) {
      sidebar.classList.remove("active");
      menuToggle.textContent = "☰";
    }
  }
});
