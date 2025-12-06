// frontend/menu/js/orderDetails.js

/* ==========================
   ORDER DETAILS – PANEL DERECHA
   ========================== */

// Elementos principales del panel
const orderPanel   = document.getElementById("orderDetails");
const orderList    = document.getElementById("orderList");
const subtotalEl   = document.getElementById("subtotal");
const totalEl      = document.getElementById("total");

// Span de impuestos: intenta con id="tax" y si no existe toma el 2º renglón
const taxEl =
  document.getElementById("tax") ||
  document.querySelector(".od-summary .row:nth-child(2) span:last-child");

const printBtn   = document.getElementById("print-btn");
const confirmBtn = document.getElementById("confirm-btn");
const emptyMsg   = document.getElementById("empty-cart-msg");

// Botones para abrir / cerrar el panel
const openOrderBtn  = document.getElementById("open-sidebar-btn");
const closeOrderBtn = document.getElementById("closeOrderDetailsBtn");

// Referencias al modal de producto (para "Agregar a la orden" desde el modal)
const productModal = document.getElementById("productModal");
const modalImg     = document.getElementById("modalImg");
const modalTitle   = document.getElementById("modalTitle");
const modalAddBtn  = document.getElementById("modalAddBtn");

// Contenedor de tarjetas del menú
const menuGrid = document.getElementById("menuGrid");

// Estado del pedido
let subtotal   = 0;
let orderCount = 1;
const IVA_RATE = 0.08; // 8% incluido en los precios

/* ============ ABRIR / CERRAR PANEL ============ */
function abrirOrderPanel() {
  if (!orderPanel) return;
  orderPanel.classList.add("open");
  actualizarEstadoVacio();
}

function cerrarOrderPanel() {
  if (!orderPanel) return;
  orderPanel.classList.remove("open");
}

if (openOrderBtn)  openOrderBtn.addEventListener("click", abrirOrderPanel);
if (closeOrderBtn) closeOrderBtn.addEventListener("click", cerrarOrderPanel);

/* ============ ESTADO VACÍO ============ */
function actualizarEstadoVacio() {
  const isEmpty = !orderList || orderList.children.length === 0;

  if (emptyMsg) {
    emptyMsg.style.display = isEmpty ? "block" : "none";
  }

  if (confirmBtn) confirmBtn.disabled = isEmpty;
  if (printBtn)   printBtn.disabled   = isEmpty;

  if (isEmpty) {
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    if (taxEl)      taxEl.textContent      = "$0.00";
    if (totalEl)    totalEl.textContent    = "$0.00";
  }
}

/* ============ CÁLCULO DE TOTALES (IVA INCLUIDO) ============ */
function actualizarTotales() {
  if (!orderList || !subtotalEl || !totalEl) return;

  // totalConIVA = suma de (precio con IVA incluido * cantidad)
  let totalConIVA = 0;
  Array.from(orderList.children).forEach((item) => {
    const unit = parseFloat(item.dataset.price || "0");
    const qty  = parseInt(item.dataset.qty || "0", 10);
    totalConIVA += unit * qty;
  });

  if (totalConIVA < 0) totalConIVA = 0;

  const iva  = totalConIVA * IVA_RATE; // parte que es IVA
  const base = totalConIVA - iva;      // base sin IVA

  subtotal = base;

  subtotalEl.textContent = `$${base.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${iva.toFixed(2)}`;
  totalEl.textContent = `$${totalConIVA.toFixed(2)}`;
}

/* ============ CREAR ÍTEM EN LA ORDEN ============ */
function crearItemPedido({ name, price, imgSrc }) {
  if (!orderList) return;

  const priceNum = Number(price) || 0;

  // Si ya existe un ítem con el mismo nombre/precio, solo aumentamos cantidad
  const existente = Array.from(orderList.children).find(
    (el) =>
      el.dataset.name === name &&
      el.dataset.price === String(priceNum)
  );

  if (existente) {
    let qty = parseInt(existente.dataset.qty || "1", 10);
    qty += 1;
    existente.dataset.qty = String(qty);

    const qtySpan   = existente.querySelector(".qty");
    const priceSpan = existente.querySelector(".price");

    if (qtySpan)   qtySpan.textContent   = qty;
    if (priceSpan) priceSpan.textContent = `$${(priceNum * qty).toFixed(2)}`;

    actualizarTotales();
    actualizarEstadoVacio();
    return;
  }

  const item = document.createElement("div");
  item.className = "od-item";
  item.dataset.name  = name;
  item.dataset.price = String(priceNum);
  item.dataset.qty   = "1";

  const safeImg = imgSrc || "../img/fondo-login-1.png";

  item.innerHTML = `
    <div class="od-thumb">
      <img src="${safeImg}" alt="${name}">
    </div>
    <div class="od-info">
      <div class="od-name-row">
        <span class="name">${name}</span>
        <button class="od-delete" type="button" aria-label="Quitar ${name}">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <textarea class="comment" placeholder="Comentarios adicionales..."></textarea>
    </div>
    <div class="od-controls">
      <div class="qty-controls">
        <button class="qty-btn minus" type="button">-</button>
        <span class="qty">1</span>
        <button class="qty-btn plus" type="button">+</button>
      </div>
      <div class="price">$${priceNum.toFixed(2)}</div>
    </div>
  `;

  const minusBtn  = item.querySelector(".qty-btn.minus");
  const plusBtn   = item.querySelector(".qty-btn.plus");
  const qtySpan   = item.querySelector(".qty");
  const priceSpan = item.querySelector(".price");
  const delBtn    = item.querySelector(".od-delete");

  function actualizarLinea() {
    let qty = parseInt(item.dataset.qty || "1", 10);
    if (qty < 1 || Number.isNaN(qty)) qty = 1;
    item.dataset.qty = String(qty);

    if (qtySpan)   qtySpan.textContent   = qty;
    if (priceSpan) priceSpan.textContent = `$${(priceNum * qty).toFixed(2)}`;
    actualizarTotales();
  }

  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      let qty = parseInt(item.dataset.qty || "1", 10);
      qty = Math.max(1, qty - 1);
      item.dataset.qty = String(qty);
      actualizarLinea();
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      let qty = parseInt(item.dataset.qty || "1", 10);
      qty += 1;
      item.dataset.qty = String(qty);
      actualizarLinea();
    });
  }

  if (delBtn) {
    delBtn.addEventListener("click", () => {
      item.remove();
      actualizarTotales();
      actualizarEstadoVacio();
    });
  }

  orderList.appendChild(item);
  actualizarTotales();
  actualizarEstadoVacio();
}

/* ============ EVENTOS: AGREGAR DESDE TARJETA DEL MENÚ ============ */
if (menuGrid) {
  menuGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;

    const card = btn.closest(".menu-card");
    if (!card) return;

    const name =
      card.getAttribute("data-name") ||
      (card.querySelector(".menu-card-title")?.textContent || "").trim();

    const price = parseFloat(
      card.getAttribute("data-price") || btn.dataset.price || "0"
    );

    const imgEl  = card.querySelector("img");
    const imgSrc = imgEl ? imgEl.src : "";

    if (!name || Number.isNaN(price)) return;

    crearItemPedido({ name, price, imgSrc });
    abrirOrderPanel();
  });
}

/* ============ EVENTO: AGREGAR DESDE EL MODAL DE DETALLES ============ */
if (modalAddBtn) {
  modalAddBtn.addEventListener("click", () => {
    const name  = modalAddBtn.dataset.name;
    const price = parseFloat(modalAddBtn.dataset.price || "0");
    const img   = modalImg ? modalImg.src : "";

    if (!name || Number.isNaN(price)) return;

    crearItemPedido({ name, price, imgSrc: img });
    abrirOrderPanel();

    if (productModal) {
      productModal.classList.remove("active");
    }
  });
}

/* ============ CONFIRMAR PEDIDO (LÓGICA SIMPLE) ============ */
if (confirmBtn) {
  confirmBtn.addEventListener("click", () => {
    if (!orderList || !orderList.children.length) return;

    alert("Pedido confirmado. ¡Gracias!");

    orderList.innerHTML = "";
    actualizarTotales();
    actualizarEstadoVacio();
  });
}

/* ============ IMPRIMIR TICKET ============ */
if (printBtn && orderList) {
  printBtn.addEventListener("click", () => {
    if (!orderList.children.length) {
      alert("No hay productos para imprimir.");
      return;
    }

    actualizarTotales();

    const items = Array.from(orderList.children).map((li) => {
      const name    = li.dataset.name || "Producto";
      const qty     = parseInt(li.dataset.qty || "0", 10);
      const unit    = parseFloat(li.dataset.price || "0"); // precio con IVA incluido
      const comment = li.querySelector(".comment")?.value?.trim() || "";
      return { name, qty, unit, comment };
    });

    const fecha    = new Date();
    const fechaStr = fecha.toLocaleDateString("es-MX");
    const horaStr  = fecha.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const folio = `#${String(orderCount).padStart(4, "0")}`;

    const headerLogo = document.querySelector(".logo");
    const logoSrc =
      headerLogo?.src || `${window.location.origin}/img/logo_1.png`;

    let subtotalCalc = 0; // base sin IVA
    let ivaCalc      = 0; // IVA incluido
    let totalGeneral = 0; // total con IVA

    items.forEach((i) => {
      const lineTotal    = i.unit * i.qty;          // total con IVA
      const ivaProducto  = lineTotal * IVA_RATE;    // 8% del total
      const baseProducto = lineTotal - ivaProducto; // base sin IVA

      subtotalCalc += baseProducto;
      ivaCalc      += ivaProducto;
      totalGeneral += lineTotal;
    });

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
            width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 12px;
            background: #fafafa;
          }

          .ticket-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            margin-bottom: 8px;
          }

          .logo-wrapper {
            text-align: center;
          }

          .ticket-logo {
            width: 72px;
            height: 72px;
            border-radius: 999px;
            object-fit: cover;
          }

          .title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
          }

          .subtitle {
            text-align: center;
            font-size: 14px;
            margin-top: 2px;
            color: #666;
          }

          .meta {
            font-size: 14px;
            margin: 10px 0 14px;
          }

          hr {
            border: none;
            border-top: 1.5px dashed #555;
            margin: 10px 0;
          }

          .items-header,
          .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            width: 100%;
          }

          .item-qty {
            width: 12%;
            text-align: right;
          }

          .item-name {
            width: 48%;
            text-align: left;
          }

          .item-price {
            width: 40%;
            text-align: right;
            font-weight: bold;
          }

          .item-comment {
            font-size: 12px;
            color: #555;
            margin-top: 2px;
            margin-bottom: 4px;
            padding-left: 12%;
          }

          .totals {
            font-size: 14px;
            margin-top: 16px;
          }

          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .totals .total-final {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
          }

          .policy-summary {
            margin-top: 22px;
            font-size: 14px;
            line-height: 1.4;
            color: #444;
            text-align: center;
          }

          .policy-summary ul {
            list-style: disc;
            padding-left: 20px;
            margin: 4px auto 0;
            max-width: 360px;
            text-align: left;
          }

          .policy-summary li {
            margin-bottom: 4px;
          }

          .footer {
            margin-top: 18px;
            text-align: center;
            font-size: 13px;
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
              <img src="${logoSrc}" alt="La Parrilla Azteca" class="ticket-logo">
            </div>
            <div class="title">La Parrilla Azteca</div>
            <div class="subtitle">Ticket de consumo</div>
          </div>

          <div class="meta">
            <strong>Fecha:</strong> ${fechaStr}<br>
            <strong>Hora:</strong> ${horaStr}<br>
            <strong>Orden:</strong> ${folio}
          </div>

          <hr>

          <div class="items-header">
            <span>Cant</span>
            <span>Descripción</span>
            <span>Importe</span>
          </div>

          <hr>

          ${items
            .map(
              (i) => `
            <div class="item-row">
              <span class="item-qty">${i.qty}</span>
              <span class="item-name">${i.name}</span>
              <span class="item-price">$${(i.qty * i.unit).toFixed(2)}</span>
            </div>
            ${
              i.comment
                ? `<div class="item-comment">${i.comment}</div>`
                : ""
            }
          `
            )
            .join("")}

          <hr>

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

          <div class="footer">
            ¡Gracias por su preferencia!<br>
            Vuelva pronto
          </div>
        </div>
      </body>
      </html>
    `;

    const vent = window.open("", "_blank", "width=600,height=800");
    vent.document.open();
    vent.document.write(ticketHTML);
    vent.document.close();

    vent.onload = () => {
      vent.focus();
      vent.print();
    };
  });
}

// Inicializamos estado vacío al cargar
actualizarEstadoVacio();
