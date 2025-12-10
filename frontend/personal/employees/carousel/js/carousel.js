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
    // 🔥 Tomamos la caja del empleado (enviada desde el login)
    const user = JSON.parse(localStorage.getItem("user"));
    const cajaId = user?.caja_id;

    if (!cajaId) {
      console.error("❌ Empleado sin caja asignada.");
      return;
    }

    // 🔥 Ahora cargamos SOLO los pedidos de esa caja
    const res = await fetch(`/api/orders/list?caja_id=${cajaId}`);
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
          horaEstimada: p.created_at.substring(11, 16),
          ordenes: []
        };
      });

    // 🔧 Si por cualquier motivo ningún pedido viene como "en_proceso",
    // marcamos el PRIMERO como "en_proceso" para no quedarnos trabados.
    const numerosPedidos = Object.keys(pedidosData).sort(
      (a, b) => Number(a) - Number(b)
    );
    const hayEnProceso = numerosPedidos.some(
      (n) => pedidosData[n].estado === "en_proceso"
    );
    if (!hayEnProceso && numerosPedidos.length > 0) {
      const primero = numerosPedidos[0];
      pedidosData[primero].estado = "en_proceso";
    }

    await cargarDetallesDeCadaPedido();
    renderizarCarrusel();

    const first = Object.keys(pedidosData)[0];
    if (first) seleccionarPedido(first);
  } catch (err) {
    console.error("Error cargando pedidos:", err);
    console.warn("⚠ No se pudieron cargar los pedidos:", err);
  }
}
let cargando = false;

async function actualizarPedidos() {
  if (cargando) return; // evita duplicados
  cargando = true;

  try {
    await cargarPedidos();
  } catch (err) {
    console.warn("⚠ Error actualizando pedidos:", err);
  } finally {
    cargando = false;
  }
}

setInterval(actualizarPedidos, 3000);

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

/* 👉 FUNCIÓN FALTANTE: ACTUALIZA PLATILLOS SEGÚN LA CATEGORÍA SELECCIONADA */
function actualizarPlatillosSegunCategoria() {
  const categoriaSelect = document.getElementById("npCategoria");
  if (!categoriaSelect) return;

  const categoria = categoriaSelect.value;
  if (!categoria) return;

  renderPlatillosPorCategoria(categoria);
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
  let nombreCliente = (clienteInput?.value || "").trim();

  // ✅ Nombre obligatorio con mínimo 3 letras
  if (!nombreCliente || nombreCliente.length < 3) {
    alert("Escribe un nombre de cliente con al menos 3 caracteres.");
    if (clienteInput) {
      clienteInput.classList.add("input-error");
      clienteInput.focus();
    }
    return;
  } else if (clienteInput) {
    clienteInput.classList.remove("input-error");
  }

  // Construir items como los espera el backend (orders.controller.js)
  const items = nuevoPedidoItems.map((it) => {
    const commentText = it.comment || "";
    return {
      name: it.name,
      quantity: it.qty,
      price: it.unit,
      comments: commentText,   // principal
      comment: commentText     // alias para compatibilidad
    };
  });

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
      console.warn("⚠ No se pudieron cargar los pedidos:", error);
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

      pedidosData[num].ordenes = (data.items || []).map((i) => ({
        // 🟢 AQUÍ EL CAMBIO: tomamos name o dish_name
        nombre: i.name || i.dish_name || "Platillo",
        cantidad: Number(i.quantity),
        precio: Number(i.price),
        // aceptamos "comments" o "comment" desde el backend
        comentario: i.comments || i.comment || ""
      }));
    } catch (err) {
      console.error("Error cargando detalles de pedido", num, err);
    }
  }
}

/* ============================================================
   VALIDACIÓN GLOBAL DE CANTIDAD (INPUT npCantidad)
============================================================ */
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

  // Mostrar caja en la parte superior
  const user = JSON.parse(localStorage.getItem("user"));
  const cajaSpan = document.getElementById("infoCajaEmpleado");
  if (cajaSpan && user?.caja_id) {
    cajaSpan.textContent = `Caja ${user.caja_id}`;
  }

  console.log("Panel de cocina listo con pedidos reales");
});

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
  const commentInput = document.getElementById("npComentario");
  const platilloSelect = document.getElementById("npPlatillo");

  // Abrir modal para crear un nuevo pedido
  if (btnAgregar) {
    btnAgregar.addEventListener("click", async () => {
      // Cargar platillos sólo si hace falta
      await cargarDishesSiHaceFalta();
      // Llenar select de categorías y platillos
      renderCategoriasSelect();
      actualizarPlatillosSegunCategoria();

      // Limpiar lista de productos del nuevo pedido
      nuevoPedidoItems = [];
      renderListaNuevoPedido();

      // Valores por defecto de los campos
      const clienteInput = document.getElementById("npCliente");
      if (clienteInput && !clienteInput.value) {
        clienteInput.value = "Cliente de mostrador";
      }
      if (qtyInput) qtyInput.value = "1";
      if (commentInput) commentInput.value = "";

      abrirModalNuevoPedido();
    });
  }

  // Cerrar modal (botón X y botón Cancelar)
  if (modalClose) {
    modalClose.addEventListener("click", cerrarModalNuevoPedido);
  }
  if (btnCancelar) {
    btnCancelar.addEventListener("click", cerrarModalNuevoPedido);
  }

  // Cuando cambia la categoría, actualizar el select de platillos
  if (categoriaSelect) {
    categoriaSelect.addEventListener("change", () => {
      actualizarPlatillosSegunCategoria();
    });
  }

  // Agregar un platillo a la lista del nuevo pedido
  if (btnAgregarItem) {
    btnAgregarItem.addEventListener("click", () => {
      if (!platilloSelect || !qtyInput) return;

      const dishId = platilloSelect.value;
      const dish = dishesCache.find((d) => String(d.id) === String(dishId));

      if (!dish) {
        alert("Selecciona un platillo válido.");
        return;
      }

      // Cantidad 1–99, permitiendo borrar el campo
      let rawQty = qtyInput.value.trim();
      if (rawQty === "") rawQty = "1";

      let qty = parseInt(rawQty, 10);
      if (!Number.isFinite(qty) || qty < 1) qty = 1;
      if (qty > 99) qty = 99;

      const comment = commentInput ? commentInput.value.trim() : "";

      nuevoPedidoItems.push({
        id: dish.id,
        name: dish.nombre || dish.name || "Platillo",
        qty,
        unit: Number(dish.precio) || 0,
        comment
      });

      renderListaNuevoPedido();
      if (commentInput) commentInput.value = "";
      qtyInput.value = "1";
    });
  }

  // Validaciones del input de cantidad (1-99, sin negativos, permite borrar y repone 1)
  if (qtyInput) {
    // Mientras escribe: deja borrar, pero limita si pone algo raro
    qtyInput.addEventListener("input", () => {
      const raw = qtyInput.value.trim();
      if (raw === "") {
        // Permitimos que quede vacío mientras escribe
        return;
      }
      let val = parseInt(raw, 10);
      if (!Number.isFinite(val) || val < 1) val = 1;
      if (val > 99) val = 99;
      qtyInput.value = String(val);
    });

    // Al salir del input: nunca se queda vacío ni fuera de rango
    qtyInput.addEventListener("blur", () => {
      let raw = qtyInput.value.trim();
      if (raw === "") raw = "1";
      let val = parseInt(raw, 10);
      if (!Number.isFinite(val) || val < 1) val = 1;
      if (val > 99) val = 99;
      qtyInput.value = String(val);
    });

    // Bloquear signos raros
    qtyInput.addEventListener("keydown", (e) => {
      if (
        e.key === "-" ||
        e.key === "e" ||
        e.key === "+" ||
        e.key === "." ||
        e.key === ","
      ) {
        e.preventDefault();
      }
    });
  }

  // Crear pedido cuando se pulsa el botón verde
  if (btnCrear) {
    btnCrear.addEventListener("click", () => {
      crearPedidoDesdeModal();
    });
  }
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
  if (!pedido) return false;

  try {
    const res = await fetch(`/api/orders/${pedido.id}/deliver`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Error en la respuesta");

    return true;
  } catch (err) {
    console.error(err);
    return false;
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

  const numero = pedidoActivo;
  const pedidoActual = pedidosData[numero];

  if (!pedidoActual) return;

  // Snapshot antes de marcar como entregado (se usa para el ticket)
  const snapshot = {
    numero,
    cliente: pedidoActual.cliente,
    createdAt: pedidoActual.createdAt,
    ordenes: (pedidoActual.ordenes || []).map((it) => ({
      nombre: it.nombre,
      cantidad: it.cantidad,
      precio: it.precio,
      comentario: it.comentario || it.comments || ""
    }))
  };

  // 1) Confirmar si realmente desea marcar la entrega
  showKitchenConfirm(
    `¿Seguro que quieres confirmar la entrega del pedido #${numero}?`,
    () => {
      (async () => {
        try {
          const ok = await entregarPedidoBackend(numero);
          if (!ok) {
            alert("No se pudo marcar el pedido como entregado.");
            return;
          }

          // Refrescamos pedidos en cocina
          await cargarPedidos();

          // 2) Preguntar si desea imprimir el ticket
          showKitchenConfirm(
            "El pedido ha sido confirmado. ¿Deseas imprimir el ticket?",
            () => {
              imprimirTicketPedido(snapshot);
            },
            { acceptText: "Sí, imprimir" }
          );
        } catch (err) {
          console.error(err);
          alert("No se pudo marcar el pedido como entregado.");
        }
      })();
    },
    { acceptText: "Sí, confirmar" }
  );
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
            <input type="number" class="edit-qty-input" min="1" max="99" value="${
              item.cantidad
            }">
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

  const nuevosItems = editItems.map((it) => {
    const commentText = it.comentario || "";
    return {
      nombre: it.nombre,
      cantidad: Number(it.cantidad),
      precio: Number(it.precio),
      // seguimos mandando comentario en ambos campos
      comments: commentText,
      comment: commentText
    };
  });

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
      comentario: it.comments || it.comment || ""
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

// =========================
// SESIÓN / LOGOUT EMPLEADO (versión completa)
// =========================

// URL del login según entorno
function getLoginUrl() {
  const isLocal =
    location.hostname === "127.0.0.1" || location.hostname === "localhost";

  return isLocal ? "../../../login/login.html" : "/login/login.html";
}

// Leer y validar el usuario guardado
function readCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error parseando user:", e);
    return null;
  }
}

// Verificar que exista sesión de EMPLEADO
function ensureEmployeeSession() {
  const token = localStorage.getItem("token");
  const user = readCurrentUser();

  if (!token || !user || user.role !== "empleado") {
    window.location.replace(getLoginUrl());
    return null;
  }

  return user;
}

const empleado = ensureEmployeeSession(); // se valida al cargar

// =========================
// CARGAR DATOS EN SIDEBAR
// =========================
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg = document.getElementById("sidebarUserImg");

if (empleado && sidebarUserName) {
  sidebarUserName.textContent = empleado.name || "Empleado";

  if (empleado.profile_picture && sidebarUserImg) {
    sidebarUserImg.src = "/uploads/" + empleado.profile_picture;
  }
}

// =========================
// PROTEGER CON BFCACHE (botón atrás del navegador)
// =========================
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    const token = localStorage.getItem("token");
    const user = readCurrentUser();

    if (!token || !user || user.role !== "empleado") {
      window.location.replace(getLoginUrl());
    }
  }
});

// =========================
// LOGOUT EMPLEADO (CLARO / OSCURO)
// =========================


/* ============================================================
   🪟 MODAL CONFIRMACIÓN COCINA (ENTREGA / TICKET)
============================================================ */
function showKitchenConfirm(message, onYes, options = {}) {
  const { acceptText = "Aceptar", hideCancel = false } = options;

  const overlay = document.createElement("div");
  overlay.className = "kitchen-confirm-overlay";

  overlay.innerHTML = `
    <div class="kitchen-confirm-box">
      <h3>${message}</h3>
      <div class="kitchen-confirm-actions">
        ${
          hideCancel
            ? ""
            : '<button class="kc-btn kc-cancel" type="button">Cancelar</button>'
        }
        <button class="kc-btn kc-accept" type="button">${acceptText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnAccept = overlay.querySelector(".kc-accept");
  const btnCancel = overlay.querySelector(".kc-cancel");

  const close = () => {
    overlay.classList.add("closing");
    setTimeout(() => overlay.remove(), 150);
  };

  if (btnCancel) {
    btnCancel.addEventListener("click", () => {
      close();
    });
  }

  btnAccept.addEventListener("click", () => {
    close();
    if (typeof onYes === "function") {
      onYes();
    }
  });

  // Cerrar si se hace click fuera de la caja
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });
}

/* ============================================================
   🧾 IMPRIMIR TICKET DEL PEDIDO (COCINA)
============================================================ */
function imprimirTicketPedido(pedidoSnapshot) {
  if (
    !pedidoSnapshot ||
    !Array.isArray(pedidoSnapshot.ordenes) ||
    !pedidoSnapshot.ordenes.length
  ) {
    alert("No hay información de productos para imprimir este ticket.");
    return;
  }

  const items = pedidoSnapshot.ordenes.map((it) => ({
    name: it.nombre || "",
    qty: Number(it.cantidad) || 0,
    unit: Number(it.precio) || 0,
    comment: it.comentario || it.comments || ""
  }));

  const IVA_RATE = 0.08; // 8%

  let subtotalCalc = 0;
  let ivaCalc = 0;
  let totalGeneral = 0;

  items.forEach((i) => {
    const lineTotal = i.unit * i.qty; // total con IVA
    const ivaProd = lineTotal * IVA_RATE; // parte de IVA
    const baseProd = lineTotal - ivaProd; // base sin IVA

    subtotalCalc += baseProd;
    ivaCalc += ivaProd;
    totalGeneral += lineTotal;
  });

  const baseDate = pedidoSnapshot.createdAt
    ? new Date(pedidoSnapshot.createdAt)
    : new Date();

  const fechaStr = baseDate.toLocaleDateString("es-MX");
  const horaStr = baseDate.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const folio = `#${String(pedidoSnapshot.numero || "").padStart(4, "0")}`;
  const cliente = pedidoSnapshot.cliente || "Cliente de mostrador";

  const logoSrc = `${window.location.origin}/img/logo_1.png`;

  const ticketHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Ticket de consumo</title>
      <style>
        * { box-sizing: border-box; }

        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
          background: #ffffff;
        }

        .ticket {
          max-width: 360px;
          margin: 0 auto;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: #fafafa;
          padding: 16px 14px;
        }

        .ticket-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .logo-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .logo-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ticket-title {
          font-size: 16px;
          font-weight: 700;
        }

        .ticket-subtitle {
          font-size: 12px;
          color: #555;
        }

        .meta {
          font-size: 12px;
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .meta strong {
          font-weight: 600;
        }

        hr {
          border: none;
          border-top: 1px dashed #ccc;
          margin: 10px 0;
        }

        .items-header,
        .item-row {
          font-size: 12px;
          display: grid;
          grid-template-columns: 15% 55% 30%;
          gap: 4px;
          align-items: baseline;
        }

        .items-header {
          font-weight: 700;
        }

        .item-comment {
          font-size: 11px;
          color: #555;
          margin-top: 2px;
          margin-bottom: 4px;
          padding-left: 12%;
        }

        .totals {
          font-size: 12px;
          margin-top: 8px;
        }

        .totals div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .total-final span:last-child {
          font-weight: 700;
        }

        .policy-summary {
          margin-top: 16px;
          font-size: 11px;
          line-height: 1.35;
          color: #555;
        }

        .policy-summary ul {
          margin: 0;
          padding-left: 16px;
        }

        .policy-summary li {
          margin-bottom: 2px;
        }

        .footer-text {
          font-size: 13px;
          text-align: center;
          margin-top: 18px;
          color: #444;
        }

        @media print {
          body { padding: 0; }
          .ticket {
            border: none;
            width: 100%;
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="ticket-header">
          <div class="logo-wrapper">
            <img src="${logoSrc}" alt="La Parrilla Azteca" />
          </div>
          <div class="ticket-title">La Parrilla Azteca</div>
          <div class="ticket-subtitle">Ticket de consumo · Caja</div>
        </div>

        <div class="meta">
          <div>
            <div><strong>Fecha:</strong> ${fechaStr}</div>
            <div><strong>Hora:</strong> ${horaStr}</div>
          </div>
          <div style="text-align:right;">
            <div><strong>Orden:</strong> ${folio}</div>
            <div><strong>Cliente:</strong> ${cliente}</div>
          </div>
        </div>

        <hr />

        <div class="items-header">
          <span>Cant</span>
          <span>Descripción</span>
          <span>Importe</span>
        </div>

        <hr />

        ${items
          .map(
            (i) => `
          <div class="item-row">
            <span>${i.qty}</span>
            <span>${i.name}</span>
            <span>$${(i.qty * i.unit).toFixed(2)}</span>
          </div>
          ${
            i.comment
              ? `<div class="item-comment">${i.comment}</div>`
              : ""
          }
        `
          )
          .join("")}

        <hr />

        <div class="totals">
          <div>
            <span>Subtotal (sin IVA):</span>
            <span>$${subtotalCalc.toFixed(2)}</span>
          </div>
          <div>
            <span>IVA 8% (incluido):</span>
            <span>$${ivaCalc.toFixed(2)}</span>
          </div>
          <div class="total-final">
            <span>Total a pagar:</span>
            <span>$${totalGeneral.toFixed(2)}</span>
          </div>
        </div>

        <div class="policy-summary">
          <ul>
            <li>Los turnos y reservaciones dependen de disponibilidad; se recomienda llegar con anticipación.</li>
            <li>Las cancelaciones de pedidos solo son válidas antes de que la orden entre en preparación.</li>
            <li>El pago se realiza antes de recibir el pedido; aceptamos efectivo y tarjeta.</li>
            <li>Los datos personales se usan solo para la gestión interna del restaurante y no se comparten sin consentimiento.</li>
            <li>Las políticas pueden actualizarse; la versión completa está disponible en el sitio web y en caja.</li>
          </ul>
        </div>

        <div class="footer-text">
          ¡Gracias por tu visita!<br />
          Vuelve pronto a La Parrilla Azteca.
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=600,height=800");
  if (!printWindow) {
    alert(
      "No se pudo abrir la ventana de impresión. Revisa si el navegador bloquea ventanas emergentes."
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(ticketHTML);
  printWindow.document.close();

  // Esperamos a que cargue todo (incluyendo el logo) antes de imprimir
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
