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

async function ensureAvatarIsLoaded() {
  let u = JSON.parse(localStorage.getItem("user") || "{}");
  const sidebarAvatar = document.getElementById("sidebarAvatar");

  // Si ya existe imagen válida → úsala
  if (u.image_url && sidebarAvatar) {
    sidebarAvatar.src = u.image_url;
    return;
  }

  // Si no hay token, no hacemos nada
  if (!token) return;

  try {
    const res = await fetch("https://www.laparrilaazteca.online/api/profile/get-profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const data = await res.json();

    // Guardar la imagen en localStorage
    u.image_url = data.image_url;
    localStorage.setItem("user", JSON.stringify(u));

    // Aplicarla al sidebar
    if (sidebarAvatar) sidebarAvatar.src = data.image_url;

  } catch (err) {
    console.warn("Error cargando avatar:", err);
  }
}

ensureAvatarIsLoaded();   // 👈 ESTA LÍNEA HACE QUE SE CARGUE SOLITO AL ABRIR LA PÁGINA

  const btnLogin        = document.getElementById("btn-login");
  const btnLogout       = document.getElementById("btn-logout");
  const usernameText    = document.getElementById("username-text");
  const usernameValue   = document.getElementById("username");
  const usernameDefault = document.getElementById("username-default");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserInfo = document.getElementById("sidebarUserInfo");

  if (btnLogin && btnLogout) {
    if (token && user) {
      btnLogin.style.display  = "none";
      btnLogout.style.display = "block";
    } else {
      btnLogin.style.display  = "block";
      btnLogout.style.display = "none";
    }
  }
  
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  
  if (sidebarAvatar && user) {
  // Puede venir como URL completa (image_url) o solo el filename (profile_picture)
  let avatarUrl = user.image_url || user.profile_picture;

  if (avatarUrl) {
    if (!avatarUrl.startsWith("http")) {
      avatarUrl = `https://www.laparrilaazteca.online/uploads/${avatarUrl}`;
    }
    sidebarAvatar.src = avatarUrl;
  }
}

  if (sidebarUserName && sidebarUserInfo) {
    if (token && user) {

      sidebarUserName.textContent = "Te Damos La Bienvenida";
      sidebarUserInfo.textContent = user.name || "¡Explora el menú!";
    } else {

      sidebarUserName.textContent = "Te Damos La Bienvenida";
      sidebarUserInfo.textContent = "¡Explora el menú!";
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
          <a href="/personal/admin/add-dishes/add_dishes.html" data-no-translate>
            <i class="fas fa-pizza-slice" data-no-translate></i>
            <span>Gestionar Platillos</span>
          </a>
        </li>
        <li data-no-translate>
          <a href="/personal/employee-management/employee.html" data-no-translate>
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

function showConfirmCustomLogout(message, onYes, onNo) {
  const overlay = document.createElement("div");
  overlay.className = "custom-confirm-overlay";

  overlay.innerHTML = `
    <div class="custom-confirm-box">
      <h3>${message}</h3>
      <div class="confirm-btn-row">
        <button class="confirm-btn confirm-no">Cancelar</button>
        <button class="confirm-btn confirm-yes">Sí, continuar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".confirm-no").addEventListener("click", () => {
    overlay.remove();
    if (onNo) onNo();
  });

  overlay.querySelector(".confirm-yes").addEventListener("click", () => {
    overlay.remove();
    onYes();
  });
}

function initMenuLogout() {
  const logoutBtn = document.getElementById("btn-logout");

  // Verificar si ESTAMOS EN EL MENÚ
  const estaEnMenu =
    window.location.pathname.includes("/menu/") ||
    window.location.pathname.endsWith("menu") ||
    window.location.pathname.endsWith("index.html");

  if (!estaEnMenu) return; // ❌ Si NO es menú, NO activar logout

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      showConfirmCustomLogout(
        "¿Deseas cerrar sesión?",
        () => {
          localStorage.clear();
          window.location.href = "../login/login.html";
        }
      );
    });
  }
}

initMenuLogout();