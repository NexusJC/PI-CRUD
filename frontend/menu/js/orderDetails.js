// === TOGGLE SIDEBAR ===
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));

// === ORDER DETAILS FUNCIONALIDAD ===
const orderDetails = document.getElementById('orderDetails');
const orderList = document.getElementById('orderList');
const subtotalEl = document.getElementById('subtotal');
const totalEl = document.getElementById('total');
const printBtn = document.getElementById('printBtn');
let subtotal = 0;
let orderCount = 1;

// Ocultar al inicio
orderDetails.style.display = 'none';

// === AGREGAR PRODUCTOS (stack) ===
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.menu-card');
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);

    if (orderDetails.style.display === 'none') {
      orderDetails.style.display = 'block';
    }

    // ¿Ya existe el producto en la lista?
    let existing = Array.from(orderList.children).find(li => li.dataset.name === name);

    if (!existing) {
      // Crear ítem stackeado
      const li = document.createElement('li');
      li.className = 'order-item';
      li.dataset.name = name;
      li.dataset.price = String(price); // precio unitario
      li.dataset.qty = '1';

      li.innerHTML = `
        <div class="item-info">
          <span class="item-name">${name}</span>
          <div class="qty-controls">
            <button class="qty-btn minus" aria-label="Disminuir">−</button>
            <span class="qty">1</span>
            <button class="qty-btn plus" aria-label="Aumentar">+</button>
          </div>
        </div>
        <div class="item-actions">
          <span class="line-total">$${price.toFixed(2)}</span>
          <button class="remove-btn" title="Eliminar">✕</button>
        </div>
      `;
      orderList.appendChild(li);
    } else {
      // Incrementar cantidad y subtotal del ítem existente
      const unit = parseFloat(existing.dataset.price);
      const qty = parseInt(existing.dataset.qty, 10) + 1;
      existing.dataset.qty = String(qty);
      existing.querySelector('.qty').textContent = String(qty);
      existing.querySelector('.line-total').textContent = `$${(unit * qty).toFixed(2)}`;
    }

    actualizarTotales();
  });
});

// Delegación para +, − y eliminar por ítem
orderList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const li = e.target.closest('.order-item');
  if (!li) return;

  const unit = parseFloat(li.dataset.price);
  let qty = parseInt(li.dataset.qty, 10);

  if (btn.classList.contains('plus')) {
    qty += 1;
  } else if (btn.classList.contains('minus')) {
    qty -= 1;
    if (qty <= 0) {
      li.remove();
      actualizarTotales();
      if (orderList.children.length === 0) orderDetails.style.display = 'none';
      return;
    }
  } else if (btn.classList.contains('remove-btn')) {
    li.remove();
    actualizarTotales();
    if (orderList.children.length === 0) orderDetails.style.display = 'none';
    return;
  }

  // Actualizar cantidades y línea
  li.dataset.qty = String(qty);
  li.querySelector('.qty').textContent = String(qty);
  li.querySelector('.line-total').textContent = `$${(unit * qty).toFixed(2)}`;
  actualizarTotales();
});

// === ACTUALIZAR TOTALES (recalcula desde el DOM para evitar desajustes) ===
function actualizarTotales() {
  let subtotal = 0;
  Array.from(orderList.children).forEach(li => {
    const unit = parseFloat(li.dataset.price || '0');
    const qty = parseInt(li.dataset.qty || '0', 10);
    subtotal += unit * qty;
  });
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${subtotal.toFixed(2)}`;
}


// === BOTÓN IMPRIMIR ===
printBtn.addEventListener('click', () => {
  window.print();
});

// === CONFIRMAR PEDIDO ===
document.querySelector('.confirm-btn').addEventListener('click', () => {
  alert('✅ Pedido confirmado con éxito');
  orderCount++;
  document.getElementById('orderId').textContent = `#${String(orderCount).padStart(4, '0')}`;
  orderList.innerHTML = '';
  subtotal = 0;
  actualizarTotales();
  orderDetails.style.display = 'none';
});
// ANIMACIÓN
const addButtons = document.querySelectorAll('.add-btn');

function addToCart(event) {
  const button = event.target.closest('.add-btn');
  
  button.classList.add('animate');
  
  setTimeout(() => {
    button.classList.remove('animate');
  }, 400);

}
addButtons.forEach(button => {
  button.addEventListener('click', addToCart);
});