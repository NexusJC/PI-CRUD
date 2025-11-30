/* ============================================================
   ORDER DETAILS – PANEL DERECHA (SIN AFECTAR SIDEBAR IZQUIERDO)
   ============================================================ */

// Elementos principales
const orderDetails = document.getElementById("orderDetails");
const orderList = document.getElementById("orderList");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const printBtn = document.getElementById("print-btn");
const confirmBtn = document.getElementById("confirm-btn");
const emptyCartMsg = document.getElementById("empty-cart-msg");

// Botón para abrir OrderDetails
const openOrderDetailsBtn = document.getElementById("openOrderDetailsBtn");

// Variables
let orderCount = 1;
let subtotal = 0;

/* ============================================================
   ABRIR PANEL "VER ORDEN"
   ============================================================ */
if (openOrderDetailsBtn) {
  openOrderDetailsBtn.addEventListener("click", () => {
    orderDetails.style.display = "block";
    orderDetails.classList.add("open");
    actualizarEstadoVacio();
  });
}

/* ============================================================
   ESTADO: VACÍO / NO VACÍO
   ============================================================ */
function actualizarEstadoVacio() {
  const isEmpty = orderList.children.length === 0;

  if (isEmpty) {
    emptyCartMsg.style.display = "block";
    subtotalEl.textContent = "$0.00";
    totalEl.textContent = "$0.00";
    confirmBtn.disabled = true;
    printBtn.disabled = true;
  } else {
    emptyCartMsg.style.display = "none";
    confirmBtn.disabled = false;
    printBtn.disabled = false;
  }
}

/* ============================================================
   FUNCIÓN addToCart — (VERSIÓN QUE TÚ USAS)
   ============================================================ */
function addToCart(e) {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;

  const card = btn.closest(".menu-card");
  const name = card.dataset.name;
  const price = parseFloat(card.dataset.price);

  // Abrir el panel si está oculto
  if (orderDetails.style.display === "none") {
    orderDetails.style.display = "block";
    orderDetails.classList.remove("open");
    void orderDetails.offsetWidth;
    orderDetails.classList.add("open");
  }

  // Buscar item existente
  let existing = Array.from(orderList.children).find(
    li => li.dataset.name === name
  );

  if (!existing) {
    // crear nuevo item
    const li = document.createElement("li");
    li.className = "order-item";
    li.dataset.name = name;
    li.dataset.price = price;
    li.dataset.qty = "1";

    li.innerHTML = `
      <div class="item-info">
        <span class="item-name">${name}</span>
        <div class="qty-controls">
          <button class="qty-btn minus">−</button>
          <span class="qty">1</span>
          <button class="qty-btn plus">+</button>
        </div>
      </div>

      <div class="item-actions">
        <span class="line-total">$${price.toFixed(2)}</span>
        <button class="remove-btn">✕</button>
      </div>

      <textarea class="comment" placeholder="Comentario adicionales..."></textarea>
    `;

    orderList.appendChild(li);
  } else {
    // aumentar cantidad
    let qty = parseInt(existing.dataset.qty);
    qty++;
    existing.dataset.qty = qty;
    existing.querySelector(".qty").textContent = qty;
    existing.querySelector(".line-total").textContent =
      `$${(price * qty).toFixed(2)}`;
  }

  actualizarTotales();
  actualizarEstadoVacio();
}

/* ============================================================
   LISTENER ORIGINAL PARA addToCart
   ============================================================ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  addToCart(e);
});

/* ============================================================
   MANEJAR + , - y ELIMINAR
   ============================================================ */
orderList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const li = e.target.closest(".order-item");
  const unit = parseFloat(li.dataset.price);
  let qty = parseInt(li.dataset.qty, 10);

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
  } else if (btn.classList.contains("remove-btn")) {
    li.remove();
    actualizarTotales();
    actualizarEstadoVacio();
    return;
  }

  // Actualizar cantidades y línea
  li.dataset.qty = String(qty);
  li.querySelector(".qty").textContent = qty;
  li.querySelector(".line-total").textContent =
    `$${(unit * qty).toFixed(2)}`;

  actualizarTotales();
  actualizarEstadoVacio();
});

/* ============================================================
   CALCULAR TOTALES
   ============================================================ */
function actualizarTotales() {
  let subtotal = 0;
  Array.from(orderList.children).forEach((li) => {
    const unit = parseFloat(li.dataset.price || "0");
    const qty = parseInt(li.dataset.qty || "0");
    subtotal += unit * qty;
  });

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

/* ============================================================
   IMPRIMIR TICKET
   ============================================================ */
if (printBtn) {
  printBtn.addEventListener("click", () => {
    const clones = orderList.cloneNode(true);

    clones.querySelectorAll(".comment").forEach((textarea) => {
      const texto = textarea.value.trim();
      if (!texto) {
        textarea.remove();
      } else {
        const span = document.createElement("div");
        span.className = "print-comment";
        span.textContent = `Comentario: ${texto}`;
        textarea.replaceWith(span);
      }
    });

    const original = orderList.innerHTML;
    orderList.innerHTML = clones.innerHTML;

    window.print();

    orderList.innerHTML = original;
  });
}

/* ============================================================
   CONFIRMAR PEDIDO
   ============================================================ */
if (confirmBtn) {
  confirmBtn.addEventListener("click", () => {
    const items = Array.from(orderList.children).map((li) => ({
      producto: li.dataset.name,
      cantidad: parseInt(li.dataset.qty),
      comentario: li.querySelector(".comment")?.value?.trim() || null,
    }));

    console.log("🧾 Pedido confirmado:", items);
    alert("✅ Pedido confirmado exitosamente");

    orderCount++;
    orderList.innerHTML = "";
    actualizarTotales();
    actualizarEstadoVacio();

    orderDetails.style.display = "none";
  });
}

/* ============================================================
   MOSTRAR INICIALMENTE ESTADO VACÍO
   ============================================================ */
actualizarEstadoVacio();
