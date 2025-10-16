document.addEventListener('DOMContentLoaded', () => {
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      menuToggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
    });
  }
});

  // === FILTRO DE CATEGORÍAS ===
  const norm = s => (s || '').toString().trim().toLowerCase();

  const mapCategory = (name) => {
    const n = norm(name);
    if (n.includes('pizza')) return 'pizza';
    if (n.includes('hamburg')) return 'hamburguesas';
    if (['pozole','sopa','caldo','menudo'].some(w => n.includes(w))) return 'sopas';
    if (['vino','tinto','blanco','rosado'].some(w => n.includes(w))) return 'vinos';
    if (['pescado','marlin','atun','atún','salmon','salmón','camaron','camarón','mariscos'].some(w => n.includes(w))) return 'pescado';
    return 'comida';
  };

  const cards = document.querySelectorAll('.menu-card');
  const buttons = document.querySelectorAll('.category-btn');

  // Asegurar que cada card tenga categoría
  cards.forEach(card => {
    if (!card.dataset.category) {
      const name = card.dataset.name || card.querySelector('h3')?.textContent || '';
      card.dataset.category = mapCategory(name);
    }
  });

  // Filtrado
  function filterMenu(category) {
    cards.forEach(item => {
      const cat = norm(item.getAttribute('data-category'));
      item.style.display = (category === 'todos' || cat === category) ? '' : 'none';
    });
  }

  // Evento de click en botones
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const category = norm(button.getAttribute('data-category'));
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterMenu(category);
    });
  });

  // Mostrar todo al inicio
  filterMenu('todos');
});