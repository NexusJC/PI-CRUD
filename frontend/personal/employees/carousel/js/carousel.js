/* ============================================================
   VARIABLES GLOBALES
============================================================ */
let pedidoActivo = null;
let pedidosData = {};
let dishesCache = [];
let nuevoPedidoItems = [];
let editItems = []; 

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
          horaEstimada: p.created_at.substring(11, 16), // de momento lo mismo
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
   📥 CARGAR PLATILLOS (para NUEVO PEDIDO)
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
  const catSel = document.getElementById("npCategoria");
  const dishSel = document.getElementById("npPlatillo");
  if (!catSel || !dishSel) return null;

  const cat = catSel.value;
  const nombre = dishSel.options[dishSel.selectedIndex]?.textContent || "";

  return (
    dishesCache.find(
      (d) =>
        (d.categoria || "").toString().trim() === cat &&
        d.nombre.toString().trim() === nombre
    ) || null
  );
}

/* ============================================================
   📝 LISTA DE ITEMS DEL NUEVO PEDIDO
============================================================ */
function renderListaNuevoPedido() {
  const cont = document.getElementById("npLista");
  const totalEl = document.getElementById("npTotal");
  if (!cont || !totalEl) return;

  if (!nuevoPedidoItems.length) {
    cont.innerHTML =
      '<p class="np-empty">No hay productos agregados aún.</p>';
    totalEl.textContent = "$0.00";
    return;
  }

  const html = nuevoPedidoItems
    .map(
      (item, index) => `
      <div class="np-item" data-index="${index}">
        <div class="np-item-main">
          <span class="np-item-name">${item.name}</span>
          <span class="np-item-info">x${item.qty} · $${item.unit.toFixed(
            2
          )}</span>
        </div>
        <div class="np-item-comment">
          ${item.comment ? item.comment : "Sin comentarios"}
        </div>
        <button class="np-item-remove" type="button" data-index="${index}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `
    )
    .join("");

  cont.innerHTML = html;

  cont.querySelectorAll(".np-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      if (!Number.isNaN(idx)) {
        nuevoPedidoItems.splice(idx, 1);
        renderListaNuevoPedido();
      }
    });
  });

  const total = nuevoPedidoItems.reduce(
    (sum, it) => sum + it.unit * it.qty,
    0
  );
  totalEl.textContent = `$${total.toFixed(2)}`;
}

/* ============================================================
   🪟 MODAL NUEVO PEDIDO (ABRIR / CERRAR / CREAR)
============================================================ */
function abrirModalNuevoPedido() {
  const modal = document.getElementById("nuevoPedidoModal");
  const clienteInput = document.getElementById("npCliente");
  const qtyInput = document.getElementById("npCantidad");
  const commentInput = document.getElementById("npComentario");
  if (!modal) return;

  nuevoPedidoItems = [];

  if (clienteInput) clienteInput.value = "";
  if (qtyInput) qtyInput.value = 1;
  if (commentInput) commentInput.value = "";

  renderListaNuevoPedido();
  modal.classList.add("active");
}

function cerrarModalNuevoPedido() {
  const modal = document.getElementById("nuevoPedidoModal");
  if (modal) modal.classList.remove("active");
}

async function crearPedidoDesdeModal() {
  if (!nuevoPedidoItems.length) {
    alert("Agrega al menos un platillo al pedido.");
    return;
  }

  const clienteInput = document.getElementById("npCliente");
  const nombreCliente =
    (clienteInput?.value || "").trim() ||
    (JSON.parse(localStorage.getItem("user") || "null")?.name || "Cliente");

  // 👇 Aquí está el cambio importante: quantity / price / comments
  const items = nuevoPedidoItems.map((it) => ({
    name: it.name,
    quantity: it.qty,
    price: it.unit,
    comments: it.comment || ""
  }));

  const total = nuevoPedidoItems.reduce(
    (sum, it) => sum + it.unit * it.qty,
    0
  );

  try {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({
        customerName: nombreCliente,
        items,
        total
      })
    });

    const data = await res.json();

    if (!data.success) {
      console.error("Error al crear pedido:", data);
      alert("No se pudo crear el pedido.");
      return;
    }

    alert(`Pedido enviado (#${data.orderNumber})`);

    cerrarModalNuevoPedido();

    // Recargar pedidos y seleccionar el nuevo
    await cargarPedidos();
    if (data.orderNumber && pedidosData[data.orderNumber]) {
      seleccionarPedido(data.orderNumber);
    }
  } catch (err) {
    console.error("Error fetch /api/orders/create desde cocina:", err);
    alert("Error de conexión con el servidor.");
  }
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
const qtyInput = document.getElementById("npCantidad");

if (qtyInput) {
  // Permite borrar todo, pero valida cuando se escribe algo
  qtyInput.addEventListener("input", () => {
    const val = qtyInput.value;

    // Si está vacío, dejamos que el usuario escriba
    if (val === "") return;

    let num = parseInt(val, 10);

    if (Number.isNaN(num) || num < 1) {
      num = 1;
    } else if (num > 99) {
      num = 99;
    }

    qtyInput.value = String(num);
  });

  // Al salir del input, si quedó vacío o inválido → 1
  qtyInput.addEventListener("blur", () => {
    let val = qtyInput.value;
    let num = parseInt(val, 10);

    if (val === "" || Number.isNaN(num) || num < 1) {
      qtyInput.value = "1";
    } else if (num > 99) {
      qtyInput.value = "99";
    }
  });

  // No permitir "-" ni notación científica
  qtyInput.addEventListener("keydown", (e) => {
    if (e.key === "-" || e.key === "e") e.preventDefault();
  });
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

/* Modal "nuevo pedido": listeners */
function inicializarNuevoPedidoModal() {
  const btnAgregar = document.getElementById("btnAgregarPedido");
  const modalClose = document.getElementById("nuevoPedidoClose");
  const btnCancelar = document.getElementById("npCancelar");
  const btnCrear = document.getElementById("npCrear");
  const categoriaSelect = document.getElementById("npCategoria");
  const btnAgregarItem = document.getElementById("npAgregarItem");

  if (btnAgregar) {
    btnAgregar.addEventListener("click", async () => {
      await cargarDishesSiHaceFalta();
      renderCategoriasSelect();
      abrirModalNuevoPedido();
    });
  }

  modalClose?.addEventListener("click", cerrarModalNuevoPedido);
  btnCancelar?.addEventListener("click", cerrarModalNuevoPedido);

  if (categoriaSelect) {
    categoriaSelect.addEventListener("change", (e) => {
      renderPlatillosPorCategoria(e.target.value);
    });
  }

  if (btnAgregarItem) {
    btnAgregarItem.addEventListener("click", () => {
      const dish = buscarDishSeleccionado();
      const qtyInput = document.getElementById("npCantidad");
      const commentInput = document.getElementById("npComentario");

      if (!dish) {
        alert("Selecciona un platillo válido.");
        return;
      }

    let qty = parseInt(qtyInput?.value, 10);

if (Number.isNaN(qty) || qty < 1) {
  qty = 1;
} else if (qty > 99) {
  qty = 99;
}
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
      if (qtyInput) qtyInput.value = 1;
    });
  }

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
   🔘 BOTONES PRINCIPALES
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
   🪟 MODAL EDICIÓN (solo cierre / guardar)
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

  // Confirmar entrega solo si está en proceso
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
   📋 PANEL DE DETALLES (con comentarios por producto)
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
   ⏱ TIEMPO RESTANTE
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
   🧹 ELIMINAR PEDIDO DEL CARRUSEL (FRONT)
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
   ✅ ENTREGAR PEDIDO (BACK + REFRESH)
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
   🚫 CANCELAR PEDIDO (BACK + REFRESH)
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
   HANDLERS SIMPLES PARA LOS BOTONES
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
   ✏️ EDITAR ORDEN (CANTIDADES Y QUITAR PLATILLOS)
============================================================ */
function manejarEditar() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const modal = document.getElementById("editarModal");
  const modalBody = document.getElementById("modalBody");
  const modalId = document.getElementById("modalPedidoId");

  if (!pedido || !modal || !modalBody || !modalId) return;

  modalId.textContent = pedidoActivo;

  // Clonamos la lista para no modificar la original hasta guardar
  editItems = pedido.ordenes.map((item) => ({ ...item }));

  renderItemsEdicion();
  modal.classList.add("active");
}

function renderItemsEdicion() {
  const modalBody = document.getElementById("modalBody");
  if (!modalBody) return;

  if (!editItems.length) {
    modalBody.innerHTML = `
      <div class="edit-items">
        <p class="edit-empty">Este pedido no tiene platillos.</p>
      </div>
    `;
    return;
  }

  const total = editItems.reduce(
    (acc, it) => acc + Number(it.cantidad) * Number(it.precio),
    0
  );

  modalBody.innerHTML = `
    <div class="edit-items">
      ${editItems
        .map(
          (item, index) => `
        <div class="edit-item" data-index="${index}">
          <div class="edit-item-header">
            <span class="edit-item-name">${item.nombre}</span>
            <span class="edit-item-unit">$${Number(item.precio).toFixed(
              2
            )} c/u</span>
          </div>
          <div class="edit-item-controls">
            <button type="button" class="edit-qty-btn edit-qty-dec">−</button>
            <input type="number" class="edit-qty-input" min="1" max="99" value="${item.cantidad}">
            <button type="button" class="edit-qty-btn edit-qty-inc">+</button>
            <button type="button" class="edit-remove-btn">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `
        )
        .join("")}
      <div class="edit-resumen">
        <span>Total del pedido:</span>
        <strong>$${total.toFixed(2)}</strong>
      </div>
    </div>
  `;

  modalBody.querySelectorAll(".edit-item").forEach((row, index) => {
    const decBtn = row.querySelector(".edit-qty-dec");
    const incBtn = row.querySelector(".edit-qty-inc");
    const qtyInput = row.querySelector(".edit-qty-input");
    const removeBtn = row.querySelector(".edit-remove-btn");

    decBtn?.addEventListener("click", () => {
      const current = Number(editItems[index].cantidad) || 1;
      const next = Math.max(1, current - 1);
      editItems[index].cantidad = next;
      renderItemsEdicion();
    });

    incBtn?.addEventListener("click", () => {
      const current = Number(editItems[index].cantidad) || 1;
      const next = Math.min(99, current + 1);
      editItems[index].cantidad = next;
      renderItemsEdicion();
    });

    qtyInput?.addEventListener("change", () => {
      let val = parseInt(qtyInput.value, 10);
      if (Number.isNaN(val) || val < 1) val = 1;
      if (val > 99) val = 99;
      editItems[index].cantidad = val;
      renderItemsEdicion();
    });

    removeBtn?.addEventListener("click", () => {
      editItems.splice(index, 1);
      renderItemsEdicion();
    });
  });
}

/* ============================================================
   💾 GUARDAR CAMBIOS DE LA ORDEN
============================================================ */
async function guardarCambiosEdicion() {
  if (!pedidoActivo) return;

  const pedido = pedidosData[pedidoActivo];
  const modal = document.getElementById("editarModal");
  if (!pedido || !modal) return;

  if (!editItems.length) {
    alert("El pedido debe tener al menos un platillo.");
    return;
  }

  const nuevosItems = editItems.map((it) => ({
    nombre: it.nombre,
    cantidad: Number(it.cantidad),
    precio: Number(it.precio),
    // Seguimos enviando el comentario aunque ya no se edite aquí
    comments: it.comentario || ""
  }));

  const nuevoTotal = nuevosItems.reduce(
    (acc, it) => acc + it.cantidad * it.precio,
    0
  );

  try {
    const res = await fetch(`/api/orders/${pedido.id}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nuevosItems })
    });

    if (!res.ok) throw new Error("Error al guardar cambios");

    // Actualizamos los datos en memoria
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
    alert("Orden actualizada correctamente.");
  } catch (err) {
    console.error(err);
    alert("No se pudo actualizar el pedido.");
  }
}
