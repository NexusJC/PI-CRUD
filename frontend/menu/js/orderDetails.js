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
    // Si no hay items, no imprimimos
    if (!orderList.children.length) {
      alert("No hay productos en la orden para imprimir.");
      return;
    }

    // Aseguramos que el subtotal esté calculado
    actualizarTotales();

    // Obtenemos items del carrito
    const items = Array.from(orderList.children).map(li => {
      const name = li.dataset.name || li.querySelector(".order-item-name")?.textContent?.trim() || "Producto";
      const qty  = parseInt(li.dataset.qty || li.querySelector(".qty")?.textContent || "0", 10);
      const unit = parseFloat(li.dataset.price || "0");
      const total = unit * qty;

      return { name, qty, unit, total };
    });

    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString("es-MX");
    const horaStr  = fecha.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const folio = `#${String(orderCount).padStart(4, "0")}`;

    // Estilo tipo ticket térmico (basado en el repo de ticket-php-mysql)
    const ticketHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ticket de consumo</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: "Courier New", monospace;
            font-size: 12px;
            padding: 8px;
          }
          .ticket {
            width: 280px;
            margin: 0 auto;
          }
          .ticket-header {
            text-align: center;
            margin-bottom: 8px;
          }
          .ticket-header h2 {
            font-size: 16px;
            margin-bottom: 2px;
          }
          .ticket-header p {
            font-size: 11px;
          }
          .ticket-meta {
            margin: 8px 0;
            font-size: 11px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .items-header,
          .items-row {
            display: flex;
          }
          .col-cant {
            width: 30px;
            text-align: right;
            padding-right: 4px;
          }
          .col-desc {
            flex: 1;
            padding-right: 4px;
          }
          .col-imp {
            width: 70px;
            text-align: right;
          }
          .items-row + .items-row {
            margin-top: 2px;
          }
          .totals {
            margin-top: 6px;
            font-size: 11px;
          }
          .totals .row {
            margin-bottom: 3px;
          }
          .totals .row.total {
            font-weight: bold;
          }
          .ticket-footer {
            text-align: center;
            margin-top: 10px;
            font-size: 11px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-header">
            <h2>La Parrilla Azteca</h2>
            <p>Ticket de consumo</p>
          </div>

          <div class="ticket-meta">
            <div class="row">
              <span>Fecha: ${fechaStr}</span>
              <span>Hora: ${horaStr}</span>
            </div>
            <div class="row">
              <span>Orden: ${folio}</span>
            </div>
          </div>

          <hr />

          <div class="items-header">
            <span class="col-cant">Cant</span>
            <span class="col-desc">Descripción</span>
            <span class="col-imp">Importe</span>
          </div>
          <hr />

          ${items
            .map(
              (i) => `
            <div class="items-row">
              <span class="col-cant">${i.qty}</span>
              <span class="col-desc">${i.name}</span>
              <span class="col-imp">$${i.total.toFixed(2)}</span>
            </div>
          `
            )
            .join("")}

          <hr />

          <div class="totals">
            <div class="row">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Impuestos:</span>
              <span>$0.00</span>
            </div>
            <div class="row total">
              <span>Total:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="ticket-footer">
            <p>¡Gracias por su preferencia!</p>
            <p>Vuelva pronto</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const vent = window.open("", "PRINT", "height=600,width=400");
    vent.document.write(ticketHTML);
    vent.document.close();
    vent.focus();
    vent.print();
    vent.close();
  });
}
/* =========== FIN BOTÓN IMPRIMIR TICKET =========== */


/* ============ CONFIRMAR PEDIDO ============ */
if (confirmBtn && orderList) {
  confirmBtn.addEventListener("click", () => {
    const items = Array.from(orderList.children).map(li => {
      const comentario = li.querySelector(".comment")?.value?.trim() || "";
      return {
        producto: li.dataset.name,
        cantidad: parseInt(li.dataset.qty || "0", 10),
        comentario: comentario || null,
      };
    });

    const itemsParaBackend = items.map(i => {
      if (i.comentario === null) {
        const { comentario, ...resto } = i;
        return resto;
      }
      return i;
    });

    console.log("🧾 Items a enviar:", itemsParaBackend);
    alert("✅ Pedido confirmado con éxito");

    orderCount++;
    const orderIdEl = document.getElementById("orderId");
    if (orderIdEl) {
      orderIdEl.textContent = `#${String(orderCount).padStart(4, "0")}`;
    }

    orderList.innerHTML = "";
    subtotal = 0;
    actualizarTotales();
    actualizarEstadoVacio();
    cerrarOrderPanel();
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
