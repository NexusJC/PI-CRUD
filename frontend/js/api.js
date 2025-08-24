const API = "http://localhost:3001/api";

async function crearTicket(code) {
  const res = await fetch(`${API}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });
  if (!res.ok) throw new Error("Error creando ticket");
  return res.json();
}

async function listarTickets() {
  const res = await fetch(`${API}/tickets`);
  return res.json();
}

function renderLista(tickets) {
  const ul = document.getElementById("lista");
  ul.innerHTML = "";
  tickets.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.id} · ${t.code} · ${t.status} · ${new Date(t.created_at).toLocaleString()}`;
    ul.appendChild(li);
  });
}

document.getElementById("crear").addEventListener("click", async () => {
  const code = document.getElementById("code").value.trim();
  const msg = document.getElementById("msg");
  if (!code) { msg.textContent = "Ingresa un código"; return; }
  try {
    await crearTicket(code);
    msg.textContent = "✔ Ticket creado";
    document.getElementById("code").value = "";
    renderLista(await listarTickets());
  } catch (e) {
    msg.textContent = "✖ Error";
  }
});

// Cargar lista al abrir
(async () => {
  renderLista(await listarTickets());
})();
