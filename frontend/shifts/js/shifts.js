document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const menuList = document.getElementById("menuList");

  /* === ABRIR / CERRAR SIDEBAR === */
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    toggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
  });

  /* === CERRAR AL DAR CLICK FUERA === */
  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("active") &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove("active");
      toggle.textContent = "☰";
    }
  });

  /* === SESIÓN === */
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    btnLogin.style.display = "none";
    btnLogout.style.display = "block";
  } else {
    btnLogin.style.display = "block";
    btnLogout.style.display = "none";
    menuList.innerHTML = `
      <li data-no-translate>
        <a href="/menu/index.html" data-no-translate>
          <i class="fas fa-utensils" data-no-translate></i>
          <span>Menú</span>
        </a>
      </li>
      `;
    return;
  }
  
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  if (sidebarAvatar && user) {
    let avatarUrl = user.image_url || user.profile_picture;
    if (avatarUrl) {
      if (avatarUrl.includes("cloudinary")) {
        sidebarAvatar.src = avatarUrl;
        return;
      }
      if (!avatarUrl.startsWith("http")) {
        avatarUrl = `https://www.laparrilaazteca.online/uploads/${avatarUrl}`;
      }
      sidebarAvatar.src = avatarUrl;
    }
  }

  /* === CERRAR SESIÓN === */
  btnLogout.addEventListener("click", () => {
    if (confirm("¿Cerrar sesión?")) {
      localStorage.clear();
      window.location.href = "/menu/index.html";
    }
  });

  /* === MENÚ POR ROL === */
  if (user.role === "usuario") {
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

  if (user.role === "admin") {
    menuList.innerHTML = `
      <li data-no-translate>
        <a href="/personal/admin/dashboard/dashboard.html" data-no-translate>
          <i class="fas fa-gauge" data-no-translate></i>
          <span>Dashboard</span>
        </a>
      </li>
      <li data-no-translate>
        <a href="/personal/admin/add-dishes/add_dishes.html" data-no-translate>
          <i class="fas fa-pizza-slice" data-no-translate></i>
          <span>Platillos</span>
        </a>
      </li>
      <li data-no-translate>
        <a href="/personal/admin/employee-management/employee.html" data-no-translate>
          <i class="fas fa-users" data-no-translate></i>
          <span>Empleados</span>
        </a>
      </li>
      <li data-no-translate>
        <a href="/personal/admin/gestioncajas/gestioncajas.html" data-no-translate>
          <i class="fas fa-cash-register" data-no-translate></i>
          <span>Cajas</span>
        </a>
      </li>
    `;
  }
});
/* ================================
   CARGAR Y MOSTRAR TURNOS 
================================== */

async function cargarTurnos() {
  try {
    const res = await fetch("https://www.laparrilaazteca.online/api/orders/all");
    const pedidos = await res.json();

    if (!Array.isArray(pedidos)) return;

    // SEPARAR: EN PROCESO VS TODOS
    const enProceso = pedidos.filter(p => p.status === "en_proceso");
    const todos = pedidos;

    renderTurnosActuales(enProceso);
    renderTodosLosTurnos(todos);

  } catch (err) {
    console.warn("⚠ Error cargando turnos:", err);
  }
}

function renderTurnosActuales(lista) {
  const cont = document.getElementById("turnosActuales");
  cont.innerHTML = "";

  if (lista.length === 0) {
    cont.innerHTML = `<p style="text-align:center; color:#888;">No hay pedidos en proceso</p>`;
    return;
  }

  lista.forEach(t => {
    cont.innerHTML += `
      <div class="turno-card resaltado">
        <h3>#${t.order_number}</h3>
        <p>${t.customer_name}</p>
        <span>$${Number(t.total).toFixed(2)}</span>
        <small style="display:block; margin-top:6px; opacity:0.8;">Caja ${t.caja_id}</small>
      </div>
    `;
  });
}

function renderTodosLosTurnos(lista) {
  const cont = document.getElementById("listaTurnos");
  cont.innerHTML = "";

  lista.forEach(t => {
    cont.innerHTML += `
      <div class="turno-card">
        <h3>#${t.order_number}</h3>
        <p>${t.customer_name || "Cliente"}</p>
        <span>$${Number(t.total).toFixed(2)}</span>
      </div>
    `;
  });
}

/* CARGAR TURNOS AL ABRIR LA PÁGINA */
cargarTurnos();

/* OPCIONAL: AUTOREFRESH CADA 5s */
setInterval(cargarTurnos, 5000);
