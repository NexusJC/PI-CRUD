// ==== ORDENES_PASADAS.JS ====
// Renderiza una tabla de órdenes (más recientes -> más antiguas)
// Basado en estilos/estructura de perfil.html y perfil.css

document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tbodyOrdenes");
  const inputBusqueda = document.getElementById("busqueda");
  const filtroEstado = document.getElementById("filtroEstado");

  // Toggle del dashboard lateral (reimplementado aquí para no depender de perfil.js)
  const dash = document.getElementById('dash');
  const overlay = document.getElementById('overlay');
  const btnDash = document.getElementById('btnDash');

  btnDash?.addEventListener('click', () => {
    const opened = dash.classList.toggle('open');
    document.body.classList.toggle('dash-open', opened);
    btnDash.setAttribute('aria-expanded', opened ? 'true' : 'false');
    dash.setAttribute('aria-hidden', opened ? 'false' : 'true');
  });
  overlay?.addEventListener('click', () => {
    dash.classList.remove('open');
    document.body.classList.remove('dash-open');
    btnDash?.setAttribute('aria-expanded','false');
    dash.setAttribute('aria-hidden','true');
  });

  // 1) Intento de fetch a API real (ajusta la URL si ya tienes endpoint)
  let ordenes = [];
  try {
    const resp = await fetch('/api/ordenes/pasadas'); // <-- cambia según tu backend
    if (resp.ok) {
      ordenes = await resp.json();
    }
  } catch (_) {
    // Ignoramos error de red: caeremos al mock
  }

  // 2) Si no hay API disponible, usamos datos de ejemplo (mock)
  if (!Array.isArray(ordenes) || ordenes.length === 0) {
    ordenes = [
      {
        id: "A-2109",
        fechaISO: "2025-09-30T10:35:00",
        items: 3,
        total: 245.00,
        pago: "Tarjeta",
        estado: "Entregado",
        notas: "Sin cebolla"
      },
      {
        id: "A-2108",
        fechaISO: "2025-09-29T21:10:00",
        items: 2,
        total: 190.00,
        pago: "Efectivo",
        estado: "Cancelado",
        notas: ""
      },
      {
        id: "A-2107",
        fechaISO: "2025-09-29T13:42:00",
        items: 5,
        total: 520.50,
        pago: "Tarjeta",
        estado: "Entregado",
        notas: "Salsa extra"
      },
      {
        id: "A-2106",
        fechaISO: "2025-09-27T18:05:00",
        items: 1,
        total: 79.00,
        pago: "Tarjeta",
        estado: "Reembolsado",
        notas: "Demora"
      }
    ];
  }

  // Normaliza campos si vienen con otros nombres desde tu API
  ordenes = ordenes.map(o => ({
    id: o.id || o.numero || o.no_orden || "—",
    fechaISO: o.fechaISO || o.fecha || o.created_at || o.fecha_hora || null,
    items: Number(o.items ?? o.total_items ?? 0),
    total: Number(o.total ?? o.total_pagar ?? 0),
    pago: o.pago || o.metodo_pago || "—",
    estado: o.estado || o.status || "—",
    notas: o.notas || o.comentarios || ""
  }));

  // Orden descendente por fecha (más recientes primero)
  ordenes.sort((a, b) => {
    const ta = a.fechaISO ? new Date(a.fechaISO).getTime() : 0;
    const tb = b.fechaISO ? new Date(b.fechaISO).getTime() : 0;
    return tb - ta;
  });

  // Render inicial
  render(ordenes);

  // Filtros
  inputBusqueda?.addEventListener('input', () => aplicarFiltros());
  filtroEstado?.addEventListener('change', () => aplicarFiltros());

  function aplicarFiltros(){
    const q = (inputBusqueda?.value || "").toLowerCase().trim();
    const estado = filtroEstado?.value || "";

    const filtradas = ordenes.filter(o => {
      const matchesQ = !q || (
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.notas && o.notas.toLowerCase().includes(q))
      );
      const matchesEstado = !estado || (o.estado === estado);
      return matchesQ && matchesEstado;
    });

    render(filtradas);
  }

  function render(lista){
    tbody.innerHTML = "";
    const fmtMX = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });
    const fmtHora = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' });
    const fmtMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

    lista.forEach((o, idx) => {
      const tr = document.createElement("tr");
      const fecha = o.fechaISO ? new Date(o.fechaISO) : null;
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${fecha ? fmtMX.format(fecha) : "—"}</td>
        <td>${fecha ? fmtHora.format(fecha) : "—"}</td>
        <td><strong>${escapeHTML(o.id)}</strong></td>
        <td>${o.items}</td>
        <td>${fmtMoneda.format(o.total)}</td>
        <td>${escapeHTML(o.pago)}</td>
        <td>${renderBadge(o.estado)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderBadge(estado){
    const e = (estado || "").toLowerCase();
    if (e.includes("entregado")) return `<span class="badge entregado">Entregado</span>`;
    if (e.includes("cancel")) return `<span class="badge cancelado">Cancelado</span>`;
    if (e.includes("reemb")) return `<span class="badge reembolsado">Reembolsado</span>`;
    return `<span class="badge">${escapeHTML(estado || "—")}</span>`;
  }

  function escapeHTML(s){
    return (s ?? "").toString().replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[m]));
  }
});
