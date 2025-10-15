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

// === AGREGAR PRODUCTOS ===
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.menu-card');
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);

    // Mostrar el panel al agregar el primer producto
    if (orderDetails.style.display === 'none') {
      orderDetails.style.display = 'block';
    }

    // Crear elemento visual
    const li = document.createElement('li');
    li.className = 'order-item';
    li.innerHTML = `
      <div class="item-info">
        <span class="item-name">${name}</span>
        <span class="item-price">$${price.toFixed(2)}</span>
      </div>
      <button class="remove-btn" title="Eliminar">✕</button>
    `;
    orderList.appendChild(li);

    subtotal += price;
    actualizarTotales();

    // Eliminar producto
    li.querySelector('.remove-btn').addEventListener('click', () => {
      li.remove();
      subtotal -= price;
      if (subtotal < 0) subtotal = 0;
      actualizarTotales();

      // Si se vacía el pedido, ocultar el panel
      if (orderList.children.length === 0) {
        orderDetails.style.display = 'none';
      }
    });
  });
});

// === ACTUALIZAR TOTALES ===
function actualizarTotales() {
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
