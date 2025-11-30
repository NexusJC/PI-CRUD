// === TOGGLE SIDEBAR (MENÚ IZQUIERDO) ===
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));

// === ORDER DETAILS FUNCIONALIDAD ===
const orderDetails   = document.getElementById('orderDetails');
const orderList      = document.getElementById('orderList');
const subtotalEl     = document.getElementById('subtotal');
const totalEl        = document.getElementById('total');
const printBtn       = document.getElementById('print-btn');    // <- coincide con el id del HTML
const confirmBtn     = document.getElementById('confirm-btn');  // <- coincide con el id del HTML
const emptyCartMsg   = document.getElementById('empty-cart-msg');
const openSidebarBtn = document.getElementById('open-sidebar-btn');

let subtotal   = 0;
let orderCount = 1;

// Ocultar al inicio
orderDetails.style.display = 'none';

// === ABRIR PANEL DESDE "VER ORDEN" AUNQUE ESTÉ VACÍO ===
if (openSidebarBtn) {
  openSidebarBtn.addEventListener('click', () => {
    orderDetails.style.display = 'block';
    orderDetails.classList.remove('open');
    void orderDetails.offsetWidth; // fuerza reflow para animación
    orderDetails.classList.add('open');
    actualizarEstadoVacio();
  });
}

// === FUNCION AUXILIAR PARA MANEJAR VACÍO / NO VACÍO ===
function actualizarEstadoVacio() {
  const isEmpty = orderList.children.length === 0;

  if (isEmpty) {
    // Mostrar mensaje vacío
    if (emptyCartMsg) emptyCartMsg.style.display = 'block';

    // Totales en cero
    subtotalEl.textContent = '$0.00';
    totalEl.textContent    = '$0.00';

    // Desactivar botones de acción
    if (confirmBtn) confirmBtn.disabled = true;
    if (printBtn)   printBtn.disabled   = true;
  } else {
    // Ocultar mensaje vacío
    if (emptyCartMsg) emptyCartMsg.style.display = 'none';

    // Activar botones
    if (confirmBtn) confirmBtn.disabled = false;
    if (printBtn)   printBtn.disabled   = false;
  }
}

// === AGREGAR PRODUCTOS (stack) ===
// Escuchar clicks dinámicos en botones "Agregar"
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;

  const card  = btn.closest(".menu-card");
  const name  = card.dataset.name;
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

  // Si no existe, crearlo
  if (!existing) {
    const li = document.createElement("li");
    li.className    = "order-item";
    li.dataset.name = name;
    li.dataset.price = price;
    li.dataset.qty   = "1";

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
      <textarea class="comment" placeholder="Comentarios adicionales..."></textarea>
    `;

    orderList.appendChild(li);
  } else {
    // Si ya existe, aumentar cantidad
    let qty = parseInt(existing.dataset.qty);
    qty++;
    existing.dataset.qty = qty;
    existing.querySelector(".qty").textContent = qty;
    existing.querySelector(".line-total").textContent =
      `$${(price * qty).toFixed(2)}`;
  }

  actualizarTotales();
  actualizarEstadoVacio();
});

// Delegación para +, − y eliminar por ítem
orderList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const li = e.target.closest('.order-item');
  if (!li) return;

  const unit = parseFloat(li.dataset.price);
  let qty    = parseInt(li.dataset.qty, 10);

  if (btn.classList.contains('plus')) {
    qty += 1;
  } else if (btn.classList.contains('minus')) {
    qty -= 1;
    if (qty <= 0) {
      li.remove();
      actualizarTotales();
      actualizarEstadoVacio();   // YA NO CERRAMOS EL PANEL, SOLO MOSTRAMOS VACÍO
      return;
    }
  } else if (btn.classList.contains('remove-btn')) {
    li.remove();
    actualizarTotales();
    actualizarEstadoVacio();     // idem
    return;
  }

  // Actualizar cantidades y línea
  li.dataset.qty = String(qty);
  li.querySelector('.qty').textContent = String(qty);
  li.querySelector('.line-total').textContent =
    `$${(unit * qty).toFixed(2)}`;

  actualizarTotales();
  actualizarEstadoVacio();
});

// === ACTUALIZAR TOTALES ===
function actualizarTotales() {
  let subtotal = 0;
  Array.from(orderList.children).forEach(li => {
    const unit = parseFloat(li.dataset.price || '0');
    const qty  = parseInt(li.dataset.qty   || '0', 10);
    subtotal  += unit * qty;
  });
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent    = `$${subtotal.toFixed(2)}`;
}

// === BOTÓN IMPRIMIR ===
if (printBtn) {
  printBtn.addEventListener('click', () => {
    // Clonar la lista para preparar versión de impresión
    const clones = orderList.cloneNode(true);

    clones.querySelectorAll('.comment').forEach(textarea => {
      const texto = (textarea.value || '').trim();

      if (!texto) {
        textarea.remove();
        return;
      }

      const span = document.createElement('div');
      span.className   = 'print-comment';
      span.textContent = `Comentario: ${texto}`;
      textarea.replaceWith(span);
    });

    const original = orderList.innerHTML;
    orderList.innerHTML = clones.innerHTML;

    window.print();

    // Restaurar la lista editable después de imprimir
    orderList.innerHTML = original;
  });
}

// === CONFIRMAR PEDIDO ===
if (confirmBtn) {
  confirmBtn.addEventListener('click', () => {
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
        const { comentario, ...resto } = i;
        return resto;
      }
      return i;
    });

    console.log('🧾 Items a enviar:', itemsParaBackend);

    alert('✅ Pedido confirmado con éxito');

    orderCount++;
    document.getElementById('orderId')?.textContent =
      `#${String(orderCount).padStart(4, '0')}`;

    orderList.innerHTML = '';
    subtotal = 0;
    actualizarTotales();
    actualizarEstadoVacio();

    // Si quieres que al confirmar se cierre el panel, deja esta línea:
    orderDetails.style.display = 'none';
  });
}

// === MODAL DETALLES DE PRODUCTO ===
const modal      = document.getElementById('productModal');
const modalImg   = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc  = document.getElementById('modalDesc');
const modalAddBtn= document.getElementById('modalAddBtn');
const modalClose = document.getElementById('modalClose');

if (modal && modalImg && modalTitle && modalDesc && modalAddBtn && modalClose) {
  document.querySelectorAll('.menu-card img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const card = img.closest('.menu-card');
      modalImg.src       = img.src;
      modalTitle.textContent =
        card.dataset.name || card.querySelector('h3')?.textContent || 'Producto';
      modalDesc.textContent =
        card.dataset.desc || 'Descripción no disponible.';
      modalAddBtn.dataset.name  = card.dataset.name;
      modalAddBtn.dataset.price = card.dataset.price;
      modal.classList.add('active');
    });
  });

  modalClose.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });

  modalAddBtn.addEventListener('click', () => {
    const name = modalAddBtn.dataset.name;
    const card = document.querySelector(
      `.menu-card[data-name="${CSS.escape(name)}"]`
    );
    const addBtn = card?.querySelector('.add-btn');
    addBtn?.click();
    modal.classList.remove('active');
  });
} else {
  console.warn('Modal de producto no encontrado en el DOM al cargar orderDetails.js');
}

// === HINTS VISUALES PARA DETALLES ===
document.querySelectorAll('.menu-card').forEach(card => {
  if (!card.querySelector('.details-badge')) {
    const badge = document.createElement('div');
    badge.className = 'details-badge';
    badge.innerHTML = '<i class="fas fa-info-circle"></i><span>Detalles</span>';
    card.appendChild(badge);
  }

  if (!card.querySelector('.img-cta')) {
    const cta = document.createElement('div');
    cta.className = 'img-cta';
    cta.innerHTML = '<span>Haz clic para ver detalles</span>';
    card.appendChild(cta);
  }

  const img = card.querySelector('img');
  if (img) {
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    const name = card.dataset.name || card.querySelector('h3')?.textContent || 'producto';
    img.setAttribute('aria-label', `Ver detalles de ${name}`);

    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        img.click();
      }
    });
  }
});

// Estado inicial (carrito vacío)
actualizarEstadoVacio();
