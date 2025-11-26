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

    function getLoginUrl() {
        const isLocal =
            location.hostname === "127.0.0.1" ||
            location.hostname === "localhost";

        if (isLocal) {
            return "../../login/login.html";
        }

        return "/login/login.html";
    }

    const logoutBtn = document.getElementById("btn-logout");
    const loginBtn = document.getElementById("btn-login");
    const menuList = document.getElementById("menuList");
    const sidebarUserImg = document.querySelector(".sidebar-profile img");
    const sidebarUserName = document.querySelector(".sidebar-profile h4");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "usuario") {
        window.location.href = getLoginUrl();
        return;
    }

    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";

    if (sidebarUserName) {
        sidebarUserName.textContent = user.name || "Usuario";
    }

    if (sidebarUserImg && user.profile_picture) {
        sidebarUserImg.src = "/uploads/" + user.profile_picture;
    }

    menuList.innerHTML = `
        <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> Ver Menú</a></li>
        <li><a href="/perfil/perfil.html"><i class="fas fa-user"></i> Mi Perfil</a></li>
    `;

    // LOGOUT
    logoutBtn.addEventListener("click", () => {
        const confirmLogout = confirm("¿Seguro que quieres cerrar sesión?");
        if (!confirmLogout) return;

        localStorage.clear();
        window.location.href = getLoginUrl();
    });

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
            menuToggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
        });
    }

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) &&
            !menuToggle.contains(event.target) &&
            sidebar.classList.contains('active')) 
        {
            sidebar.classList.remove('active');
            menuToggle.textContent = "☰";
        }
    });

});
