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
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;
    const menuList = document.getElementById("menuList");
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");

    // Invitado
    if (!role) {
        btnLogin.style.display = "block";
        btnLogout.style.display = "none";

        menuList.innerHTML = `
        `;

        return;
    }

    // Usuario logeado
    btnLogin.style.display = "none";
    btnLogout.style.display = "block";

    if (role === "admin") {
        menuList.innerHTML = `
            <li><a href="/personal/admin/add dishes/add_dishes.html"><i class="fas fa-pizza-slice"></i> Gestionar Platillos</a></li>
            <li><a href="/personal/admin/employee management/employee.html"><i class="fas fa-users"></i> Gestionar Empleados</a></li>
        `;
    }

    if (role === "empleado") {
        menuList.innerHTML = `
            <li><a href="/menu/index.html"><i class="fas fa-pizza-slice"></i> Menú</a></li>
        `;
    }

    if (role === "usuario") {
        menuList.innerHTML = `  
            <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> Ver Menú</a></li>
            <li><a href="/perfil/perfil.html"><i class="fas fa-user"></i> Mi Perfil</a></li>
        `;
    }
});