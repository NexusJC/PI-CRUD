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
// Escuchar clicks dinámicos en botones "Agregar"
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return; // si no es un botón agregar, no hacemos nada

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
  let existing = Array.from(orderList.children).find(li => li.dataset.name === name);

  // Si no existe, crearlo
  if (!existing) {
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
  } 
  // Si ya existe, aumentar cantidad
  else {
    let qty = parseInt(existing.dataset.qty);
    qty++;
    existing.dataset.qty = qty;
    existing.querySelector(".qty").textContent = qty;
    existing.querySelector(".line-total").textContent = `$${(price * qty).toFixed(2)}`;
  }

  actualizarTotales();
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
  // Clonar la lista para preparar versión de impresión
  const clones = orderList.cloneNode(true);

  clones.querySelectorAll('.comment').forEach(textarea => {
    const texto = (textarea.value || '').trim();

    if (!texto) {
      // Si está vacío, se elimina del ticket
      textarea.remove();
      return;
    }

    // Si tiene texto, se muestra como línea legible
    const span = document.createElement('div');
    span.className = 'print-comment';
    span.textContent = `Comentario: ${texto}`;
    textarea.replaceWith(span);
  });

  // Reemplazar temporalmente la lista por la versión lista para imprimir
  const original = orderList.innerHTML;
  orderList.innerHTML = clones.innerHTML;

  window.print();

  // Restaurar la lista editable después de imprimir
  orderList.innerHTML = original;
});


// === CONFIRMAR PEDIDO ===
document.querySelector('.confirm-btn').addEventListener('click', () => {
  const items = Array.from(orderList.children).map(li => {
    const comentario = li.querySelector('.comment')?.value?.trim() || '';
    return {
      producto: li.dataset.name,
      cantidad: parseInt(li.dataset.qty || '0', 10),
      comentario: comentario || null
    };
  });

  const itemsParaBackend = items.map(i => {
    if (i.comentario === null) {
      // elimina la propiedad si está vacía
      const { comentario, ...resto } = i;
      return resto;
    }
    return i;
  });

  console.log('🧾 Items a enviar:', itemsParaBackend);

  alert('✅ Pedido confirmado con éxito');

  orderCount++;
  document.getElementById('orderId').textContent = `#${String(orderCount).padStart(4, '0')}`;
  orderList.innerHTML = '';
  subtotal = 0;
  actualizarTotales();
  orderDetails.style.display = 'none';
});

// Delegación para animación en botones agregados dinámicamente
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;

  addToCart(e);
});

// === MODAL DETALLES DE PRODUCTO ===
const modal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalAddBtn = document.getElementById('modalAddBtn');
const modalClose = document.getElementById('modalClose');

// Si el modal no existe aún, no continuamos para evitar errores
if (modal && modalImg && modalTitle && modalDesc && modalAddBtn && modalClose) {
  // Abrir modal al clickear imagen de la card
  document.querySelectorAll('.menu-card img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const card = img.closest('.menu-card');
      modalImg.src = img.src;
      modalTitle.textContent = card.dataset.name || card.querySelector('h3')?.textContent || 'Producto';
      modalDesc.textContent = card.dataset.desc || 'Descripción no disponible.';
      modalAddBtn.dataset.name = card.dataset.name;
      modalAddBtn.dataset.price = card.dataset.price;
      modal.classList.add('active');
    });
  });

  // Cerrar modal
  modalClose.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Agregar al pedido desde el modal (reutiliza tu lógica de ".add-btn")
  modalAddBtn.addEventListener('click', () => {
    const name = modalAddBtn.dataset.name;
    const card = document.querySelector(`.menu-card[data-name="${CSS.escape(name)}"]`);
    const addBtn = card?.querySelector('.add-btn');
    addBtn?.click();
    modal.classList.remove('active');
  });
} else {
  console.warn('Modal de producto no encontrado en el DOM al cargar orderDetails.js');
}
// === HINTS VISUALES PARA DETALLES ===
document.querySelectorAll('.menu-card').forEach(card => {
  // Badge “Detalles”
  if (!card.querySelector('.details-badge')) {
    const badge = document.createElement('div');
    badge.className = 'details-badge';
    badge.innerHTML = '<i class="fas fa-info-circle"></i><span>Detalles</span>';
    card.appendChild(badge);
  }

  // Cinta “Haz clic para ver detalles”
  if (!card.querySelector('.img-cta')) {
    const cta = document.createElement('div');
    cta.className = 'img-cta';
    cta.innerHTML = '<span>Haz clic para ver detalles</span>';
    card.appendChild(cta);
  }

  // Accesibilidad y pista de interacción en la imagen
  const img = card.querySelector('img');
  if (img) {
    // role/button + teclado
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    const name = card.dataset.name || card.querySelector('h3')?.textContent || 'producto';
    img.setAttribute('aria-label', `Ver detalles de ${name}`);

    // Enter o Space también abren el modal
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        img.click();
      }
    });
  }
});
//prueba del order details
const orderDetails = document.getElementById('orderDetails');
const closeBtn = document.getElementById('close-details');
const openBtn = document.getElementById('open-details');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

function actualizarTotales() {
  let subtotal = 0;
  Array.from(orderList.children).forEach(li => {
    const unit = parseFloat(li.dataset.price || '0');
    const qty = parseInt(li.dataset.qty || '0', 10);
    subtotal += unit * qty;
  });
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
}

function toggleOrderDetails() {
  if (orderList.children.length > 0) {
    orderDetails.style.display = "block";
    openBtn.style.display = 'none';
    closeBtn.style.display = 'inline-block';
  } else {
    orderDetails.style.display = "none";
    openBtn.style.display = 'inline-block';
    closeBtn.style.display = 'none';
  }
}

openBtn.addEventListener('click', () => {
  toggleOrderDetails();
});

closeBtn.addEventListener('click', () => {
  orderDetails.style.display = "none";
  openBtn.style.display = 'inline-block';
  closeBtn.style.display = 'none';
});

sidebarToggleBtn.addEventListener('click', () => {
  toggleOrderDetails();
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;

  const card = btn.closest(".menu-card");
  const name = card.dataset.name;
  const price = parseFloat(card.dataset.price);

  let existing = Array.from(orderList.children).find(li => li.dataset.name === name);

  if (!existing) {
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
      <textarea class="comment" placeholder="Comentario adicional..."></textarea>
    `;
    orderList.appendChild(li);
  } else {
    let qty = parseInt(existing.dataset.qty);
    qty++;
    existing.dataset.qty = qty;
    existing.querySelector(".qty").textContent = qty;
    existing.querySelector(".line-total").textContent = `$${(price * qty).toFixed(2)}`;
  }

  actualizarTotales();
  toggleOrderDetails();
});

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
      toggleOrderDetails();
      return;
    }
  } else if (btn.classList.contains('remove-btn')) {
    li.remove();
    actualizarTotales();
    toggleOrderDetails();
    return;
  }

  li.dataset.qty = String(qty);
  li.querySelector('.qty').textContent = String(qty);
  li.querySelector('.line-total').textContent = `$${(unit * qty).toFixed(2)}`;
  actualizarTotales();
});

