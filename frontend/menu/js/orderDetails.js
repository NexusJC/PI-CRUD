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
/* ============ IMPRIMIR TICKET (FIX 0's + IVA 16% INDIVIDUAL) ============ */
if (printBtn && orderList) {
  printBtn.addEventListener("click", () => {

    if (!orderList.children.length) {
      alert("No hay productos para imprimir.");
      return;
    }

    // Aseguramos que el subtotal global esté al día
    actualizarTotales();

    // Tomar productos + comentarios desde el orderList
    const items = Array.from(orderList.children).map(li => {
      const name    = li.dataset.name || "Producto";
      const qty     = parseInt(li.dataset.qty || "0", 10);
      const unit    = parseFloat(li.dataset.price || "0");
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

    // ========= CÁLCULO DE SUBTOTAL + IVA 16% POR PRODUCTO =========
    let subtotalCalc = 0;
    let ivaCalc      = 0;

    items.forEach(i => {
      const lineSubtotal = i.unit * i.qty;       // precioUnit * cantidad
      const ivaUnit      = i.unit * 0.16;        // 16% de CADA unidad
      const ivaProducto  = ivaUnit * i.qty;      // IVA total de ese producto

      subtotalCalc += lineSubtotal;
      ivaCalc      += ivaProducto;
    });

    const totalGeneral = subtotalCalc + ivaCalc;

    const ticketHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ticket de consumo</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
            background: white;
          }

          .ticket {
            width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid ${"#ddd"};
            border-radius: 12px;
            background: #fafafa;
          }

          .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 4px;
          }

          .subtitle {
            text-align: center;
            font-size: 14px;
            margin-bottom: 10px;
            color: #666;
          }

          .meta {
            font-size: 15px;
            margin-bottom: 15px;
          }

          hr {
            border: none;
            border-top: 1.5px dashed #555;
            margin: 12px 0;
          }

          /* AJUSTE DE COLUMNAS PARA QUE NO SE CORTEN LOS 00 */
          .items-header,
          .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 15px;
            width: 100%;
          }

          /* Cantidad un poco más ancha y alineada a la derecha */
          .item-qty {
            width: 12%;
            text-align: right;
          }

          /* Nombre con un poco menos de ancho para darle más espacio al importe */
          .item-name {
            width: 48%;
            text-align: left;
          }

          /* Importe con MÁS ancho para que entren bien todos los decimales */
          .item-price {
            width: 40%;
            text-align: right;
            font-weight: bold;
          }

          /* Comentario en otra línea, sin tapar nada */
          .item-comment {
            font-size: 13px;
            color: #555;
            margin-top: 2px;
            margin-bottom: 4px;
            padding-left: 12%; /* alineado con el texto, sin tocar columnas */
          }

          .totals {
            font-size: 16px;
            margin-top: 20px;
          }

          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }

          .totals .total-final {
            font-size: 20px;
            font-weight: bold;
            margin-top: 15px;
          }

          .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 15px;
            color: #444;
          }

          @media print {
            body {
              padding: 0;
            }
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
          
          <div class="title">La Parrilla Azteca</div>
          <div class="subtitle">Ticket de consumo</div>

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
            ${i.comment
              ? `<div class="item-comment"> ${i.comment}</div>`
              : ""
            }
          `).join("")}

          <hr>

          <div class="totals">
            <div><span>Subtotal:</span> <span>$${subtotalCalc.toFixed(2)}</span></div>
            <div><span>IVA 16%:</span>   <span>$${ivaCalc.toFixed(2)}</span></div>
            <div class="total-final"><span>Total:</span> <span>$${totalGeneral.toFixed(2)}</span></div>
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
    vent.document.write(ticketHTML);
    vent.document.close();
    vent.focus();
    vent.print();
  });
}
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
