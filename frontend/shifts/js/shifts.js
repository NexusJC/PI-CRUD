/*************************************************
 *  SIDEBAR, SESIÓN, ROLES, MODO OSCURO Y CONEXIONES API
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Inicializando sistema de turnos...");

  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const menuList = document.getElementById("menuList");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserInfo = document.getElementById("sidebarUserInfo");

  // Configuración de la API
  const IS_LOCAL = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port === '5500' || // Live Server
                   window.location.port === '3000';

  // URL base para API
  const API_BASE_URL = IS_LOCAL ? 'http://localhost:3000/api' : 'https://www.laparrillaazteca.online/api';

  /*************************************************
   * PROTECCIÓN: SOLO ROL "usuario" PUEDE ENTRAR
   *************************************************/
  let token = null;
  let user = null;
  try {
    token = localStorage.getItem("token");
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  // Sin sesión -> login
  if (!token || !user) {
    window.location.href = "../login/login.html";
    return;
  }

  // Con sesión pero rol diferente a "usuario" -> redirigir al menú
  if (user.role !== "usuario") {
    alert("Solo los usuarios pueden ver esta pantalla de turnos.");
    window.location.href = "/menu/index.html";
    return;
  }

  /*************************************************
   *  CONEXIÓN A API - ÓRDENES
   *************************************************/
  
  // Obtener caja_id del usuario
  async function getUserCajaId() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    
    if (user && user.caja_id) {
      localStorage.setItem('caja_id', user.caja_id);
      return user.caja_id;
    }
    
    const savedCajaId = localStorage.getItem('caja_id');
    if (savedCajaId) return parseInt(savedCajaId);
    
    const token = localStorage.getItem("token");
    if (token) {
      return 1; // Por defecto
    }
    
    return 1;
  }

  // Cargar todas las órdenes (para mostrar en pantalla de turnos)
  async function fetchAllOrders() {
    try {
      const token = localStorage.getItem("token");
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/orders/all`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const orders = await response.json();
      return Array.isArray(orders) ? orders : [];
      
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  // Cargar mis órdenes (usuario autenticado)
  async function fetchMyOrders() {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) return null;
      
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, cerrar sesión
          localStorage.clear();
          window.location.href = "../login/login.html";
          return null;
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const myOrders = await response.json();
      return myOrders;
      
    } catch (error) {
      console.error('Error fetching my orders:', error);
      return null;
    }
  }

  /*************************************************
   *          SISTEMA DE TURNOS – NUEVO DISEÑO
   *************************************************/
  
  /* === Cargar turnos desde API === */
  async function cargarTurnos() {
    try {
      const pedidos = await fetchAllOrders();

      if (!Array.isArray(pedidos)) return;

      const enProceso = pedidos.filter(p => p.status === "en_proceso");
      const visibles = pedidos.filter(
        p => p.status === "pendiente" || p.status === "en_proceso"
      );

      renderTurnoActual(enProceso);
      renderListaTurnos(visibles);

    } catch (err) {
      console.warn("Error cargando turnos:", err);
    }
  }

  /*************************************************
   *   PANEL DERECHO — TURNO ACTUAL GRANDE
   *************************************************/
  function renderTurnoActual(lista) {
    const cont = document.getElementById("turnosActuales");
    const nombre = document.getElementById("nombreUsuarioActual");
    const etapa = document.getElementById("etapaUsuarioActual");

    cont.innerHTML = "";
    nombre.textContent = "—";
    etapa.textContent = "Esperando pedido...";

    if (lista.length === 0) {
      cont.innerHTML = `
        <span>---</span>
        <span>---</span>
      `;
      return;
    }

    const t = lista[0];

    cont.innerHTML = `
      <span>${t.order_number}</span>
      <span>${t.caja_id ?? "—"}</span>
    `;

    nombre.textContent = t.customer_name || "Cliente";
    etapa.textContent = "En preparación";
  }

  /*************************************************
   *   PANEL IZQUIERDO — LISTA DE TURNOS
   *************************************************/
  function renderListaTurnos(lista) {
    const cont = document.getElementById("listaTurnos");
    if (!cont) return;
    
    cont.innerHTML = "";

    lista.forEach(t => {
      const statusClass = t.status === 'en_proceso' ? 'en-proceso' : 'pendiente';
      
      cont.innerHTML += `
        <div class="turno-item ${statusClass}">
          <span>${t.order_number}</span>
          <span>${t.caja_id ?? "—"}</span>
          <span class="nombre">${t.customer_name || "Cliente"}</span>
        </div>
      `;
    });
  }

  /*************************************************
   *   FUNCIONES DE INTERFAZ
   *************************************************/
  
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

  // LOGOUT desde shifts
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      showConfirmCustomLogout(
        "¿Deseas cerrar sesión?",
        () => {
          try {
            localStorage.clear();
            if (window.sessionStorage) {
              window.sessionStorage.clear();
            }
          } catch (e) {
            console.warn("Error limpiando storage en logout:", e);
          }
          window.location.href = "../login/login.html";
        }
      );
    });
  }

  /* === ABRIR / CERRAR SIDEBAR === */
  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      toggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
    });
  }

  /* === CERRAR SI HACE CLICK FUERA === */
  document.addEventListener("click", (e) => {
    if (
      sidebar &&
      toggle &&
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      sidebar.classList.remove("active");
      toggle.textContent = "☰";
    }
  });

  function renderSidebarState() {
    const tokenLocal = localStorage.getItem("token");
    let userLocal = null;
    try {
      userLocal = JSON.parse(localStorage.getItem("user"));
    } catch {
      userLocal = null;
    }

    // SI YA NO HAY SESIÓN, POR SEGURIDAD NO MOSTRAMOS NADA Y MANDAMOS AL LOGIN
    if (!tokenLocal || !userLocal) {
      if (btnLogin && btnLogout) {
        btnLogin.style.display = "block";
        btnLogout.style.display = "none";
      }
      if (sidebarAvatar) {
        sidebarAvatar.src = "../img/user.deflt.png";
      }
      if (sidebarUserName && sidebarUserInfo) {
        sidebarUserName.textContent = "Te Damos La Bienvenida";
        sidebarUserInfo.textContent = "¡Explora el menú!";
      }
      if (menuList) {
        menuList.innerHTML = `
          <li>
            <a href="/menu/index.html">
              <i class="fas fa-utensils"></i>
              <span>Menú</span>
            </a>
          </li>
        `;
      }
      // Además reforzamos redirección a login
      window.location.href = "../login/login.html";
      return;
    }

    // Solo debería llegar aquí si sigue siendo "usuario"
    if (userLocal.role !== "usuario") {
      alert("Solo los usuarios pueden ver esta pantalla de turnos.");
      window.location.href = "/menu/index.html";
      return;
    }

    // Botones login / logout
    if (btnLogin && btnLogout) {
      btnLogin.style.display = "none";
      btnLogout.style.display = "block";
    }

    // === AVATAR EN SIDEBAR ===
    if (sidebarAvatar) {
      let avatarUrl = userLocal.image_url || userLocal.profile_picture;
      if (avatarUrl) {
        if (avatarUrl.includes("cloudinary")) {
          sidebarAvatar.src = avatarUrl;
        } else if (!avatarUrl.startsWith("http")) {
          sidebarAvatar.src = `https://www.laparrillaazteca.online/uploads/${avatarUrl}`;
        } else {
          sidebarAvatar.src = avatarUrl;
        }
      } else {
        sidebarAvatar.src = "../img/user.deflt.png";
      }
      
      sidebarAvatar.onerror = function() {
        this.src = "../img/user.deflt.png";
      };
    }

    // === NOMBRE EN SIDEBAR ===
    if (sidebarUserName && sidebarUserInfo) {
      sidebarUserName.textContent = "Bienvenido";
      sidebarUserInfo.textContent = userLocal.name || "¡Explora el menú!";
    }

    // === MENÚ POR ROL ===
    if (!menuList) return;

    // Aquí ya sabemos que userLocal.role === "usuario"
    menuList.innerHTML = `
      <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> <span>Ver Menú</span></a></li>
      <li><a href="/perfil/perfil.html"><i class="fas fa-user"></i> <span>Mi Perfil</span></a></li>
      <li><a href="/shifts/shifts.html"><i class="fas fa-clock"></i> <span>Turnos</span></a></li>
    `;
  }

  // Inicial
  renderSidebarState();

  // Si vuelves con la flecha ATRÁS al shifts, recalculamos y reforzamos la protección
  window.addEventListener("pageshow", () => {
    renderSidebarState();
  });

  /* === MODO OSCURO === */
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

  /*************************************************
   *   INICIALIZACIÓN DEL SISTEMA
   *************************************************/
  
  async function init() {
    console.log("✅ Sistema de turnos inicializado");
    
    // Cargar turnos inicialmente
    await cargarTurnos();
    
    // Configurar actualización periódica
    setInterval(cargarTurnos, 5000); // Actualizar cada 5 segundos
  }

  // Inicializar
  init();
});