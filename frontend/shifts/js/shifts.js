document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const menuList = document.getElementById("menuList");

  /* === ABRIR / CERRAR SIDEBAR === */
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    toggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
  });

  /* === CERRAR AL DAR CLICK FUERA === */
  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("active") &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove("active");
      toggle.textContent = "☰";
    }
  });

  /* === SESIÓN === */
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    btnLogin.style.display = "none";
    btnLogout.style.display = "block";
  } else {
    btnLogin.style.display = "block";
    btnLogout.style.display = "none";
    menuList.innerHTML = `
      <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> Menú</a></li>
    `;
    return;
  }

  /* === CERRAR SESIÓN === */
  btnLogout.addEventListener("click", () => {
    if (confirm("¿Cerrar sesión?")) {
      localStorage.clear();
      window.location.href = "/menu/index.html";
    }
  });

  /* === MENÚ POR ROL === */
  if (user.role === "usuario") {
    menuList.innerHTML = `
        <li data-no-translate><a href="/menu/index.html"><i class="fas fa-utensils"data-no-translate></i> Ver Menú</a></li>
        <li data-no-translate><a href="/perfil/perfil.html" date-no-translte><i class="fas fa-user"data-no-translate></i> Mi Perfil</a></li>
        <li date-no-translate><a href="/shifts/shifts.html"date-no-translate><i class="fas fa-clock icon" date-no-translate></i> Turnos</a></li>
    `;
  }

  if (user.role === "admin") {
    menuList.innerHTML = `
      <li><a href="/personal/admin/dashboard/dashboard.html"><i class="fas fa-gauge"></i> Dashboard</a></li>
      <li><a href="/personal/admin/add-dishes/add_dishes.html"><i class="fas fa-pizza-slice"></i> Platillos</a></li>
      <li><a href="/personal/admin/employee-management/employee.html"><i class="fas fa-users"></i> Empleados</a></li>
      <li><a href="/personal/admin/gestioncajas/gestioncajas.html"><i class="fas fa-cash-register"></i> Cajas</a></li>
    `;
  }

});
