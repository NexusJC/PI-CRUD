// ====== Sidebar ======
document.addEventListener('DOMContentLoaded', () => {
  const sidebar   = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn  = document.getElementById('close-btn');
  const overlay   = document.getElementById('overlay');

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.remove('hidden');
    sidebar.setAttribute('aria-hidden', 'false');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.add('hidden');
    sidebar.setAttribute('aria-hidden', 'true');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (event) => {
    const clickedToggle = event.target === toggleBtn || toggleBtn?.contains(event.target);
    if (sidebar.classList.contains('is-open') && !sidebar.contains(event.target) && !clickedToggle) {
      closeSidebar();
    }
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
});

// ====== Charts ======
/* Asegúrate de que Chart.js y chartjs-plugin-datalabels se cargan
   antes de este bloque (ambos están con defer en el HTML). */
window.addEventListener('DOMContentLoaded', () => {
  if (window.Chart && window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
  }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false, // respeta altura del contenedor
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, c) => a + c, 0);
          const pct = (value / total) * 100;
          return pct >= 5 ? `${pct.toFixed(1)}%` : '';
        },
        clamp: true
      }
    },
    layout: { padding: 8 }
  };

  // Chart 1
  const c1 = document.getElementById('chart1');
  if (c1) {
    new Chart(c1, {
      type: 'pie',
      data: {
        labels: ['Para llevar', 'En salón', 'Delivery'],
        datasets: [{ data: [17, 25, 58], backgroundColor: ['#FF6384','#36A2EB','#FFCE56'] }]
      },
      options: baseOptions
    });
  }

  // Chart 2
  const c2 = document.getElementById('chart2');
  if (c2) {
    new Chart(c2, {
      type: 'pie',
      data: {
        labels: ['Para llevar', 'En salón', 'Delivery'],
        datasets: [{ data: [312, 235, 548], backgroundColor: ['#FF6384','#36A2EB','#FFCE56'] }]
      },
      options: baseOptions
    });
  }

  // ====== Actividad reciente (ejemplo) ======
  const exampleActivity = [
    { turno: 'H-1',  cliente: 'Renegul',  correo: 'renegul@mail.com',  fecha: '2025-09-04' },
    { turno: 'A-12', cliente: 'Mauricio', correo: 'mauricio@mail.com', fecha: '2025-09-04' },
    { turno: 'H-2',  cliente: 'Juan',     correo: 'juan@mail.com',     fecha: '2025-09-04' },
    { turno: 'A-32', cliente: 'Carlos',   correo: 'carlos@mail.com',   fecha: '2025-09-04' },
    { turno: 'B-45', cliente: 'Pepe',     correo: 'pepe@mail.com',     fecha: '2025-09-04' }
  ];

  const tableBody = document.getElementById('activity-table');
  if (tableBody) {
    exampleActivity.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.turno}</td>
        <td>${row.cliente}</td>
        <td>${row.correo}</td>
        <td>${row.fecha}</td>
      `;
      tableBody.appendChild(tr);
    });
  }
});
