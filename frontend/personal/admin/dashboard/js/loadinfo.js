  async function loadDashboard() {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();

      document.getElementById("platillosTotales").textContent = data.platillosTotales;
      document.getElementById("usuariosRegistrados").textContent = data.usuariosRegistrados;
      document.getElementById("empleadosActivos").textContent = data.empleadosActivos;
      document.getElementById("adminsTotales").textContent = data.adminsTotales;

    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  }
//  AUTO-REFRESH CADA 2 SEGUNDOS
setInterval(async () => {
    const pedidoAnterior = pedidoActivo;
    await cargarPedidos();

    if (pedidoAnterior && pedidosData[pedidoAnterior]) {
        seleccionarPedido(pedidoAnterior);
    }
}, 2000); 
  loadDashboard();
