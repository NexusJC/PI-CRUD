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

// Funcionalidad para cambiar imagen de perfil
document.getElementById('btnEditarImg').addEventListener('click', function() {
  document.getElementById('inputImg').click();
});

document.getElementById('inputImg').addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById('perfilImg').src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// Funcionalidad para editar nombre
document.getElementById('btnEditarNombre').addEventListener('click', function() {
  const nombreInput = document.getElementById('perfilNombreText');
  if (nombreInput.readOnly) {
    nombreInput.readOnly = false;
    nombreInput.focus();
    nombreInput.style.backgroundColor = '#f9f9f9';
  } else {
    nombreInput.readOnly = true;
    nombreInput.style.backgroundColor = 'transparent';
  }
});

// Funcionalidad para editar número telefónico
document.getElementById('btnEditarNumero').addEventListener('click', function() {
  const numeroInput = document.getElementById('perfilNumeroText');
  if (numeroInput.readOnly) {
    numeroInput.readOnly = false;
    numeroInput.focus();
    numeroInput.style.backgroundColor = '#f9f9f9';
  } else {
    numeroInput.readOnly = true;
    numeroInput.style.backgroundColor = 'transparent';
  }
});

// Validación en tiempo real para el número telefónico
document.getElementById('perfilNumeroText').addEventListener('input', function(e) {
  const inputValue = e.target.value;
  const cleanedValue = inputValue.replace(/[^0-9\s\+\-\(\)]/g, ''); // Elimina todo lo que no sea números, espacios, +, -, ( o )
  e.target.value = cleanedValue;
});