let rolesChart = null;
let lastStats = null;

/**
 * Carga los números del backend y actualiza las tarjetas.
 */
async function loadDashboard() {
  try {
    const res = await fetch("/api/dashboard/stats");
    if (!res.ok) {
      throw new Error("Respuesta no válida del servidor");
    }

    const data = await res.json();
    lastStats = data;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value ?? "0";
    };

    setText("platillosTotales", data.platillosTotales);
    setText("usuariosRegistrados", data.usuariosRegistrados);
    setText("empleadosActivos", data.empleadosActivos);
    setText("adminsTotales", data.adminsTotales);

    initRolesChart(data);
  } catch (err) {
    console.error("Error cargando dashboard:", err);
  }
}

/**
 * Crea / actualiza la gráfica de distribución de roles.
 * Usa los datos que ya tienes en /api/dashboard/stats:
 *  - usuariosRegistrados
 *  - empleadosActivos
 *  - adminsTotales
 */
function initRolesChart(data) {
  const canvas = document.getElementById("chartRoles");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");

  const empleados = Number(data.empleadosActivos || 0);
  const admins = Number(data.adminsTotales || 0);
  const totalUsers = Number(data.usuariosRegistrados || 0);

  let clientes = totalUsers - empleados - admins;
  if (!Number.isFinite(clientes) || clientes < 0) clientes = 0;

  const labels = ["Clientes", "Empleados", "Admins"];
  const dataset = [clientes, empleados, admins];

  // Colores pensados para tema oscuro/claro
  const colors = ["#22c55e", "#3b82f6", "#f97316"];

  if (rolesChart) {
    rolesChart.destroy();
  }

  const isDark = document.body.classList.contains("admin-dark");
  const legendColor = isDark ? "#e5e7eb" : "#6b7280";

  rolesChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: dataset,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: legendColor,
            boxWidth: 12,
            padding: 16,
            font: {
              size: 11,
              family: "Poppins"
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.formattedValue}`
          }
        }
      },
      cutout: "65%"
    }
  });
}

// Cargar dashboard al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

// Re-render de la gráfica cuando se cambie el tema
document.addEventListener("admin-theme-changed", () => {
  if (lastStats) {
    initRolesChart(lastStats);
  }
});
