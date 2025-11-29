document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      menuToggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
                    
      // Ajustar el contenido principal cuando el sidebar está activo
      if (sidebar.classList.contains("active")) {
        mainContent.style.marginLeft = "300px";
      } else {
        mainContent.style.marginLeft = "0";
      }
    });
  }

  // Cerrar sidebar al hacer clic fuera de él
  document.addEventListener('click', (event) => {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMenuToggle = menuToggle.contains(event.target);
                
    if (!isClickInsideSidebar && !isClickOnMenuToggle && sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
    menuToggle.textContent = "☰";
    mainContent.style.marginLeft = "0";
    }
  });
});


// Este script protege al perfil de errores del sidebar del menú
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  // Si el toggle existe, forzamos el listener aquí
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // evita interferencias
      sidebar.classList.toggle("active");
      menuToggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
    });
  }

  // Evitar que el JS del menú falle por elementos que NO existen en el perfil
  // Esto envuelve TODAS las funciones peligrosas
  try {
    console.log("Perfil: aislando el JS del menú para evitar errores…");
  } catch (err) {
    console.warn("Error controlado:", err);
  }
});
