// === CARRUSEL HORIZONTAL ===
const turnosCarousel = document.getElementById('turnosCarousel');
const nextTurno = document.getElementById('nextTurno');
const prevTurno = document.getElementById('prevTurno');

function scrollByCards(dir = 1) {
  const card = turnosCarousel?.querySelector('.turno-card');
  const step = card ? card.getBoundingClientRect().width + 24 : 340;
  turnosCarousel?.scrollBy({ left: dir * step, behavior: 'smooth' });
}

nextTurno?.addEventListener('click', () => scrollByCards(1));
prevTurno?.addEventListener('click', () => scrollByCards(-1));

// Rueda vertical → scroll horizontal
turnosCarousel?.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    turnosCarousel.scrollBy({ left: e.deltaY, behavior: 'smooth' });
  }
}, { passive: false });


// === CAMBIO DE ESTADOS (chip + timeline + btn) ===
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card  = btn.closest('.turno-card');
    if (!card) return;

    const steps = card.querySelectorAll('.step');
    const chip  = card.querySelector('.status-chip');

    const setChip = (cls, text) => {
      if (!chip) return;
      chip.classList.remove('is-pendiente', 'is-preparando', 'is-listo', 'is-entregado');
      chip.classList.add(cls, 'bump');
      chip.textContent = text;
      setTimeout(() => chip.classList.remove('bump'), 300);
    };

    // PENDIENTE → EN PREPARACIÓN
    if (btn.classList.contains('iniciar')) {
      steps[0]?.classList.add('completed');
      steps[1]?.classList.add('active');
      setChip('is-preparando', 'En preparación');

      btn.innerHTML = '<i class="fa-solid fa-check"></i> Marcar como listo';
      btn.className = 'btn listo';
      return;
    }

    // EN PREPARACIÓN → LISTO
    if (btn.classList.contains('listo')) {
      steps[1]?.classList.remove('active');
      steps[1]?.classList.add('completed');
      steps[2]?.classList.add('active');
      setChip('is-listo', 'Listo');

      btn.innerHTML = '<i class="fa-solid fa-box"></i> Entregar pedido';
      btn.className = 'btn entregar';
      return;
    }

    // LISTO → ENTREGADO (eliminar tarjeta)
    if (btn.classList.contains('entregar')) {
      steps[2]?.classList.remove('active');
      steps[2]?.classList.add('completed');
      steps[3]?.classList.add('active');
      setChip('is-entregado', 'Entregado');

      btn.innerHTML = '<i class="fa-solid fa-check-double"></i> Completado';
      btn.className = 'btn completado';
      btn.disabled = true;

      // Efecto visual y eliminación
      card.style.transition = 'opacity .35s ease, transform .35s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.98)';

      setTimeout(() => {
        card.remove();

        if (!turnosCarousel.querySelector('.turno-card')) {
          const empty = document.createElement('div');
          empty.textContent = 'Sin pedidos en cocina';
          empty.style.cssText =
            'margin:2rem auto;font-weight:600;color:#777;padding:1rem 1.25rem;border-radius:12px;background:#f7f7f7;';
          turnosCarousel.appendChild(empty);
        }
      }, 350);
    }
  });
});

// === Toggle del sidebar (por si no lo maneja tu sidebar.js) ===
const menuToggle  = document.getElementById('menuToggle');
const sidebarEl   = document.getElementById('sidebar');

if (menuToggle && sidebarEl && !menuToggle.dataset.bound) {
  menuToggle.dataset.bound = 'true';
  menuToggle.addEventListener('click', () => {
    const isActive = sidebarEl.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });
}
