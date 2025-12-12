document.addEventListener("DOMContentLoaded", () => {
  // Función para verificar si el usuario está logueado
  function checkUserLoggedIn() {
    const token = localStorage.getItem("token");
    const user = getStoredUser();

    if (!token || !user) {
      // Si no hay token o usuario, redirigir al login
      window.location.href = "../login/login.html";
    }
  }

  // Función para obtener el usuario almacenado en localStorage
  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }

  // =============================== 
  // LOGOUT MENÚ / USUARIO
  // ===============================
  const btnLogout = document.getElementById("btn-logout"); // Asegúrate de tener el botón de logout en el DOM
  
  if (btnLogout) {
    const isPerfilPage = window.location.pathname.includes("/perfil/");
    
    if (!isPerfilPage) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();

        // Mostrar la confirmación de logout
        showLogoutConfirmMenu(() => {
          try {
            // Limpiar los datos almacenados
            localStorage.clear();
            if (window.sessionStorage) {
              window.sessionStorage.clear();
            }
          } catch (err) {
            console.warn("Error limpiando storage en logout:", err);
          }

          // Redirigir a la página de login
          window.location.href = "../login/login.html";
        });
      });
    }
  }

  // ===============================
  // Función para cargar los turnos
  // ===============================
  async function cargarTurnos() {
    try {
      // Realizamos la petición a la API
      const res = await fetch("https://www.laparrilaazteca.online/api/orders/all");
      const pedidos = await res.json();

      if (!Array.isArray(pedidos)) return;

      const enProceso = pedidos.filter(p => p.status === "en_proceso");
      const visibles = pedidos.filter(
        p => p.status === "pendiente" || p.status === "en_proceso"
      );

      renderTurnoActual(enProceso);  // Mostrar el turno actual
      renderListaTurnos(visibles);   // Mostrar los turnos pendientes

    } catch (err) {
      console.warn("Error cargando turnos:", err);
    }
  }

  // ===============================
  // Función para renderizar el turno actual
  // ===============================
  function renderTurnoActual(lista) {
    const cont = document.getElementById("turnosActuales");
    cont.innerHTML = ""; // Limpiamos el contenido del contenedor

    if (lista.length === 0) {
      cont.innerHTML = `<p style="text-align:center; color:#777; font-weight:600;">No hay pedidos en proceso</p>`;
      return;
    }

    const t = lista[0];

    cont.innerHTML = `
      <span>Turno #${t.order_number}</span>
      <span>Cliente: ${t.customer_name || "Desconocido"}</span>
    `;
  }

  // ===============================
  // Función para renderizar la lista de turnos
  // ===============================
  function renderListaTurnos(lista) {
    const cont = document.getElementById("listaTurnos");
    cont.innerHTML = ""; // Limpiamos el contenido del contenedor

    if (lista.length === 0) {
      cont.innerHTML = `<p style="text-align:center; color:#777;">No hay turnos pendientes</p>`;
      return;
    }

    lista.forEach(t => {
      cont.innerHTML += `
        <div class="turno-item">
          <span>Turno #${t.order_number}</span>
          <span>Cliente: ${t.customer_name || "Desconocido"}</span>
        </div>
      `;
    });
  }

  // ===============================
  // Cargar turnos al inicio y actualizarlos cada 5 segundos
  // ===============================
  setInterval(cargarTurnos, 5000);

  // Verificación inicial al cargar la página
  checkUserLoggedIn();

  // Verificación cuando el usuario navega hacia atrás (al usar la flecha de atrás)
  window.addEventListener("pageshow", () => {
    checkUserLoggedIn();
  });
});
