/* ==========================
   ORDER DETAILS – PANEL DERECHA
   ========================== */

// Elementos principales
const orderPanel   = document.getElementById("orderDetails");
const orderList    = document.getElementById("orderList");
const subtotalEl   = document.getElementById("subtotal");
const totalEl      = document.getElementById("total");
const printBtn     = document.getElementById("print-btn");
const confirmBtn   = document.getElementById("confirm-btn");
const emptyMsg     = document.getElementById("empty-cart-msg");

// Botones para abrir / cerrar el panel (NO usamos nada del sidebar.js)
const openOrderBtn  = document.getElementById("open-sidebar-btn");
const closeOrderBtn = document.getElementById("closeOrderDetailsBtn");

// Estado del pedido
let subtotal   = 0;
let orderCount = 1;

/* ============ ABRIR / CERRAR PANEL ============ */
function abrirOrderPanel() {
  if (!orderPanel) return;
  orderPanel.style.display = "block";
  orderPanel.classList.add("open");
  actualizarEstadoVacio();
}

function cerrarOrderPanel() {
  if (!orderPanel) return;
  orderPanel.classList.remove("open");
  orderPanel.style.display = "none";
}

// Botón "Ver Orden" → ahora hace TOGGLE (abrir/cerrar)
if (openOrderBtn) {
  openOrderBtn.addEventListener("click", () => {
    if (!orderPanel) return;
    const isOpen = orderPanel.classList.contains("open");
    if (isOpen) {
      cerrarOrderPanel();
    } else {
      abrirOrderPanel();
    }
  });
}

// Botón X dentro del panel
if (closeOrderBtn) {
  closeOrderBtn.addEventListener("click", () => {
    cerrarOrderPanel();
  });
}

/* ============ ESTADO: VACÍO / NO VACÍO ============ */
function actualizarEstadoVacio() {
  const isEmpty = !orderList || orderList.children.length === 0;

  if (emptyMsg) {
    emptyMsg.style.display = isEmpty ? "block" : "none";
  }

  if (confirmBtn) confirmBtn.disabled = isEmpty;
  if (printBtn)   printBtn.disabled   = isEmpty;

  if (isEmpty) {
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    if (totalEl)    totalEl.textContent    = "$0.00";
  }
}

/* ============ CALCULAR TOTALES ============ */
function actualizarTotales() {
  if (!orderList || !subtotalEl || !totalEl) return;

  let suma = 0;
  Array.from(orderList.children).forEach(li => {
    const unit = parseFloat(li.dataset.price || "0");
    const qty  = parseInt(li.dataset.qty || "0", 10);
    suma += unit * qty;
  });

  subtotal = suma;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent    = `$${subtotal.toFixed(2)}`;
}

/* ============ AGREGAR PRODUCTOS DESDE LAS CARDS ============ */
/* Mantengo el sistema de "addToCart" SI existe, para animaciones, etc. */

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn || !orderPanel || !orderList) return;

  // Si tienes una función global addToCart, la respetamos
  if (typeof addToCart === "function") {
    try { addToCart(e); } catch (_) {}
  }

  const card  = btn.closest(".menu-card");
  if (!card) return;

  const name  = card.dataset.name || card.querySelector("h3")?.textContent || "Producto";
  const price = parseFloat(card.dataset.price || "0");
  const imgEl = card.querySelector("img");
  const img   = imgEl ? imgEl.src : "";

  // Abrir el panel al agregar algo
  abrirOrderPanel();

  // Buscar si ya existe en la lista
  let existing = Array.from(orderList.children).find(li => li.dataset.name === name);

  if (!existing) {
    // Crear item nuevo (DISEÑO POS PREMIUM)
    const li = document.createElement("li");
    li.className    = "od-item";
    li.dataset.name  = name;
    li.dataset.price = price;
    li.dataset.qty   = "1";

    li.innerHTML = `
      <div class="od-thumb">
        ${img ? `<img src="${img}" alt="${name}">` : ""}
      </div>

      <div class="od-info">
        <div class="od-name-row">
          <span class="name">${name}</span>
          <button class="od-delete" aria-label="Eliminar producto">✕</button>
        </div>
        <textarea class="comment" placeholder="Comentarios adicionales..."></textarea>
      </div>

      <div class="od-controls">
        <div class="qty-controls">
          <button class="qty-btn minus">−</button>
          <span class="qty">1</span>
          <button class="qty-btn plus">+</button>
        </div>
        <div class="price line-total">$${price.toFixed(2)}</div>
      </div>
    `;

    orderList.appendChild(li);
  } else {
    // Ya existe → incrementar cantidad
    let qty = parseInt(existing.dataset.qty || "0", 10);
    qty++;
    existing.dataset.qty = String(qty);

    const qtySpan = existing.querySelector(".qty");
    const line    = existing.querySelector(".line-total");
    if (qtySpan) qtySpan.textContent = String(qty);
    if (line)    line.textContent    = `$${(price * qty).toFixed(2)}`;
  }

  actualizarTotales();
  actualizarEstadoVacio();
});

/* ============ + / − / ELIMINAR PRODUCTO ============ */
if (orderList) {
  orderList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const li = e.target.closest(".od-item");
    if (!li) return;

    const unit = parseFloat(li.dataset.price || "0");
    let qty    = parseInt(li.dataset.qty || "0", 10);

    // Botón X (eliminar producto)
    if (btn.classList.contains("od-delete") || btn.classList.contains("remove-btn")) {
      li.remove();
      actualizarTotales();
      actualizarEstadoVacio();
      return;
    }

    if (btn.classList.contains("plus")) {
      qty++;
    } else if (btn.classList.contains("minus")) {
      qty--;
      if (qty <= 0) {
        li.remove();
        actualizarTotales();
        actualizarEstadoVacio();
        return;
      }
    } else {
      return;
    }

    li.dataset.qty = String(qty);

    const qtySpan = li.querySelector(".qty");
    const line    = li.querySelector(".line-total");
    if (qtySpan) qtySpan.textContent = String(qty);
    if (line)    line.textContent    = `$${(unit * qty).toFixed(2)}`;

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

    const items = Array.from(orderList.children).map(li => {
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

    const folio    = `#${String(orderCount).padStart(4, "0")}`;
    const IVA_RATE = 0.08; // 8%

    // usamos el mismo logo que en el header, ya resuelto a URL absoluta
    const headerLogo = document.querySelector(".logo");
    const logoSrc = headerLogo ? headerLogo.src : `${window.location.origin}/img/logo_1.png`;

    let subtotalCalc = 0; // base sin IVA
    let ivaCalc      = 0; // IVA incluido
    let totalGeneral = 0; // total con IVA

    items.forEach(i => {
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
            font-size: 15px;
            margin-top: 16px;
          }

          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .totals .total-final {
            font-size: 19px;
            font-weight: bold;
            margin-top: 10px;
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

          ${items.map(i => `
            <div class="item-row">
              <span class="item-qty">${i.qty}</span>
              <span class="item-name">${i.name}</span>
              <span class="item-price">$${(i.qty * i.unit).toFixed(2)}</span>
            </div>
            ${i.comment ? `<div class="item-comment">${i.comment}</div>` : ""}
          `).join("")}

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
/* ============ CONFIRMAR PEDIDO (ENVÍO A BACKEND) ============ */
if (confirmBtn && orderList) {
  confirmBtn.addEventListener("click", async () => {

    if (!orderList.children.length) {
      alert("Tu orden está vacía.");
      return;
    }

    actualizarTotales(); // por si acaso

    // Armar lista de productos
    const items = Array.from(orderList.children).map(li => {
      const name      = li.dataset.name;
      const qty       = parseInt(li.dataset.qty || "0", 10);
      const price     = parseFloat(li.dataset.price || "0");
      const comments  = li.querySelector(".comment")?.value?.trim() || "";

      return {
        name,
        quantity: qty,
        price,
        comments
      };
    });

    // Total
    const total = subtotal;

    // Obtener nombre del cliente (si está logueado)
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const customerName = user?.name || "Cliente"

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          items,
          total
        })
      });

      const data = await res.json();

      if (!data.success) {
        alert(" Error al enviar el pedido.");
        console.error(data);
        return;
      }

      alert(` Pedido enviado (#${data.orderNumber})`);

      // Limpiar carrito
      orderList.innerHTML = "";
      subtotal = 0;
      actualizarTotales();
      actualizarEstadoVacio();
      cerrarOrderPanel();

    } catch (error) {
      console.error(" Error fetch /api/orders/create:", error);
      alert("Error de conexión con el servidor.");
    }
  });
}


/* ============ MODAL DETALLES DE PRODUCTO (se mantiene) ============ */
const modal      = document.getElementById("productModal");
const modalImg   = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc  = document.getElementById("modalDesc");
const modalAddBtn= document.getElementById("modalAddBtn");
const modalClose = document.getElementById("modalClose");

if (modal && modalImg && modalTitle && modalDesc && modalAddBtn && modalClose) {
  document.querySelectorAll(".menu-card img").forEach(img => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      const card = img.closest(".menu-card");
      modalImg.src = img.src;
      modalTitle.textContent =
        card.dataset.name || card.querySelector("h3")?.textContent || "Producto";
      modalDesc.textContent =
        card.dataset.desc || "Descripción no disponible.";
      modalAddBtn.dataset.name  = card.dataset.name;
      modalAddBtn.dataset.price = card.dataset.price;
      modal.classList.add("active");
    });
  });

  modalClose.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  modalAddBtn.addEventListener("click", () => {
    const name = modalAddBtn.dataset.name;
    const card = document.querySelector(
      `.menu-card[data-name="${CSS.escape(name)}"]`
    );
    const addBtn = card?.querySelector(".add-btn");
    addBtn?.click();
    modal.classList.remove("active");
  });
}

/* ============ HINTS VISUALES PARA DETALLES (se mantiene) ============ */
document.querySelectorAll(".menu-card").forEach(card => {
  if (!card.querySelector(".details-badge")) {
    const badge = document.createElement("div");
    badge.className = "details-badge";
    badge.innerHTML = '<i class="fas fa-info-circle"></i><span>Detalles</span>';
    card.appendChild(badge);
  }

  if (!card.querySelector(".img-cta")) {
    const cta = document.createElement("div");
    cta.className = "img-cta";
    cta.innerHTML = "<span>Haz clic para ver detalles</span>";
    card.appendChild(cta);
  }

  const img = card.querySelector("img");
  if (img) {
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    const name = card.dataset.name || card.querySelector("h3")?.textContent || "producto";
    img.setAttribute("aria-label", `Ver detalles de ${name}`);

    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        img.click();
      }
    });
  }
});

// Estado inicial
actualizarEstadoVacio();
