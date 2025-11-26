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

    // Funcionalidad para editar email
    document.getElementById('btnEditarEmail').addEventListener('click', function() {
      const emailInput = document.getElementById('perfilEmailText');
      if (emailInput.readOnly) {
        emailInput.readOnly = false;
        emailInput.focus();
        emailInput.style.backgroundColor = '#f9f9f9';
      } else {
        emailInput.readOnly = true;
        emailInput.style.backgroundColor = 'transparent';
      }
    });
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const menuList = document.getElementById("menuList");
  const sidebarUserImg = document.querySelector(".sidebar-profile img");
  const sidebarUserName = document.querySelector(".sidebar-profile h4");

  if (!token || !user) {
    window.location.href = "../login/login.html";
    return;
  }

  btnLogin.style.display = "none";
  btnLogout.style.display = "block";

  sidebarUserName.textContent = user.name || "Usuario";

  if (user.profile_picture) {
    sidebarUserImg.src = "/uploads/" + user.profile_picture;
  }

  if (user.role === "admin") {
    menuList.innerHTML = `
      <li><a href="/personal/admin/dashboard/dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a></li>
      <li><a href="/personal/admin/employee-management/employee.html"><i class="fas fa-users"></i> Empleados</a></li>
      <li><a href="/personal/admin/gestioncajas/gestioncajas.html"><i class="fas fa-cash-register"></i> Cajas</a></li>
    `;
  }

  if (user.role === "empleado") {
    menuList.innerHTML = `
      <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> Tomar pedidos</a></li>
    `;
  }

  if (user.role === "usuario") {
    menuList.innerHTML = `
      <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> Ver menú</a></li>
      <li><a href="/perfil/perfil.html"><i class="fas fa-user"></i> Mi perfil</a></li>
    `;
  }

  btnLogout.addEventListener("click", () => {
    const confirmar = confirm("¿Seguro que quieres cerrar sesión?");
    if (!confirmar) return;
    localStorage.clear();
    window.location.href = "../login/login.html";
  });

  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      menuToggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
    });

    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) &&
          !menuToggle.contains(e.target) &&
          sidebar.classList.contains("active")) {
        sidebar.classList.remove("active");
        menuToggle.textContent = "☰";
      }
    });
  }
});
