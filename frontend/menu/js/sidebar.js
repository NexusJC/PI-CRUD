// ===============================
// ALERTA PERSONALIZADA LOGOUT (MENÚ/USUARIO)
// ===============================
function showLogoutConfirmMenu(onYes) {
  const overlay = document.createElement("div");
  overlay.className = "logout-modal-menu";

  overlay.innerHTML = `
    <div class="logout-modal-menu-box">
      <h3>¿Seguro que quieres cerrar sesión?</h3>
      <div class="logout-modal-menu-actions">
        <button class="logout-modal-menu-btn cancel">Cancelar</button>
        <button class="logout-modal-menu-btn confirm">Sí, continuar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnCancel  = overlay.querySelector(".cancel");
  const btnConfirm = overlay.querySelector(".confirm");

  const closeOverlay = () => overlay.remove();

  btnCancel.addEventListener("click", () => {
    closeOverlay();
  });

  btnConfirm.addEventListener("click", () => {
    closeOverlay();
    if (typeof onYes === "function") onYes();
  });
}

// ================== SIDEBAR, CATEGORÍAS, SESIÓN, TEMA ==================
document.addEventListener("DOMContentLoaded", () => {
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
  const btnLogin        = document.getElementById("btn-login");
  const btnLogout       = document.getElementById("btn-logout");
  const usernameText    = document.getElementById("username-text");
  const usernameValue   = document.getElementById("username");
  const usernameDefault = document.getElementById("username-default");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserInfo = document.getElementById("sidebarUserInfo");
  const menuList        = document.getElementById("menuList");
  const sidebarAvatar   = document.getElementById("sidebarAvatar");

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }

  // Renderiza TODO el sidebar según el token/user actuales
  function renderSidebarSessionState() {
    const token = localStorage.getItem("token");
    const user  = getStoredUser();

    // Botones login / logout
    if (btnLogin && btnLogout) {
      if (token && user) {
        btnLogin.style.display  = "none";
        btnLogout.style.display = "block";
      } else {
        btnLogin.style.display  = "block";
        btnLogout.style.display = "none";
      }
    }

    // Avatar
    if (sidebarAvatar) {
      let avatarUrl = token && user ? (user.image_url || user.profile_picture) : null;

      if (avatarUrl) {
        if (!avatarUrl.startsWith("http")) {
          avatarUrl = `https://www.laparrilaazteca.online/uploads/${avatarUrl}`;
        }
        sidebarAvatar.src = avatarUrl;
      } else {
        sidebarAvatar.src = "../img/user.deflt.png";
      }
    }

    // Nombre / subtítulo en sidebar
    if (sidebarUserName && sidebarUserInfo) {
      if (token && user) {
        sidebarUserName.textContent = "Te Damos La Bienvenida";
        sidebarUserInfo.textContent = user.name || "¡Explora el menú!";
      } else {
        sidebarUserName.textContent = "Te Damos La Bienvenida";
        sidebarUserInfo.textContent = "¡Explora el menú!";
      }
    }

    // Nombre en el topbar (si lo tienes)
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

    // Menú lateral según rol
    if (menuList) {
      const role = user?.role;

      if (!token || !user || !role) {
        // Invitado / sin sesión
        menuList.innerHTML = `
          <li data-no-translate>
            <a href="/menu/index.html">
              <i class="fas fa-utensils"></i>
              <span class="sb-label menu-label">Ver Menú</span>
            </a>
          </li>
        `;
      } else if (role === "admin") {
        menuList.innerHTML = `
          <li data-no-translate>
            <a href="/personal/admin/dashboard/dashboard.html" data-no-translate>
              <i class="fas fa-users" data-no-translate></i>
              <span>Administración</span>
            </a>
          </li>
        `;
      } else if (role === "empleado") {
        menuList.innerHTML = `
          <li data-no-translate>
            <a href="/personal/employees/carousel.html" data-no-translate>
              <i class="fas fa-pizza-slice" data-no-translate></i>
              <span>Carusel</span>
            </a>
          </li>
        `;
      } else if (role === "usuario") {
        menuList.innerHTML = `
          <li data-no-translate>
            <a href="/menu/index.html">
              <i class="fas fa-utensils"></i>
              <span class="sb-label menu-label">Ver Menú</span>
            </a>
          </li>
          <li data-no-translate>
            <a href="/perfil/perfil.html">
              <i class="fas fa-user"></i>
              <span class="sb-label perfil-label">Mi Perfil</span>
            </a>
          </li>
          <li data-no-translate>
            <a href="/shifts/shifts.html">
              <i class="fas fa-clock icon"></i>
              <span class="sb-label shifts-label">Turnos</span>
            </a>
          </li>
        `;
      }
    }
  }

  // Cargar avatar desde backend si hace falta
  async function ensureAvatarIsLoaded() {
    const token = localStorage.getItem("token");
    if (!token) return;

    let user = getStoredUser();
    const hasImage = user && user.image_url;
    const sidebarAvatarEl = document.getElementById("sidebarAvatar");

    if (hasImage && sidebarAvatarEl) {
      sidebarAvatarEl.src = user.image_url;
      return;
    }

    try {
      const res = await fetch(
        "https://www.laparrilaazteca.online/api/profile/get-profile",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      user = user || {};
      user.image_url = data.image_url;
      localStorage.setItem("user", JSON.stringify(user));

      if (sidebarAvatarEl && data.image_url) {
        sidebarAvatarEl.src = data.image_url;
      }
    } catch (err) {
      console.warn("Error cargando avatar:", err);
    }
  }

  // Inicial
  renderSidebarSessionState();
  ensureAvatarIsLoaded();

  // Cuando el usuario usa la flecha de ATRÁS y vuelve al menú,
  // recalculamos el estado del sidebar para que ya aparezca deslogueado.
  window.addEventListener("pageshow", () => {
    renderSidebarSessionState();
  });

  // ====== LOGOUT MENÚ / USUARIO ======
  if (btnLogout) {
    const isPerfilPage = window.location.pathname.includes("/perfil/");
    if (!isPerfilPage) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();

        showLogoutConfirmMenu(() => {
          try {
            localStorage.clear();
            if (window.sessionStorage) {
              window.sessionStorage.clear();
            }
          } catch (err) {
            console.warn("Error limpiando storage en logout:", err);
          }

          // No usamos replace aquí para que el historial siga siendo normal.
          window.location.href = "../login/login.html";
        });
      });
    }
  }

  /* ----- MODO OSCURO ----- */
 
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