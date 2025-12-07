/* ============================================================
   VARIABLES GLOBALES
============================================================ */
let pedidoActivo = null;
let pedidosData = {};        // se llenará desde el backend
let dishesCache = [];        // cache de platillos para "Nuevo pedido"
let nuevoPedidoItems = [];   // items que se agregan al nuevo pedido

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
   📥 CARGAR PLATILLOS (para nuevo pedido)
============================================================ */
async function cargarDishesSiHaceFalta() {
  if (dishesCache.length) return;

  try {
    const res = await fetch("/api/dishes");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Respuesta inválida de /api/dishes");
      return;
    }

    dishesCache = data;
  } catch (err) {
    console.error("Error al cargar platillos para nuevo pedido:", err);
  }
}

function obtenerCategoriasDesdeDishes() {
  const set = new Set();

  dishesCache.forEach((d) => {
    const cat = (d.categoria || "Otros").toString().trim();
    if (cat) set.add(cat);
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

function renderCategoriasSelect() {
  const select = document.getElementById("npCategoria");
  if (!select) return;

  const categorias = obtenerCategoriasDesdeDishes();
  select.innerHTML = categorias
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");

  if (categorias.length) {
    select.value = categorias[0];
    renderPlatillosPorCategoria(categorias[0]);
  }
}

function renderPlatillosPorCategoria(categoria) {
  const platSelect = document.getElementById("npPlatillo");
  if (!platSelect) return;

  const lista = dishesCache.filter(
    (d) => (d.categoria || "").toString().trim() === categoria
  );

  platSelect.innerHTML = lista
    .map((d) => `<option value="${d.id || d.nombre}">${d.nombre}</option>`)
    .join("");

  if (!lista.length) {
    platSelect.innerHTML =
      '<option value="" disabled selected>No hay platillos</option>';
  }
}

function buscarDishSeleccionado() {
  const categoriaSelect = document.getElementById("npCategoria");
  const platSelect = document.getElementById("npPlatillo");
  if (!categoriaSelect || !platSelect) return null;

  const cat = categoriaSelect.value;
  const val = platSelect.value;

  return dishesCache.find(
    (d) =>
      (d.categoria || "").toString().trim() === cat &&
      (d.id?.toString() === val || d.nombre === val)
  );
}

/* ============================================================
   🔄 CARGAR DETALLES DE CADA PEDIDO (items + comentarios)
============================================================ */
async function cargarDetallesDeCadaPedido() {
  const numeros = Object.keys(pedidosData);

  for (let num of numeros) {
    const idReal = pedidosData[num].id;

    try {
      const res = await fetch(`/api/orders/${idReal}/details`);
      const data = await res.json();

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
   🔧 INICIALIZACIÓN GLOBAL
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await cargarPedidos();
  inicializarBotones();
  inicializarModal();
  inicializarNuevoPedidoModal();
  console.log("Panel de cocina listo con pedidos reales");
});

/* ============================================================
   MODAL "NUEVO PEDIDO"
============================================================ */
function abrirModalNuevoPedido() {
  const modal = document.getElementById("nuevoPedidoModal");
  const lista = document.getElementById("npLista");
  const totalLabel = document.getElementById("npTotal");
  const nombreInput = document.getElementById("npCliente");
  const comentarioInput = document.getElementById("npComentario");
  const qtyInput = document.getElementById("npCantidad");

  if (!modal) return;

  nuevoPedidoItems = [];

  if (lista) {
    lista.innerHTML =
      '<p class="np-empty">No hay productos agregados aún.</p>';
  }

  if (totalLabel) totalLabel.textContent = "$0.00";
  if (nombreInput) {
    nombreInput.value = "";
    nombreInput.classList.remove("input-error");
  }
  if (comentarioInput) comentarioInput.value = "";
  if (qtyInput) qtyInput.value = "1";

  modal.classList.add("active");
}

function cerrarModalNuevoPedido() {
  const modal = document.getElementById("nuevoPedidoModal");
  if (modal) modal.classList.remove("active");
}

function renderListaNuevoPedido() {
  const lista = document.getElementById("npLista");
  const totalLabel = document.getElementById("npTotal");

  if (!lista) return;

  if (!nuevoPedidoItems.length) {
    lista.innerHTML =
      '<p class="np-empty">No hay productos agregados aún.</p>';
    if (totalLabel) totalLabel.textContent = "$0.00";
    return;
  }

  let total = 0;

  lista.innerHTML = nuevoPedidoItems
    .map((it, idx) => {
      const subtotal = it.qty * it.unit;
      total += subtotal;

      return `
        <div class="np-item">
          <div class="np-item-main">
            <div>
              <strong>${it.name}</strong>
              <p class="np-item-comment">${it.comment || "Sin comentarios"}</p>
            </div>
            <div class="np-item-meta">
              <span>x${it.qty}</span>
              <span>$${it.unit.toFixed(2)}</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="button"
            class="np-remove"
            data-index="${idx}"
          >
            Eliminar
          </button>
        </div>
      `;
    })
    .join("");

  lista.querySelectorAll(".np-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      nuevoPedidoItems.splice(idx, 1);
      renderListaNuevoPedido();
    });
  });

  if (totalLabel) totalLabel.textContent = `$${total.toFixed(2)}`;
}

async function crearPedidoDesdeModal() {
  if (!nuevoPedidoItems.length) {
    alert("Debes agregar al menos un platillo al pedido.");
    return;
  }

  const clienteInput = document.getElementById("npCliente");
  const nombreCliente = (clienteInput?.value || "").trim();

  // ✅ Validar nombre obligatorio (mínimo 3 letras)
  if (!nombreCliente || nombreCliente.length < 3) {
    alert("Escribe el nombre del cliente (mínimo 3 caracteres).");
    if (clienteInput) {
      clienteInput.classList.add("input-error");
      clienteInput.focus();
    }
    return;
  } else {
    clienteInput?.classList.remove("input-error");
  }

  const total = nuevoPedidoItems.reduce(
    (acc, it) => acc + it.qty * it.unit,
    0
  );

  try {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: nombreCliente,
        total,
        items: nuevoPedidoItems.map((it) => ({
          name: it.name,
          quantity: it.qty,
          price: it.unit,
          comments: it.comment || ""
        }))
      })
    });

    if (!res.ok) throw new Error("Error al crear el pedido");

    alert("Pedido creado correctamente.");
    cerrarModalNuevoPedido();
    await cargarPedidos();
  } catch (err) {
    console.error("Error creando pedido:", err);
    alert("No se pudo crear el nuevo pedido.");
  }
}

/* ============================================================
   Modal "nuevo pedido": listeners
============================================================ */
function inicializarNuevoPedidoModal() {
  const btnAgregar = document.getElementById("btnAgregarPedido");
  const modalClose = document.getElementById("nuevoPedidoClose");
  const btnCancelar = document.getElementById("npCancelar");
  const btnCrear = document.getElementById("npCrear");
  const categoriaSelect = document.getElementById("npCategoria");
  const btnAgregarItem = document.getElementById("npAgregarItem");
  const qtyInput = document.getElementById("npCantidad");

  // Abrir modal
  if (btnAgregar) {
    btnAgregar.addEventListener("click", async () => {
      await cargarDishesSiHaceFalta();
      renderCategoriasSelect();
      abrirModalNuevoPedido();
    });
  }

  // Cerrar modal
  modalClose?.addEventListener("click", cerrarModalNuevoPedido);
  btnCancelar?.addEventListener("click", cerrarModalNuevoPedido);

  // Cambiar categoría
  if (categoriaSelect) {
    categoriaSelect.addEventListener("change", (e) => {
      renderPlatillosPorCategoria(e.target.value);
    });
  }

  // ✅ Reglas para el input de cantidad (1–99, puede quedar vacío mientras escriben)
  if (qtyInput) {
    qtyInput.addEventListener("input", () => {
      const raw = qtyInput.value;

      // Permitir que quede vacío mientras escribe
      if (raw === "") return;

      let val = parseInt(raw, 10);
      if (Number.isNaN(val) || val < 1) val = 1;
      if (val > 99) val = 99;

      qtyInput.value = String(val);
    });

    qtyInput.addEventListener("blur", () => {
      // Si lo dejan vacío al salir, volver a 1
      if (qtyInput.value === "") {
        qtyInput.value = "1";
      }
    });

    qtyInput.addEventListener("keydown", (e) => {
      // Evitar "-", "e", etc.
      if (e.key === "-" || e.key === "e") {
        e.preventDefault();
      }
    });
  }

  // Agregar item a la lista
  if (btnAgregarItem) {
    btnAgregarItem.addEventListener("click", () => {
      const dish = buscarDishSeleccionado();
      const qtyInputLocal = document.getElementById("npCantidad");
      const commentInput = document.getElementById("npComentario");

      if (!dish) {
        alert("Selecciona un platillo válido.");
        return;
      }

      const qty = Math.max(
        1,
        Math.min(99, parseInt(qtyInputLocal?.value || "1", 10))
      );
      const comment = (commentInput?.value || "").trim();

      const unit =
        typeof dish.precio === "number"
          ? dish.precio
          : parseFloat(dish.precio || "0") || 0;

      nuevoPedidoItems.push({
        name: dish.nombre,
        qty,
        unit,
        comment
      });

      renderListaNuevoPedido();
      if (commentInput) commentInput.value = "";
      if (qtyInputLocal) qtyInputLocal.value = "1";
    });
  }

  // Crear pedido
  btnCrear?.addEventListener("click", () => {
    crearPedidoDesdeModal();
  });
}

/* ============================================================
   🧱 RENDER DEL CARRUSEL
============================================================ */
function renderizarCarrusel() {
  const cont = document.getElementById("turnosCarousel");
  cont.innerHTML = "";

  Object.entries(pedidosData).forEach(([num, p]) => {
    const card = document.createElement("div");
    card.className = "turno-card";
    card.dataset.pedido = num;

    const estadoLabel =
      p.estado === "en_proceso" ? "EN PROCESO" : "PENDIENTE";

    card.innerHTML = `
      <div class="turno-id">#${num}</div>
      <div class="turno-cliente">${p.cliente}</div>
      <div class="turno-total">$${p.total.toFixed(2)}</div>
      <span class="turno-estado turno-${p.estado}">${estadoLabel}</span>
    `;

    card.addEventListener("click", () => {
      seleccionarPedido(num);
    });

    cont.appendChild(card);
  });
}

function seleccionarPedido(num) {
  pedidoActivo = num;

  document
    .querySelectorAll(".turno-card")
    .forEach((c) => c.classList.remove("active"));

  const card = document.querySelector(
    `.turno-card[data-pedido="${num}"]`
  );
  if (card) card.classList.add("active");

  actualizarVista();
}

/* ============================================================
   🧾 PANEL DE DETALLES
============================================================ */
function actualizarVista() {
  const panel = document.getElementById("detallesPanel");
  if (!pedidoActivo || !pedidosData[pedidoActivo]) {
    panel.innerHTML =
      "<p>Selecciona un pedido del carrusel para ver sus detalles.</p>";
    return;
  }

  const p = pedidosData[pedidoActivo];

  const itemsHTML = p.ordenes
    .map(
      (it) => `
      <div class="detalle-item">
        <div>
          <strong>${it.nombre}</strong>
          <p class="detalle-comentario">${
            it.comentario || "Sin comentarios"
          }</p>
        </div>
        <div class="detalle-meta">
          <span>x${it.cantidad}</span>
          <span>$${it.precio.toFixed(2)}</span>
          <span>$${(it.cantidad * it.precio).toFixed(2)}</span>
        </div>
      </div>
    `
    )
    .join("");

  panel.innerHTML = `
    <h2>Pedido #${pedidoActivo} - ${p.cliente}</h2>
    <p class="detalle-sub">Órdenes de comida</p>
    <div class="detalle-lista">
      ${itemsHTML || "<p>Sin productos en este pedido.</p>"}
    </div>
    <div class="detalle-footer">
      <span>Total del pedido</span>
      <strong>$${p.total.toFixed(2)}</strong>
    </div>
  `;
}

/* ============================================================
   MODAL EDICIÓN (SOLO COMENTARIOS)
============================================================ */
function inicializarModal() {
  const modal = document.getElementById("editarModal");
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalClose");
  const guardarBtn = document.getElementById("modalGuardar");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        modal.classList.remove("active");
      }
    });
  }

  if (guardarBtn) {
    guardarBtn.addEventListener("click", () => {
      guardarCambiosEdicion();
    });
  }
}

/* ============================================================
   ✅ ENTREGAR / CANCELAR PEDIDO (BACK + REFRESH)
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

function actualizarPrecioCarrusel(pedidoId, nuevoTotal) {
  const card = document.querySelector(`[data-pedido="${pedidoId}"]`);
  if (!card) return;

  const costoSpan = card.querySelector(".turno-total");
  if (costoSpan) costoSpan.textContent = `$${Number(nuevoTotal).toFixed(2)}`;
}

/* ============================================================
   BOTONES SUPERIORES
============================================================ */
function manejarCancelar() {
  if (!pedidoActivo) return;
  cancelarPedidoBackend(pedidoActivo);
}

function manejarEntregar() {
  if (!pedidoActivo) return;
  entregarPedidoBackend(pedidoActivo);
}

function manejarEditar() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const modal = document.getElementById("editarModal");
  const modalBody = document.getElementById("modalBody");
  const modalId = document.getElementById("modalPedidoId");

  if (!pedido || !modal || !modalBody || !modalId) return;

  modalId.textContent = pedidoActivo;

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
      })
    });

    if (!res.ok) throw new Error("Error al guardar cambios");

    pedidosData[pedidoActivo].ordenes = nuevosItems.map((it) => ({
      nombre: it.nombre,
      cantidad: it.cantidad,
      precio: it.precio,
      comentario: it.comments || ""
    }));
    pedidosData[pedidoActivo].total = nuevoTotal;

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
   HANDLERS / AUTOREFRESH / BOTONES
============================================================ */
function inicializarBotones() {
  const btnCancelar = document.getElementById("btnCancelarPedido");
  const btnEntregar = document.getElementById("btnEntregarPedido");
  const btnEditar = document.getElementById("btnEditarPedido");

  btnCancelar?.addEventListener("click", manejarCancelar);
  btnEntregar?.addEventListener("click", manejarEntregar);
  btnEditar?.addEventListener("click", manejarEditar);
}

// Auto-refresh cada 2 segundos
setInterval(async () => {
  const pedidoAnterior = pedidoActivo;
  await cargarPedidos();

  if (pedidoAnterior && pedidosData[pedidoAnterior]) {
    seleccionarPedido(pedidoAnterior);
  }
}, 2000);
