// Sidebar
document.addEventListener('DOMContentLoaded', () => {
  const sidebar   = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle'); 
  const overlay   = document.getElementById('overlay');

  function openSidebar() {
    sidebar.classList.add('active');       
    overlay?.classList.remove('hidden');
    overlay?.classList.add('shown');
    if (toggleBtn && toggleBtn.textContent?.trim() === '☰') toggleBtn.textContent = '✖';
    sidebar.setAttribute('aria-hidden', 'false');
    toggleBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay?.classList.add('hidden');
    overlay?.classList.remove('shown');
    if (toggleBtn && toggleBtn.textContent?.trim() === '✖') toggleBtn.textContent = '☰';
    sidebar.setAttribute('aria-hidden', 'true');
    toggleBtn?.setAttribute('aria-expanded', 'false');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
    });
  }

  if (overlay) overlay.addEventListener('click', closeSidebar);

  document.addEventListener('click', (event) => {
    const clickedToggle = event.target === toggleBtn || toggleBtn?.contains(event.target);
    if (sidebar.classList.contains('active') && !sidebar.contains(event.target) && !clickedToggle) {
      closeSidebar();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
});

window.addEventListener('DOMContentLoaded', () => {
  if (window.Chart && window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
  }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  const c1 = document.getElementById('chart1');
  if (c1) {
    new Chart(c1, {
      type: 'pie',
      data: {
        labels: ['Para llevar', 'En salón', 'Entrega'],
        datasets: [{ data: [17, 25, 58], backgroundColor: ['#FF6384','#36A2EB','#FFCE56'] }]
      },
      options: baseOptions
    });
  }

  const c2 = document.getElementById('chart2');
  if (c2) {
    new Chart(c2, {
      type: 'pie',
      data: {
        labels: ['Estudiantes', 'Maestros', 'Trabajadores'],
        datasets: [{ data: [312, 235, 548], backgroundColor: ['#FF6384','#36A2EB','#FFCE56'] }]
      },
      options: baseOptions
    });
  }

  // Ejemplo
  const exampleActivity = [
    { turno: 'H-1',  cliente: 'Cristina',  correo: 'cristina@mail.com',  fecha: '2025-09-04' },
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
