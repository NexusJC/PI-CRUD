const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");

  // Cambiar el icono ☰ a ✖
  if (sidebar.classList.contains("active")) {
    menuToggle.textContent = "✖";
  } else {
    menuToggle.textContent = "☰";
  }
});
document.querySelectorAll('.category-btn').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-category'); // Obtener la categoría del botón
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active'); // Agregar clase 'active' al botón clicado
    filterMenu(category); // Filtrar los elementos del menú
  });
});

function filterMenu(category) {
  const menuItems = document.querySelectorAll('.menu-card');
  menuItems.forEach(item => {
    if (category === 'todos' || item.getAttribute('data-category').toLowerCase() === category.toLowerCase()) {
      item.style.display = 'block'; // Mostrar el elemento
    } else {
      item.style.display = 'none'; // Ocultar el elemento
    }
  });
}

filterMenu('todos'); // Inicializa con 'Todos' seleccionado para mostrar todos los elementos por defecto
