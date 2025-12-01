/* ============================================================
   ORDER DETAILS – SISTEMA POS PREMIUM
   ============================================================ */

const orderDetails = document.getElementById("orderDetails");
const orderList = document.getElementById("orderList");
const emptyMsg = document.getElementById("empty-cart-msg");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const confirmBtn = document.getElementById("confirm-btn");
const printBtn = document.getElementById("print-btn");
const closeOrderDetailsBtn = document.getElementById("closeOrderDetailsBtn");
const openOrderDetailsBtn = document.getElementById("openOrderDetailsBtn");

let subtotal = 0;

/* ============================================================
   ABRIR PANEL (SIEMPRE)
   ============================================================ */
if (openOrderDetailsBtn) {
  openOrderDetailsBtn.addEventListener("click", () => {
    orderDetails.style.display = "block";
    orderDetails.classList.add("open");
    actualizarEstado();
  });
}

/* ============================================================
   CERRAR PANEL
   ============================================================ */
if (closeOrderDetailsBtn) {
  closeOrderDetailsBtn.addEventListener("click", () => {
    orderDetails.classList.remove("open");
    setTimeout(() => orderDetails.style.display = "none", 150);
  });
}

/* ============================================================
   AGREGAR PRODUCTOS (POS PREMIUM)
   ============================================================ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;

  const card = btn.closest(".menu-card");
  const name = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const img = card.querySelector("img")?.src || "";

  orderDetails.style.display = "block";
  orderDetails.classList.add("open");

  let existing = [...orderList.children].find(
    item => item.dataset.name === name
  );

  if (!existing) {
    const div = document.createElement("div");
    div.className = "od-item";
    div.dataset.name = name;
    div.dataset.price = price;
    div.dataset.qty = "1";

    div.innerHTML = `
      <div class="od-thumb">
        <img src="${img}">
      </div>

      <div class="od-info">
        <span class="name">${name}</span>
        <textarea class="comment" placeholder="Comentarios..."></textarea>
      </div>

      <div class="od-controls">
        <div class="qty-controls">
          <button class="qty-btn minus">−</button>
          <span class="qty">1</span>
          <button class="qty-btn plus">+</button>
        </div>
        <span class="price">$${price.toFixed(2)}</span>
      </div>
    `;

    orderList.appendChild(div);

  } else {
    let qty = parseInt(existing.dataset.qty) + 1;
    existing.dataset.qty = qty;
    existing.querySelector(".qty").textContent = qty;
    existing.querySelector(".price").textContent =
      `$${(qty * price).toFixed(2)}`;
  }

  actualizarTotales();
  actualizarEstado();
});

/* ============================================================
   CONTROLES DE CANTIDAD (+ / - / eliminar)
   ============================================================ */
orderList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const item = e.target.closest(".od-item");
  let qty = parseInt(item.dataset.qty);
  const price = parseFloat(item.dataset.price);

  if (btn.classList.contains("plus")) qty++;
  if (btn.classList.contains("minus")) qty--;

  if (qty <= 0) {
    item.remove();
    actualizarTotales();
    actualizarEstado();
    return;
  }

  item.dataset.qty = qty;
  item.querySelector(".qty").textContent = qty;
  item.querySelector(".price").textContent =
    `$${(qty * price).toFixed(2)}`;

  actualizarTotales();
  actualizarEstado();
});

/* ============================================================
   TOTALES
   ============================================================ */
function actualizarTotales() {
  subtotal = 0;
  [...orderList.children].forEach(item => {
    const price = parseFloat(item.dataset.price);
    const qty = parseInt(item.dataset.qty);
    subtotal += price * qty;
  });

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

/* ============================================================
   ESTADO VACÍO
   ============================================================ */
function actualizarEstado() {
  const empty = orderList.children.length === 0;

  emptyMsg.style.display = empty ? "block" : "none";
  confirmBtn.disabled = empty;
  printBtn.disabled = empty;
}

/* ============================================================
   IMPRIMIR TICKET
   ============================================================ */
if (printBtn) {
  printBtn.addEventListener("click", () => {
    const copy = orderList.cloneNode(true);

    copy.querySelectorAll(".comment").forEach(c => {
      if (!c.value.trim()) c.remove();
      else {
        const txt = document.createElement("p");
        txt.textContent = "Comentario: " + c.value.trim();
        c.replaceWith(txt);
      }
    });

    const old = orderList.innerHTML;
    orderList.innerHTML = copy.innerHTML;

    window.print();

    orderList.innerHTML = old;
  });
}

/* ============================================================
   CONFIRMAR PEDIDO
   ============================================================ */
if (confirmBtn) {
  confirmBtn.addEventListener("click", () => {
    const items = [...orderList.children].map(item => ({
      producto: item.dataset.name,
      cantidad: parseInt(item.dataset.qty),
      comentario: item.querySelector(".comment")?.value || null
    }));

    console.log("ENVIAR AL BACKEND:", items);

    alert("Pedido confirmado ✔");

    orderList.innerHTML = "";
    actualizarTotales();
    actualizarEstado();
    orderDetails.classList.remove("open");
  });
}
