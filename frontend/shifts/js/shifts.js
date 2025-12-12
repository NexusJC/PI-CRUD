document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const menuList = document.getElementById("menuList");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserInfo = document.getElementById("sidebarUserInfo");

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

  async function cargarTurnos() {
  try {
    const res = await fetch("https://www.laparrilaazteca.online/api/orders/all");
    const pedidos = await res.json();

    if (!Array.isArray(pedidos)) return;

    const enProceso = pedidos.filter(p => p.status === "en_proceso");
    const visibles = pedidos.filter(p => p.status === "pendiente" || p.status === "en_proceso");

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

  cont.innerHTML = "";
  nombre.textContent = "—";

  if (lista.length === 0) {
    cont.innerHTML = `
      <p style="text-align:center; color:#777; font-weight:600;">
        No hay pedidos en proceso
      </p>`;
    return;
  }

  const turno = lista[0];

  cont.innerHTML = `
    <span>${turno.order_number}</span>
    <span>${turno.caja_id ?? "—"}</span>
  `;
  nombre.textContent = turno.customer_name || "Cliente";
}

/*************************************************
 *   PANEL IZQUIERDO — LISTA DE TURNOS
 *************************************************/
function renderListaTurnos(lista) {
  const cont = document.getElementById("listaTurnos");
  cont.innerHTML = "";

  lista.forEach(t => {
    cont.innerHTML += `
      <div class="turno-item">
        <span>${t.order_number}</span>
        <span>${t.caja_id ?? "—"}</span>
        <span class="nombre">${t.customer_name || "Cliente"}</span>
      </div>
    `;
  });
}

/* Auto-refresh */
cargarTurnos();
setInterval(cargarTurnos, 5000); // Actualizar cada 5 segundos

  // Inicial
  renderSidebarState();

  // Si vuelves con la flecha ATRÁS al shifts, recalculamos y reforzamos la protección
  window.addEventListener("pageshow", () => {
    renderSidebarState();
  });

  /*************************************************
   *  MODO OSCURO
   *************************************************/
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
