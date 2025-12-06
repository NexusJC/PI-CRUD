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

/* ============================================================
   📥 CARGAR PEDIDOS DESDE BACKEND
============================================================ */
async function cargarPedidos() {
    try {
        const res = await fetch("/api/orders/list");
        const pedidos = await res.json();

        pedidosData = {};

        pedidos.forEach(p => {
            pedidosData[p.order_number] = {
                id: p.id,
                cliente: p.customer_name,
                total: Number(p.total),
                estado: p.status,
                createdAt: p.created_at,
                horaPedido: p.created_at.substring(11, 16),
                horaEstimada: p.created_at.substring(11, 16), // placeholder
                ordenes: [],
                comentario: ""
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
============================================================ */
async function cargarDetallesDeCadaPedido() {
    const numeros = Object.keys(pedidosData);

    for (let num of numeros) {
        const idReal = pedidosData[num].id;

        try {
            const res = await fetch(`/api/orders/${idReal}/details`);
            const data = await res.json();

            // Esperamos que el backend devuelva { items: [...] }
            pedidosData[num].ordenes = data.items.map(i => ({
                nombre: i.dish_name,
                cantidad: Number(i.quantity),
                precio: Number(i.price)
            }));

            // Comentario del primer detalle (o vacío)
            pedidosData[num].comentario = data.items[0]?.comments || "";
        } catch (err) {
            console.error("Error cargando detalles de pedido", num, err);
        }
    }
}

/* ============================================================
   🧾 MENÚ DISPONIBLE PARA EDICIÓN (SI QUIERES AGREGAR PLATOS)
============================================================ */
const menuItems = [
    "Pizza Mexicana", "Hamburguesa Azteca", "Pollo Estilo Parrilla",
    "Papas Crujientes", "Carne Asada", "Chilaquiles",
    "Tostadas tradicionales", "Enchiladas", "Pozole", "Costillas BBQ",
    "Tacos al Pastor", "Tacos de Asada", "Refresco", "Agua de Jamaica",
    "Limonada Natural", "Refresco de Manzana", "Agua Mineral", "Refresco de Cola"
];

/* ============================================================
   🔧 INICIALIZACIÓN PRINCIPAL DEL SISTEMA
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    await cargarPedidos();        // cargar pedidos reales
    inicializarBotones();         // botones de acción
    inicializarModal();           // modal editar
    inicializarSidebar();         // placeholder
    setupSidebarDashboard();      // sidebar real

    console.log("Panel de cocina listo con pedidos reales");
});

/* ============================================================
   🧱 RENDER DEL CARRUSEL
============================================================ */
function renderizarCarrusel() {
    const cont = document.getElementById("turnosCarousel");
    cont.innerHTML = "";

    Object.keys(pedidosData).forEach(num => {
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
    document.querySelectorAll('.turno-card').forEach(card => card.classList.remove('activo'));

    const cardSeleccionado = document.querySelector(`[data-pedido="${pedidoId}"]`);
    if (cardSeleccionado) {
        cardSeleccionado.classList.add('activo');
    }

    pedidoActivo = pedidoId;
    actualizarVista();
}

/* ============================================================
   🔘 CONFIGURAR BOTONES
============================================================ */
function inicializarBotones() {
    const btnCancelar = document.getElementById('btnCancelar');
    const btnEditar   = document.getElementById('btnEditar');
    const btnEntregar = document.getElementById('btnEntregar');

    btnCancelar?.addEventListener('click', manejarCancelar);
    btnEditar?.addEventListener('click', manejarEditar);
    btnEntregar?.addEventListener('click', manejarEntregar);
}

/* ============================================================
   🪟 MODAL (solo cierres, abrir se hace en manejarEditar)
============================================================ */
function inicializarModal() {
    const modal        = document.getElementById("editarModal");
    const modalClose   = document.getElementById("modalClose");
    const cancelarBtn  = document.getElementById("cancelarEdicion");
    const guardarBtn   = document.getElementById("guardarCambios");

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

    const pedido    = pedidosData[pedidoActivo];
    const btnEntregar = document.getElementById('btnEntregar');

    if (!pedido) return;

    // poner botón Entregar activo solo si está pendiente
    if (pedido.estado === "pendiente") {
        btnEntregar?.classList.add('activo');
        btnEntregar?.removeAttribute("disabled");
    } else {
        btnEntregar?.classList.remove('activo');
        btnEntregar?.setAttribute("disabled", "disabled");
    }

    actualizarDetallesPanel(pedido);
    actualizarPrecioCarrusel(pedidoActivo, pedido.total);
}

/* ============================================================
   📋 PANEL DE DETALLES DEL PEDIDO
============================================================ */
function actualizarDetallesPanel(pedido) {
    const detallesPanel = document.getElementById('detallesPanel');

    detallesPanel.innerHTML = `
        <div class="detalles-header">
            <h3>Pedido #${pedidoActivo} - ${pedido.cliente}</h3>
            <span class="total-pedido">Total: $${pedido.total.toFixed(2)}</span>
        </div>
        
        <div class="ordenes-container">
            <h4>Órdenes de Comida</h4>
            <div class="ordenes-lista">
                ${pedido.ordenes.map(orden => `
                    <div class="orden-item">
                        <span class="orden-nombre">${orden.nombre}</span>
                        <span class="orden-cantidad">x${orden.cantidad}</span>
                        <span class="orden-precio">$${orden.precio.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="comentarios-section">
            <h4>Comentarios del Cliente</h4>
            <div class="comentario-texto">
                "${pedido.comentario || 'Sin comentarios'}"
            </div>
        </div>

        <div class="info-adicional">
            <div class="info-item"><strong>Hora del pedido:</strong> ${pedido.horaPedido}</div>
            <div class="info-item"><strong>Hora estimada:</strong> ${pedido.horaEstimada}</div>
            <div class="info-item"><strong>Tiempo restante:</strong> ${calcularTiempoRestante(pedido.horaEstimada)}</div>
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

        pedidosData[pedidoId].estado = "entregado";
        eliminarPedido(pedidoId);
        alert(`Pedido #${pedidoId} marcado como ENTREGADO.`);
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

        pedidosData[pedidoId].estado = "cancelado";
        eliminarPedido(pedidoId);
        alert(`Pedido #${pedidoId} ha sido CANCELADO.`);
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
============================================================ */
function manejarEditar() {
    if (!pedidoActivo) return;

    const pedido    = pedidosData[pedidoActivo];
    const modal     = document.getElementById("editarModal");
    const modalBody = document.getElementById("modalBody");
    const modalId   = document.getElementById("modalPedidoId");

    if (!pedido || !modal || !modalBody || !modalId) return;

    modalId.textContent = pedidoActivo;

    // Construimos contenido del modal
    modalBody.innerHTML = `
        <div class="menu-items">
            ${pedido.ordenes.map((item, index) => `
                <div class="menu-item" data-index="${index}">
                    <div class="item-info">
                        <span class="item-name">${item.nombre}</span>
                        <span class="item-quantity">Precio: $${item.precio.toFixed(2)}</span>
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
            `).join('')}
        </div>

        <div class="comentarios-section" style="margin-top:1.5rem;">
            <h4>Comentarios del Cliente</h4>
            <textarea id="comentariosEdit" rows="3"
                style="width:100%;border-radius:10px;border:1px solid #ddd;padding:0.75rem;">
${pedido.comentario || ""}
            </textarea>
        </div>
    `;

    // Listeners de +, -, eliminar
    modalBody.querySelectorAll(".menu-item").forEach(row => {
        const minusBtn  = row.querySelector(".qty-minus");
        const plusBtn   = row.querySelector(".qty-plus");
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
============================================================ */
async function guardarCambiosEdicion() {
    if (!pedidoActivo) return;

    const pedido      = pedidosData[pedidoActivo];
    const modal       = document.getElementById("editarModal");
    const modalBody   = document.getElementById("modalBody");
    const comentarios = document.getElementById("comentariosEdit")?.value.trim() || "";

    if (!pedido || !modal || !modalBody) return;

    // Leer items del modal
    const nuevosItems = [];
    modalBody.querySelectorAll(".menu-item").forEach(row => {
        const nombre = row.querySelector(".item-name").textContent.trim();
        const precioTxt = row.querySelector(".item-quantity").textContent.replace("Precio: $", "").trim();
        const cantidad = parseInt(row.querySelector(".qty-value").textContent, 10) || 1;
        const precio = Number(precioTxt) || 0;

        nuevosItems.push({ nombre, cantidad, precio });
    });

    if (nuevosItems.length === 0) {
        alert("El pedido debe tener al menos un platillo.");
        return;
    }

    const nuevoTotal = nuevosItems.reduce((acc, it) => acc + it.cantidad * it.precio, 0);

    try {
        const res = await fetch(`/api/orders/${pedido.id}/edit`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: nuevosItems,
                comments: comentarios
            })
        });

        if (!res.ok) throw new Error("Error al guardar cambios");

        // Actualizamos datos en memoria
        pedidosData[pedidoActivo].ordenes    = nuevosItems;
        pedidosData[pedidoActivo].comentario = comentarios;
        pedidosData[pedidoActivo].total      = nuevoTotal;

        // Refrescamos UI
        actualizarVista();
        renderizarCarrusel();

        modal.classList.remove("active");
        alert("Pedido actualizado correctamente.");
    } catch (err) {
        console.error(err);
        alert("No se pudo actualizar el pedido.");
    }
}

/* ============================================================
   🧱 SIDEBAR CORRECTO
============================================================ */
function setupSidebarDashboard() {
    const sidebar    = document.querySelector(".menu-dashboard");
    const toggle     = document.querySelector(".toggle");
    const toggleIcon = toggle ? toggle.querySelector("i") : null;

    if (!sidebar || !toggle) return;

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");

        if (toggleIcon) {
            toggleIcon.classList.toggle("bx-menu");
            toggleIcon.classList.toggle("bx-x");
        }
    });

    document.querySelectorAll(".menu .enlace").forEach(link => {
        link.addEventListener("click", () => {
            sidebar.classList.add("open");
            if (toggleIcon) {
                toggleIcon.classList.remove("bx-menu");
                toggleIcon.classList.add("bx-x");
            }
        });
    });
}

/* ============================================================
   🔐 VALIDACIÓN DE LOGIN
============================================================ */
function findLoginPath() {
    const paths = [
        "../../login/login.html",
        "../../../login/login.html",
        "../../../../login/login.html",
        "/frontend/login/login.html",
        "/login/login.html"
    ];

    for (let path of paths) {
        let xhr = new XMLHttpRequest();
        xhr.open("HEAD", path, false);

        try {
            xhr.send();
            if (xhr.status !== 404) return path;
        } catch {}
    }

    return "/login/login.html";
}

const loginUrl       = findLoginPath();
const logoutBtn      = document.getElementById("logoutBtn");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg  = document.getElementById("sidebarUserImg");
const user   = JSON.parse(localStorage.getItem("user"));
const token  = localStorage.getItem("token");

if (!token || !user || user.role !== "empleado") {
    window.location.href = loginUrl;
}

if (user && sidebarUserName) {
    sidebarUserName.textContent = user.name || "Empleado";
    if (user.profile_picture) sidebarUserImg.src = "/uploads/" + user.profile_picture;
}

logoutBtn?.addEventListener("click", () => {
    if (confirm("¿Seguro que quieres cerrar sesión?")) {
        localStorage.clear();
        window.location.href = loginUrl;
    }
});
