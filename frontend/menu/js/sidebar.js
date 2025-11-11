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

// === Cerrar sidebar al hacer clic fuera ===
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');

  if (sidebar.classList.contains('active')) {
    const clickInsideSidebar = sidebar.contains(e.target);
    const clickOnToggle = menuToggle.contains(e.target);
    if (!clickInsideSidebar && !clickOnToggle) {
      sidebar.classList.remove('active');
      menuToggle.textContent = '☰'; 
    }
  }
});
// === Verificar sesión activa y alternar botones ===
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');

  if (token && user) {
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'block';
  } else {
    btnLogin.style.display = 'block';
    btnLogout.style.display = 'none';
  }

  // Cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
  const confirmLogout = confirm("¿Seguro que quieres cerrar sesión?");
  if (confirmLogout) {
    localStorage.clear();
    window.location.href = "../menu/index.html";
      }
    });
   }
});
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const usernameText = document.getElementById('username-text');
  const usernameValue = document.getElementById('username');
  const usernameDefault = document.getElementById('username-default');

  if (token && user) {
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'block';
    usernameText.style.display = 'block';
    usernameValue.textContent = user.name;
    usernameDefault.style.display = 'none';
  } else {
    btnLogin.style.display = 'block';
    btnLogout.style.display = 'none';
    usernameText.style.display = 'none';
    usernameDefault.style.display = 'block';
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      const confirmLogout = confirm("¿Seguro que quieres cerrar sesión?");
      if (confirmLogout) {
        localStorage.clear();
        window.location.href = "../login/login.html";
      }
    });
  }
});