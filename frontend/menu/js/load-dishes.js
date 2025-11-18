window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("menuGrid");

  try {
    const res = await fetch("/api/dishes");
    const dishes = await res.json();

    if (!Array.isArray(dishes)) throw new Error("Respuesta inválida");

    dishes.forEach(dish => {
      const card = document.createElement("div");
      card.classList.add("menu-card");

      card.setAttribute("data-name", dish.nombre);
      card.setAttribute("data-price", dish.precio);
      card.setAttribute("data-desc", dish.descripcion);

      card.innerHTML = `
        <img src="${dish.imagen}" alt="${dish.nombre}">
        <h3>${dish.nombre}</h3>
        <button class="add-btn">
          <svg viewBox="0 0 24 24">
            <path d="M11 5h2v14h-2z"/><path d="M5 11h14v2H5z"/>
          </svg>
          Agregar
        </button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error al cargar los platillos:", err);
    container.innerHTML = "<p>Error al cargar el menú.</p>";
  }
});
