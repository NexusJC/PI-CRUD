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
/* =========== BOTÓN IMPRIMIR TICKET (VERSIÓN ESTÉTICA, GRANDE Y MODERNA) =========== */
if (printBtn && orderList) {
  printBtn.addEventListener("click", () => {

    if (!orderList.children.length) {
      alert("No hay productos para imprimir.");
      return;
    }

    actualizarTotales();

    const items = Array.from(orderList.children).map(li => {
      return {
        name: li.dataset.name || "Producto",
        qty: parseInt(li.dataset.qty || "0"),
        unit: parseFloat(li.dataset.price || "0"),
        comment: li.querySelector("textarea")?.value || ""
      };
    });

    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString("es-MX");
    const horaStr = fecha.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const folio = `#${String(Date.now()).slice(-4)}`;

    const ticketHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ticket de consumo</title>

        <style>
          body {
            font-family: 'Poppins', Arial, sans-serif;
            background: #FFF7EA;
            padding: 30px;
            margin: 0;
          }

          .ticket {
            width: 500px; /* MÁS GRANDE */
            background: white;
            padding: 35px;
            margin: auto;

            border-radius: 18px;
            border: 3px solid #E36842;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }

          .title {
            text-align: center;
            font-size: 30px;
            font-weight: 800;
            color: #E36842;
            margin-bottom: 10px;
          }

          .subtitle {
            text-align: center;
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 25px;
            color: #333;
          }

          .meta {
            font-size: 17px;
            line-height: 1.6;
            margin-bottom: 25px;
          }

          hr {
            border: none;
            border-top: 2px dashed #E36842;
            margin: 20px 0;
          }

          .product {
            font-size: 17px;
            margin-bottom: 18px;
          }

          .prod-title {
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 4px;
          }

          .qty-price {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            font-size: 17px;
          }

          .comment {
            margin-top: 5px;
            font-size: 15px;
            color: #555;
            font-style: italic;
          }

          .totals {
            margin-top: 35px;
            font-size: 19px;
          }

          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .total-final {
            font-size: 24px;
            font-weight: bold;
            color: #E36842;
            margin-top: 15px;
          }

          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 17px;
            color: #444;
            line-height: 1.4;
          }

          @media print {
            body { background: white; padding: 0; margin: 0; }
            .ticket { width: 100%; border: none; box-shadow: none; }
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

          ${items.map(i => `
            <div class="product">
              <div class="prod-title">${i.name}</div>
              
              <div class="qty-price">
                <span>Cantidad: <strong>${i.qty}</strong></span>
                <span>Importe: <strong>$${(i.qty * i.unit).toFixed(2)}</strong></span>
              </div>

              ${i.comment ? `<div class="comment">💬 Comentario: "${i.comment}"</div>` : ""}
            </div>
          `).join("")}

          <hr>

          <div class="totals">
            <div><span>Subtotal:</span> <span>$${subtotal.toFixed(2)}</span></div>
            <div><span>Impuestos:</span> <span>$0.00</span></div>
            <div class="total-final"><span>Total:</span> <span>$${subtotal.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            ¡Gracias por su preferencia!<br>
            Estamos para servirle.
          </div>

        </div>
      </body>
      </html>
    `;

    const vent = window.open("", "_blank", "width=800,height=1000");
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
