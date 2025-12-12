document.addEventListener("DOMContentLoaded", () => {
  // LOGOUT MENÚ / USUARIO
  const btnLogout = document.getElementById("btn-logout");
  
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

  // Función para cargar los turnos
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

      renderTurnoActual(enProceso);  
      renderListaTurnos(visibles);   

    } catch (err) {
      console.warn("Error cargando turnos:", err);
    }
  }

  // Función para renderizar el turno actual
  function renderTurnoActual(lista) {
    const cont = document.getElementById("turnosActuales");
    cont.innerHTML = ""; 

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

  // Función para renderizar la lista de turnos
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

  // Cargar turnos al inicio y actualizarlos cada 5 segundos
  cargarTurnos();
  setInterval(cargarTurnos, 5000);
});
