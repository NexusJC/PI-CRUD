// ===============================
//     CARGAR DATOS REALES DEL DASHBOARD
// ===============================
async function loadDashboardData() {
  try {
    const res = await fetch("/api/dashboard");
    const data = await res.json();

    document.getElementById("topDish").textContent = data.topDish;
    document.getElementById("totalUsers").textContent = data.totalUsers;
    document.getElementById("totalEmployees").textContent = data.totalEmployees;
    document.getElementById("totalAdmins").textContent = data.totalAdmins;
    document.getElementById("totalDishes").textContent = data.totalDishes;

    // Generar gráficas
    renderCharts(data);

  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
  }
}


// Ejecutar al cargar la página
loadDashboardData();

// ===============================
//     GRÁFICAS DEL DASHBOARD
// ===============================

// Recibe los datos del backend y genera las gráficas
function renderCharts(data) {
  
  // ============================
  //   GRÁFICA — Ventas últimos 7 días
  // ============================
  const salesCtx = document.getElementById("salesChart").getContext("2d");

  const salesLabels = data.salesLast7Days.map(item => item.day);
  const salesValues = data.salesLast7Days.map(item => item.total_sales);

  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: salesLabels,
      datasets: [{
        label: "Ventas (MXN)",
        data: salesValues,
        borderWidth: 3,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });


  // ============================
  //   GRÁFICA — Top 5 platillos más vendidos
  // ============================
  const topDishesCtx = document.getElementById("topDishesChart").getContext("2d");

  const dishLabels = data.top5Dishes.map(item => item.dish_name);
  const dishValues = data.top5Dishes.map(item => item.total_sold);

  new Chart(topDishesCtx, {
    type: "bar",
    data: {
      labels: dishLabels,
      datasets: [{
        label: "Cantidad vendida",
        data: dishValues,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}

const toggle = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const main = document.querySelector(".main");

// Abrir/cerrar sidebar al hacer clic en el botón
toggle.addEventListener("click", (event) => {
  event.stopPropagation(); // evita que el clic cierre el sidebar
  sidebar.classList.toggle("collapsed");
  main.classList.toggle("collapsed");
});

// 🔥 Cerrar sidebar al hacer clic fuera de él
document.addEventListener("click", (event) => {
  const clickInsideSidebar = sidebar.contains(event.target);
  const clickToggleButton = toggle.contains(event.target);

  // Si el clic NO es dentro del sidebar NI en el botón → cerrar
  if (!clickInsideSidebar && !clickToggleButton) {
    if (!sidebar.classList.contains("collapsed")) {
      sidebar.classList.add("collapsed");
      main.classList.add("collapsed");
    }
  }
});

const themeToggle = document.getElementById("themeToggle");

// Cargar tema guardado
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

// Toggle del tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Guardar preferencia
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// ====== SIDEBAR ACTIVE + HOVER SYSTEM ======
const menuItems = document.querySelectorAll('.sidebar-menu li');
let currentActive = document.querySelector('.sidebar-menu .active');

// Cambiar resaltado al pasar el mouse (hover)
menuItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    menuItems.forEach(i => i.classList.remove('hover-active'));
    item.classList.add('hover-active');
  });

  item.addEventListener('mouseleave', () => {
    item.classList.remove('hover-active');
  });

  // Cambiar activo real al hacer clic
  item.addEventListener('click', () => {
    if (currentActive) currentActive.classList.remove('active');
    item.classList.remove('hover-active');
    item.classList.add('active');
    currentActive = item;
  });
});
