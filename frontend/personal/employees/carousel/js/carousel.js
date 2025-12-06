/* ============================================================
   🔧 FUNCIÓN NECESARIA PARA EVITAR ERROR
   (se completará luego si necesitas lógica real)
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
   🔄 CARGAR PEDIDOS DESDE BACKEND
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
                total: p.total,
                estado: p.status,
                horaPedido: p.created_at.substring(11, 16),
                horaEstimada: p.created_at.substring(11, 16), // evitar undefined
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
    }
}

/* ============================================================
   🔄 CARGAR DETALLES DE CADA PEDIDO
============================================================ */
async function cargarDetallesDeCadaPedido() {
    const numeros = Object.keys(pedidosData);

    for (let num of numeros) {
        const idReal = pedidosData[num].id;

        const res = await fetch(`/api/orders/${idReal}/details`);
        const data = await res.json();

        pedidosData[num].ordenes = data.items.map(i => ({
            nombre: i.dish_name,
            cantidad: i.quantity,
            precio: i.price
        }));

        pedidosData[num].comentario = data.items[0]?.comments || "";
    }
}

/* ============================================================
   🧾 MENÚ DISPONIBLE PARA EDICIÓN EN EL MODAL
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
    inicializarSidebar();         // placeholder para evitar errores
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
            <div class="estado-${p.estado === "pendiente" ? "pendiente" : "activo"}">
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
    const btnEditar = document.getElementById('btnEditar');
    const btnEntregar = document.getElementById('btnEntregar');

    btnCancelar?.addEventListener('click', manejarCancelar);

    if (btnEditar) {
        const newBtn = btnEditar.cloneNode(true);
        btnEditar.parentNode.replaceChild(newBtn, btnEditar);

        newBtn.addEventListener('click', (e) => {
            console.log("Botón editar clickeado");
            e.preventDefault();
            manejarEditar();
        });
    }

    btnEntregar?.addEventListener('click', manejarEntregar);
}

/* ============================================================
   🔄 ACTUALIZAR VISTA PRINCIPAL DEL PEDIDO
============================================================ */
function actualizarVista() {
    const pedido = pedidosData[pedidoActivo];
    const btnEntregar = document.getElementById('btnEntregar');

    btnEntregar.classList.add('activo'); // siempre activo

    actualizarDetallesPanel(pedido);
    actualizarPrecioCarrusel(pedidoActivo, pedido.total);
}

/* ============================================================
   ✏️ PANEL DE DETALLES DEL PEDIDO
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
                `).join("")}
            </div>
        </div>

        <div class="comentarios-section">
            <h4>Comentarios del Cliente</h4>
            <div class="comentario-texto">
                "${pedido.comentario}"
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
   🧮 CALCULAR TIEMPO RESTANTE
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
   📤 ENTREGAR O CANCELAR PEDIDOS
============================================================ */
function eliminarPedido(pedidoId) {
    const card = document.querySelector(`[data-pedido="${pedidoId}"]`);
    if (!card) return;

    card.style.opacity = "0";
    card.style.transform = "scale(0.8)";

    setTimeout(() => {
        card.remove();

        if (pedidoId === pedidoActivo) {
            const nextCard = document.querySelector(".turno-card");
            if (nextCard) seleccionarPedido(nextCard.dataset.pedido);
            else document.getElementById("detallesPanel").innerHTML = `
                <div style="text-align:center;padding:3rem;color:#666;">
                    <h3>No hay pedidos en cocina</h3>
                    <p>Todos los pedidos han sido completados.</p>
                </div>
            `;
        }
    }, 300);
}

function entregarPedido(pedidoId) {
    eliminarPedido(pedidoId);
}

/* ============================================================
   🧭 SIDEBAR CORRECTO (EL QUE TE HACÍA FALTA)
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

const loginUrl = findLoginPath();
const logoutBtn = document.getElementById("logoutBtn");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg = document.getElementById("sidebarUserImg");
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

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
