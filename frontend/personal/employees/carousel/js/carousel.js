/* ============================================================
   VARIABLES GLOBALES
============================================================ */
let pedidoActivo = null;
let pedidosData = {}; // se llenará desde el backend

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
          ordenes: []
        };
      });

    await cargarDetallesDeCadaPedido();
    renderizarCarrusel();

    const first = Object.keys(pedidosData)[0];
    if (first) seleccionarPedido(first);
  } catch (err) {
    console.error("Error cargando pedidos:", err);
    alert("No se pudieron cargar los pedidos.");
  }
}

/* ============================================================
   🔄 CARGAR DETALLES DE CADA PEDIDO
   (incluye comentarios por platillo)
============================================================ */
async function cargarDetallesDeCadaPedido() {
  const numeros = Object.keys(pedidosData);

  for (let num of numeros) {
    const idReal = pedidosData[num].id;

    try {
      const res = await fetch(`/api/orders/${idReal}/details`);
      const data = await res.json();

      // Esperamos que el backend devuelva { items: [...] }
      pedidosData[num].ordenes = data.items.map((i) => ({
        nombre: i.dish_name,
        cantidad: Number(i.quantity),
        precio: Number(i.price),
        comentario: i.comments || ""
      }));
    } catch (err) {
      console.error("Error cargando detalles de pedido", num, err);
    }
  }
}

/* ============================================================
   🔧 INICIALIZACIÓN PRINCIPAL DEL SISTEMA
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await cargarPedidos();
  inicializarBotones();
  inicializarModal();
  console.log("Panel de cocina listo con pedidos reales");
});

/* ============================================================
   🧱 RENDER DEL CARRUSEL
============================================================ */
function renderizarCarrusel() {
  const cont = document.getElementById("turnosCarousel");
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
      <p class="cliente">${p.cliente}</p>
      <div class="estado estado-${p.estado}">
        ${p.estado}
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
   (comentarios por cada producto)
============================================================ */
function actualizarDetallesPanel(pedido) {
  const detallesPanel = document.getElementById("detallesPanel");

  detallesPanel.innerHTML = `
    <div class="detalles-header">
      <h3>Pedido #${pedidoActivo} – ${pedido.cliente}</h3>
      <span class="total-pedido">Total: $${pedido.total.toFixed(2)}</span>
    </div>

    <div class="ordenes-container">
      <h4>Órdenes de comida</h4>
      <div class="ordenes-lista">
        ${pedido.ordenes
          .map(
            (orden) => `
          <div class="orden-item">
            <div class="orden-item-main">
              <span class="orden-nombre">${orden.nombre}</span>
              <span class="orden-cantidad">x${orden.cantidad}</span>
              <span class="orden-precio">$${orden.precio.toFixed(2)}</span>
            </div>
            <div class="orden-comentario">
              <span class="orden-comentario-label">Comentario del cliente</span>
              <p class="orden-comentario-texto">${
                orden.comentario && orden.comentario.trim()
                  ? orden.comentario
                  : "Sin comentarios"
              }</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="info-adicional">
      <div class="info-item">
        <strong>Hora del pedido:</strong>
        <span>${pedido.horaPedido}</span>
      </div>
      <div class="info-item">
        <strong>Hora estimada:</strong>
        <span>${pedido.horaEstimada}</span>
      </div>
      <div class="info-item">
        <strong>Tiempo restante:</strong>
        <span class="tiempo-restante">${calcularTiempoRestante(
          pedido.horaEstimada
        )}</span>
      </div>
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

    if (pedidoId === pedidoActivo) {
      const nextCard = document.querySelector(".turno-card");
      if (nextCard) {
        seleccionarPedido(nextCard.dataset.pedido);
      } else {
        pedidoActivo = null;
        document.getElementById("detallesPanel").innerHTML = `
          <div style="text-align:center;padding:3rem;color:#666;">
            <h3>No hay pedidos en cocina</h3>
            <p>Todos los pedidos han sido completados.</p>
          </div>
        `;
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
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Error en la respuesta");

    alert(`Pedido #${pedidoId} marcado como ENTREGADO.`);

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
      headers: { "Content-Type": "application/json" }
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
   MANEJADORES DE BOTONES SUPERIORES
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
   ✏️ EDITAR (SOLO COMENTARIOS POR PRODUCTO)
============================================================ */
function manejarEditar() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const modal = document.getElementById("editarModal");
  const modalBody = document.getElementById("modalBody");
  const modalId = document.getElementById("modalPedidoId");

  if (!pedido || !modal || !modalBody || !modalId) return;

  modalId.textContent = pedidoActivo;

  // Construimos contenido del modal (solo comentarios)
  modalBody.innerHTML = `
    <div class="menu-items">
      ${pedido.ordenes
        .map(
          (item, index) => `
        <div class="menu-item" data-index="${index}">
          <div class="item-header">
            <span class="item-name">${item.nombre}</span>
            <span class="item-meta">
              x${item.cantidad} · $${item.precio.toFixed(2)}
            </span>
          </div>
          <span class="item-comment-label">Comentario del cliente</span>
          <textarea class="item-comment-input" rows="2">${
            item.comentario || ""
          }</textarea>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  modal.classList.add("active");
}

/* ============================================================
   💾 GUARDAR CAMBIOS (SOLO COMENTARIOS)
============================================================ */
async function guardarCambiosEdicion() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const modal = document.getElementById("editarModal");
  const modalBody = document.getElementById("modalBody");

  if (!pedido || !modal || !modalBody) return;

  const nuevosItems = [];

  modalBody.querySelectorAll(".menu-item").forEach((row) => {
    const index = Number(row.dataset.index);
    const baseItem = pedido.ordenes[index];

    const comentarioTexto =
      row.querySelector(".item-comment-input")?.value.trim() || "";

    nuevosItems.push({
      nombre: baseItem.nombre,
      cantidad: baseItem.cantidad,
      precio: baseItem.precio,
      comments: comentarioTexto
    });
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
        items: nuevosItems
        // si tu backend también maneja un comentario general de pedido,
        // aquí podrías agregar un campo "comments" extra.
      })
    });

    if (!res.ok) throw new Error("Error al guardar cambios");

    // Actualizar datos en memoria (solo comentarios + total)
    pedidosData[pedidoActivo].ordenes = nuevosItems.map((it) => ({
      nombre: it.nombre,
      cantidad: it.cantidad,
      precio: it.precio,
      comentario: it.comments || ""
    }));
    pedidosData[pedidoActivo].total = nuevoTotal;

    // Refrescar UI
    actualizarVista();
    renderizarCarrusel();

    modal.classList.remove("active");
    alert("Comentarios actualizados correctamente.");
  } catch (err) {
    console.error(err);
    alert("No se pudo actualizar el pedido.");
  }
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
