/* ============================================================
   🔧 FUNCIÓN NECESARIA PARA EVITAR ERROR (SIDEBAR PLACEHOLDER)
============================================================ */
function inicializarSidebar() {
  console.log("Sidebar inicializado (placeholder)");
}

/* ============================================================
   🔧 VARIABLES GLOBALES DEL SISTEMA
============================================================ */
let pedidoActivo = null;
let pedidosData = {}; // se llenará desde el backend

/* Helper para escapar comentarios en HTML */
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (c) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] || c;
  });
}

/* ============================================================
   📥 CARGAR PEDIDOS DESDE BACKEND
============================================================ */
async function cargarPedidos() {
  try {
    const res = await fetch("/api/orders/list");
    const pedidos = await res.json();

    pedidosData = {};

    pedidos
      .filter((p) => p.status === "pendiente" || p.status === "en_proceso")
      .forEach((p) => {
        pedidosData[p.order_number] = {
          id: p.id,
          cliente: p.customer_name,
          total: Number(p.total),
          estado: p.status,
          createdAt: p.created_at,
          horaPedido: p.created_at.substring(11, 16),
          horaEstimada: p.created_at.substring(11, 16), // placeholder
          ordenes: [],
        };
      });

    await cargarDetallesDeCadaPedido();
    renderizarCarrusel();
    actualizarTotalPedidos();

    const first = Object.keys(pedidosData)[0];
    if (first) seleccionarPedido(first);
  } catch (err) {
    console.error("Error cargando pedidos:", err);
    alert("No se pudieron cargar los pedidos.");
  }
}

/* Contador de pedidos en el header */
function actualizarTotalPedidos() {
  const totalPedidosEl = document.getElementById("totalPedidos");
  if (!totalPedidosEl) return;
  totalPedidosEl.textContent = Object.keys(pedidosData).length;
}

/* ============================================================
   🔄 CARGAR DETALLES DE CADA PEDIDO
============================================================ */
async function cargarDetallesDeCadaPedido() {
  const numeros = Object.keys(pedidosData);

  for (let num of numeros) {
    const idReal = pedidosData[num].id;

    try {
      const res = await fetch(`/api/orders/${idReal}/details`);
      const data = await res.json();

      // Guardamos cada producto con su propio comentario
      pedidosData[num].ordenes = (data.items || []).map((i) => ({
        nombre: i.dish_name,
        cantidad: Number(i.quantity),
        precio: Number(i.price),
        comentario: i.comments || "",
      }));
    } catch (err) {
      console.error("Error cargando detalles de pedido", num, err);
    }
  }
}

/* ============================================================
   🧾 MENÚ DISPONIBLE PARA EDICIÓN (SI QUIERES AGREGAR PLATOS)
============================================================ */
const menuItems = [
  "Pizza Mexicana",
  "Hamburguesa Azteca",
  "Pollo Estilo Parrilla",
  "Papas Crujientes",
  "Carne Asada",
  "Chilaquiles",
  "Tostadas tradicionales",
  "Enchiladas",
  "Pozole",
  "Costillas BBQ",
  "Tacos al Pastor",
  "Tacos de Asada",
  "Refresco",
  "Agua de Jamaica",
  "Limonada Natural",
  "Refresco de Manzana",
  "Agua Mineral",
  "Refresco de Cola",
];

/* ============================================================
   🔧 INICIALIZACIÓN PRINCIPAL DEL SISTEMA
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await cargarPedidos();       // cargar pedidos reales
  inicializarBotones();        // botones de acción
  inicializarModal();          // modal editar
  inicializarSidebar();        // placeholder
  setupSidebarDashboard();     // sidebar real (abrir/cerrar)
  initEmployeeTheme();         // modo oscuro / claro
  initEmployeeAuth();          // datos de usuario + logout
  initTranslateDropdown();     // abrir/cerrar menú de idiomas

  console.log("Panel de cocina listo con pedidos reales");
});

/* ============================================================
   🧱 RENDER DEL CARRUSEL
============================================================ */
function renderizarCarrusel() {
  const cont = document.getElementById("turnosCarousel");
  if (!cont) return;

  cont.innerHTML = "";

  Object.keys(pedidosData).forEach((num) => {
    const p = pedidosData[num];

    const card = document.createElement("article");
    card.className = "turno-card";
    card.dataset.pedido = num;

    card.innerHTML = `
      <div class="turno-header">
        <h3>#${num}</h3>
        <span class="costo">$${p.total.toFixed(2)}</span>
      </div>
      <p class="cliente">${escapeHtml(p.cliente || "Cliente")}</p>
      <div class="estado estado-${p.estado}">
        ${escapeHtml(p.estado)}
      </div>
    `;

    card.addEventListener("click", () => seleccionarPedido(num));

    cont.appendChild(card);
  });
}

/* ============================================================
   🎯 SELECCIONAR PEDIDO DEL CARRUSEL
============================================================ */
function seleccionarPedido(pedidoId) {
  document
    .querySelectorAll(".turno-card")
    .forEach((card) => card.classList.remove("activo"));

  const cardSeleccionado = document.querySelector(
    `[data-pedido="${pedidoId}"]`
  );
  if (cardSeleccionado) {
    cardSeleccionado.classList.add("activo");
  }

  pedidoActivo = pedidoId;
  actualizarVista();
}

/* ============================================================
   🔘 CONFIGURAR BOTONES
============================================================ */
function inicializarBotones() {
  const btnCancelar = document.getElementById("btnCancelar");
  const btnEditar = document.getElementById("btnEditar");
  const btnEntregar = document.getElementById("btnEntregar");

  btnCancelar?.addEventListener("click", manejarCancelar);
  btnEditar?.addEventListener("click", manejarEditar);
  btnEntregar?.addEventListener("click", manejarEntregar);
}

/* ============================================================
   🪟 MODAL (solo cierres, abrir se hace en manejarEditar)
============================================================ */
function inicializarModal() {
  const modal = document.getElementById("editarModal");
  const modalClose = document.getElementById("modalClose");
  const cancelarBtn = document.getElementById("cancelarEdicion");
  const guardarBtn = document.getElementById("guardarCambios");

  const cerrar = () => modal.classList.remove("active");

  modalClose?.addEventListener("click", cerrar);
  cancelarBtn?.addEventListener("click", cerrar);

  guardarBtn?.addEventListener("click", async () => {
    await guardarCambiosEdicion();
  });
}

/* ============================================================
   🔄 ACTUALIZAR VISTA PRINCIPAL DEL PEDIDO
============================================================ */
function actualizarVista() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const btnEntregar = document.getElementById("btnEntregar");

  if (!pedido) return;

  // Solo se puede entregar si el pedido está en_proceso
  if (pedido.estado === "en_proceso") {
    btnEntregar?.classList.add("activo");
    btnEntregar?.removeAttribute("disabled");
  } else {
    btnEntregar?.classList.remove("activo");
    btnEntregar?.setAttribute("disabled", "disabled");
  }

  actualizarDetallesPanel(pedido);
  actualizarPrecioCarrusel(pedidoActivo, pedido.total);
}

/* ============================================================
   📋 PANEL DE DETALLES DEL PEDIDO
   (comentarios POR PRODUCTO, solo lectura)
============================================================ */
function actualizarDetallesPanel(pedido) {
  const detallesPanel = document.getElementById("detallesPanel");
  if (!detallesPanel) return;

  detallesPanel.innerHTML = `
    <div class="detalles-header">
      <h3>Pedido #${pedidoActivo} - ${escapeHtml(pedido.cliente || "")}</h3>
      <span class="total-pedido">Total: $${pedido.total.toFixed(2)}</span>
    </div>

    <div class="ordenes-container">
      <h4>Órdenes de comida</h4>
      <div class="ordenes-lista">
        ${
          pedido.ordenes.length
            ? pedido.ordenes
                .map((orden) => {
                  const tieneComentario = !!orden.comentario;
                  return `
            <div class="orden-item">
              <div class="orden-main">
                <span class="orden-nombre">${escapeHtml(
                  orden.nombre || ""
                )}</span>
                <span class="orden-cantidad">x${orden.cantidad}</span>
                <span class="orden-precio">$${orden.precio.toFixed(2)}</span>
              </div>
              <div class="orden-comentario">
                ${
                  tieneComentario
                    ? `
                  <span class="orden-comentario-label">Comentario:</span>
                  <span class="orden-comentario-text">
                    ${escapeHtml(orden.comentario)}
                  </span>
                `
                    : `
                  <span class="orden-comentario-empty">Sin comentarios</span>
                `
                }
              </div>
            </div>
          `;
                })
                .join("")
            : `<p style="font-size:0.9rem;color:#6b7280;">Este pedido no tiene platillos registrados.</p>`
        }
      </div>
    </div>

    <div class="info-adicional">
      <div class="info-item"><strong>Hora del pedido:</strong> ${
        pedido.horaPedido
      }</div>
      <div class="info-item"><strong>Hora estimada:</strong> ${
        pedido.horaEstimada
      }</div>
      <div class="info-item"><strong>Tiempo restante:</strong> ${calcularTiempoRestante(
        pedido.horaEstimada
      )}</div>
    </div>
  `;
}

/* ============================================================
   ⏱ CALCULAR TIEMPO RESTANTE
============================================================ */
function calcularTiempoRestante(horaEstimada) {
  const ahora = new Date();
  const [hr, min] = horaEstimada.split(":").map(Number);

  const estimada = new Date();
  estimada.setHours(hr, min, 0, 0);

  const diff = estimada - ahora;
  const mins = Math.max(0, Math.round(diff / 60000));

  return `${mins} min`;
}

/* ============================================================
   🧹 QUITAR PEDIDO DEL CARRUSEL (FRONT)
============================================================ */
function eliminarPedido(pedidoId) {
  const card = document.querySelector(`[data-pedido="${pedidoId}"]`);
  if (!card) return;

  card.style.opacity = "0";
  card.style.transform = "scale(0.8)";

  setTimeout(() => {
    card.remove();
    delete pedidosData[pedidoId];

    actualizarTotalPedidos();

    if (pedidoId === pedidoActivo) {
      const nextCard = document.querySelector(".turno-card");
      if (nextCard) {
        seleccionarPedido(nextCard.dataset.pedido);
      } else {
        pedidoActivo = null;
        const panel = document.getElementById("detallesPanel");
        if (panel) {
          panel.innerHTML = `
            <div style="text-align:center;padding:3rem;color:#666;">
              <h3>No hay pedidos en cocina</h3>
              <p>Todos los pedidos han sido completados.</p>
            </div>
          `;
        }
      }
    }
  }, 300);
}

/* ============================================================
   ✅ ENTREGAR PEDIDO (FRONT + BACKEND)
============================================================ */
async function entregarPedidoBackend(pedidoId) {
  const pedido = pedidosData[pedidoId];
  if (!pedido) return;

  try {
    const res = await fetch(`/api/orders/${pedido.id}/deliver`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Error en la respuesta");

    alert(`Pedido #${pedidoId} marcado como ENTREGADO.`);

    // recargamos pedidos
    await cargarPedidos();
  } catch (err) {
    console.error(err);
    alert("No se pudo marcar el pedido como entregado.");
  }
}

/* ============================================================
   🚫 CANCELAR PEDIDO (FRONT + BACKEND)
============================================================ */
async function cancelarPedidoBackend(pedidoId) {
  const pedido = pedidosData[pedidoId];
  if (!pedido) return;

  if (!confirm("¿Seguro que quieres CANCELAR este pedido?")) return;

  try {
    const res = await fetch(`/api/orders/${pedido.id}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Error en la respuesta");

    alert(`Pedido #${pedidoId} ha sido CANCELADO.`);

    await cargarPedidos();
  } catch (err) {
    console.error(err);
    alert("No se pudo cancelar el pedido.");
  }
}

/* ============================================================
   🧮 ACTUALIZAR PRECIO EN LA TARJETA DEL CARRUSEL
============================================================ */
function actualizarPrecioCarrusel(pedidoId, nuevoTotal) {
  const card = document.querySelector(`[data-pedido="${pedidoId}"]`);
  if (!card) return;

  const costoSpan = card.querySelector(".costo");
  if (costoSpan) costoSpan.textContent = `$${Number(nuevoTotal).toFixed(2)}`;
}

/* ============================================================
   🧑‍🍳 MANEJADORES DE BOTONES SUPERIORES
============================================================ */
function manejarCancelar() {
  if (!pedidoActivo) return;
  cancelarPedidoBackend(pedidoActivo);
}

function manejarEntregar() {
  if (!pedidoActivo) return;
  entregarPedidoBackend(pedidoActivo);
}

/* ============================================================
   ✏️ EDITAR PEDIDO (ABRIR MODAL)
   🔴 NO SE EDITAN COMENTARIOS
============================================================ */
function manejarEditar() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const modal = document.getElementById("editarModal");
  const modalBody = document.getElementById("modalBody");
  const modalId = document.getElementById("modalPedidoId");

  if (!pedido || !modal || !modalBody || !modalId) return;

  modalId.textContent = pedidoActivo;

  // Solo cantidades y platillos, sin comentarios
  modalBody.innerHTML = `
    <div class="menu-items">
      ${pedido.ordenes
        .map(
          (item, index) => `
        <div class="menu-item" data-index="${index}">
          <div class="item-info">
            <span class="item-name">${escapeHtml(item.nombre)}</span>
            <span class="item-quantity">Precio: $${item.precio.toFixed(
              2
            )}</span>
          </div>
          <div class="item-controls">
            <div class="quantity-controls">
              <button type="button" class="qty-minus">-</button>
              <span class="qty-value">${item.cantidad}</span>
              <button type="button" class="qty-plus">+</button>
            </div>
            <button type="button" class="remove-item">×</button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  // Listeners de +, -, eliminar
  modalBody.querySelectorAll(".menu-item").forEach((row) => {
    const minusBtn = row.querySelector(".qty-minus");
    const plusBtn = row.querySelector(".qty-plus");
    const valueSpan = row.querySelector(".qty-value");
    const removeBtn = row.querySelector(".remove-item");

    minusBtn.addEventListener("click", () => {
      let val = parseInt(valueSpan.textContent, 10);
      val = Math.max(1, val - 1);
      valueSpan.textContent = val;
    });

    plusBtn.addEventListener("click", () => {
      let val = parseInt(valueSpan.textContent, 10);
      val = Math.min(99, val + 1);
      valueSpan.textContent = val;
    });

    removeBtn.addEventListener("click", () => {
      row.remove();
    });
  });

  modal.classList.add("active");
}

/* ============================================================
   💾 GUARDAR CAMBIOS DESDE EL MODAL (EDITAR)
   (se mantienen comentarios en el backend, no se envían nuevos)
============================================================ */
async function guardarCambiosEdicion() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const modal = document.getElementById("editarModal");
  const modalBody = document.getElementById("modalBody");

  if (!pedido || !modal || !modalBody) return;

  // Leer items del modal
  const nuevosItems = [];
  modalBody.querySelectorAll(".menu-item").forEach((row) => {
    const nombre = row.querySelector(".item-name").textContent.trim();
    const precioTxt = row
      .querySelector(".item-quantity")
      .textContent.replace("Precio: $", "")
      .trim();
    const cantidad =
      parseInt(row.querySelector(".qty-value").textContent, 10) || 1;
    const precio = Number(precioTxt) || 0;

    nuevosItems.push({ nombre, cantidad, precio });
  });

  if (nuevosItems.length === 0) {
    alert("El pedido debe tener al menos un platillo.");
    return;
  }

  const nuevoTotal = nuevosItems.reduce(
    (acc, it) => acc + it.cantidad * it.precio,
    0
  );

  try {
    const res = await fetch(`/api/orders/${pedido.id}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: nuevosItems,
        // No mandamos comentarios para que no se editen
      }),
    });

    if (!res.ok) throw new Error("Error al guardar cambios");

    // Recargamos desde backend para refrescar cantidades, total y comentarios
    await cargarPedidos();
    if (pedidoActivo && pedidosData[pedidoActivo]) {
      seleccionarPedido(pedidoActivo);
    }

    modal.classList.remove("active");
    alert("Pedido actualizado correctamente.");
  } catch (err) {
    console.error(err);
    alert("No se pudo actualizar el pedido.");
  }
}

/* ============================================================
   🧱 SIDEBAR CORRECTO (ABRIR / CERRAR)
============================================================ */
function setupSidebarDashboard() {
  const sidebar = document.querySelector(".menu-dashboard");
  const toggle = document.querySelector(".toggle");
  const toggleIcon = toggle ? toggle.querySelector("i") : null;

  if (!sidebar || !toggle) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");

    if (toggleIcon) {
      toggleIcon.classList.toggle("bx-menu");
      toggleIcon.classList.toggle("bx-x");
    }
  });

  document.querySelectorAll(".menu .enlace").forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.add("open");
      if (toggleIcon) {
        toggleIcon.classList.remove("bx-menu");
        toggleIcon.classList.add("bx-x");
      }
    });
  });
}

// /* ============================================================
//    🔐 VALIDACIÓN DE LOGIN + LOGOUT (EMPLEADOS)
// ============================================================ */
// function findLoginPath() {
//   const paths = [
//     "../../login/login.html",
//     "../../../login/login.html",
//     "../../../../login/login.html",
//     "/frontend/login/login.html",
//     "/login/login.html",
//   ];

//   for (let path of paths) {
//     const xhr = new XMLHttpRequest();
//     xhr.open("HEAD", path, false);

//     try {
//       xhr.send();
//       if (xhr.status !== 404) return path;
//     } catch (_) {}
//   }

//   return "/login/login.html";
// }

// function initEmployeeAuth() {
//   const loginUrl = findLoginPath();
//   const logoutBtn = document.getElementById("logoutBtn");
//   const sidebarUserName = document.getElementById("sidebarUserName");
//   const sidebarUserImg = document.getElementById("sidebarUserImg");
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");

//   if (!token || !user || user.role !== "empleado") {
//     window.location.href = loginUrl;
//     return;
//   }

//   if (user && sidebarUserName) {
//     sidebarUserName.textContent = user.name || "Empleado";
//     if (user.profile_picture) {
//       sidebarUserImg.src = "/uploads/" + user.profile_picture;
//     }
//   }

//   logoutBtn?.addEventListener("click", () => {
//     if (confirm("¿Seguro que quieres cerrar sesión?")) {
//       localStorage.clear();
//       window.location.href = loginUrl;
//     }
//   });
// }

/* ============================================================
   🎨 MODO OSCURO / CLARO (EMPLEADOS)
============================================================ */
function initEmployeeTheme() {
  const themeToggle = document.getElementById("employeeThemeToggle");
  if (!themeToggle) return;

  const icon = themeToggle.querySelector("i");
  const text = themeToggle.querySelector("span");

  const savedTheme = localStorage.getItem("employee-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("admin-dark");
    if (icon) icon.classList.replace("bx-moon", "bx-sun");
    if (text) text.textContent = "Modo claro";
  }

  themeToggle.addEventListener("click", () => {
    const nowDark = document.body.classList.toggle("admin-dark");
    localStorage.setItem("employee-theme", nowDark ? "dark" : "light");

    if (icon && text) {
      if (nowDark) {
        icon.classList.replace("bx-moon", "bx-sun");
        text.textContent = "Modo claro";
      } else {
        icon.classList.replace("bx-sun", "bx-moon");
        text.textContent = "Modo oscuro";
      }
    }
  });
}

/* ============================================================
   🌐 MENÚ DE IDIOMAS EN SIDEBAR
   (solo abre/cierra el dropdown; la lógica de traducción
    global puede reutilizar estos IDs si ya la tienes)
============================================================ */
function initTranslateDropdown() {
  const toggleBtn = document.getElementById("translate-toggle");
  const menu = document.getElementById("translate-menu");
  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
}

/* ============================================================
   AUTO-REFRESH CADA 2 SEGUNDOS
============================================================ */
setInterval(async () => {
  const pedidoAnterior = pedidoActivo;
  await cargarPedidos();

  if (pedidoAnterior && pedidosData[pedidoAnterior]) {
    seleccionarPedido(pedidoAnterior);
  }
}, 2000);
