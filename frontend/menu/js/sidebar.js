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

  /* ----- FILTRO DE CATEGORÍAS (MENÚ) ----- */
  const norm = (s) => (s || "").toString().trim().toLowerCase();

  const mapCategory = (name) => {
    const n = norm(name);
    if (n.includes("pizza")) return "pizza";
    if (n.includes("hamburg")) return "hamburguesas";
    if (["pozole", "sopa", "caldo", "menudo"].some((w) => n.includes(w))) return "sopas";
    if (["vino", "tinto", "blanco", "rosado"].some((w) => n.includes(w))) return "vinos";
    if (
      ["pescado", "marlin", "atun", "atún", "salmon", "salmón", "camaron", "camarón", "mariscos"]
        .some((w) => n.includes(w))
    ) return "pescado";
    return "comida";
  };

  const cards   = document.querySelectorAll(".menu-card");
  const buttons = document.querySelectorAll(".category-btn");

  if (cards.length && buttons.length) {
    cards.forEach((card) => {
      if (!card.dataset.category) {
        const name = card.dataset.name || card.querySelector("h3")?.textContent || "";
        card.dataset.category = mapCategory(name);
      }
    });

    function filterMenu(category) {
      cards.forEach((item) => {
        const cat = norm(item.getAttribute("data-category"));
        item.style.display = category === "todos" || cat === category ? "" : "none";
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const category = norm(button.getAttribute("data-category"));
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        filterMenu(category);
      });
    });

    filterMenu("todos");
  }

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
        <li><a href="/personal/admin/add-dishes/admin.html"><i class="fas fa-pizza-slice"></i> Gestionar Platillos</a></li>
        <li><a href="/personal/employees/employee.html"><i class="fas fa-users"></i> Gestionar Empleados</a></li>
      `;
    } else if (role === "empleado") {
      menuList.innerHTML = `
        <li><a href="/menu/index.html"><i class="fas fa-pizza-slice"></i> Menú</a></li>
      `;
    } else if (role === "usuario") {
      menuList.innerHTML = `  
        <li>
          <a href="/menu/index.html">
            <i class="fas fa-utensils" data-no-translate></i>
            <span>Ver Menú</span>
          </a>
        </li>
        <li data-no-translate>
          <a href="/perfil/perfil.html" data-no-translate>
            <i class="fas fa-user" data-no-translate></i> Mi Perfil
          </a>
        </li>
        <li data-no-translate>
          <a href="/shifts/shifts.html" data-no-translate>
            <i class="fas fa-clock icon" data-no-translate></i> Turnos
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
