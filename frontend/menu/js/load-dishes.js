// frontend/menu/js/load-dishes.js
window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("menuGrid");

  // Referencias al modal de producto (el mismo que usa orderDetails.js)
  const modal       = document.getElementById("productModal");
  const modalImg    = document.getElementById("modalImg");
  const modalTitle  = document.getElementById("modalTitle");
  const modalDesc   = document.getElementById("modalDesc");
  const modalPrice  = document.getElementById("modalPrice");
  const modalAddBtn = document.getElementById("modalAddBtn");

  // Función para abrir el modal con los datos del platillo
  const abrirModalProducto = (dish) => {
    if (!modal || !modalImg || !modalTitle || !modalDesc || !modalPrice || !modalAddBtn) return;

    modalImg.src = dish.imagen;
    modalImg.alt = dish.nombre;

    modalTitle.textContent = dish.nombre;
    modalDesc.textContent  = dish.descripcion || "Descripción no disponible.";

    const precioNum = Number(dish.precio) || 0;
    modalPrice.textContent = `$${precioNum.toFixed(2)}`;

    // Guardamos el nombre/precio en data-* para que orderDetails.js
    // pueda llamar al .add-btn de esa card cuando se presione "Agregar a la orden"
    modalAddBtn.dataset.name  = dish.nombre;
    modalAddBtn.dataset.price = String(precioNum);

    modal.classList.add("active");
  };

  try {
    const res = await fetch("/api/dishes");
    const dishes = await res.json();

    if (!Array.isArray(dishes)) throw new Error("Respuesta inválida");

    dishes.forEach((dish) => {
      const card = document.createElement("div");
      card.classList.add("menu-card");

      // Data attributes para otros scripts (orderDetails, filtros, etc.)
      card.setAttribute("data-name", dish.nombre);
      card.setAttribute("data-price", dish.precio);
      card.setAttribute("data-desc", dish.descripcion || "");

      card.innerHTML = `
        <img src="${dish.imagen}" alt="${dish.nombre}">
        <h3>${dish.nombre}</h3>
        <button class="add-btn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5h2v14h-2z"></path>
            <path d="M5 11h14v2H5z"></path>
          </svg>
          Agregar
        </button>
      `;

      // ===== HINT VISUAL: "Haz clic para ver detalles" =====
      // Badge arriba a la derecha
      const badge = document.createElement("div");
      badge.className = "details-badge";
      badge.innerHTML = '<i class="fas fa-info-circle"></i><span>Detalles</span>';
      card.appendChild(badge);

      // Cinta sobre la imagen
      const cta = document.createElement("div");
      cta.className = "img-cta";
      cta.innerHTML = "<span>Haz clic para ver detalles</span>";
      card.appendChild(cta);

      // Cuando se haga clic en la imagen → abrir modal con blur
      const img = card.querySelector("img");
      if (img) {
        img.style.cursor = "pointer";
        img.setAttribute("role", "button");
        img.setAttribute("tabindex", "0");
        img.setAttribute("aria-label", `Ver detalles de ${dish.nombre}`);

        img.addEventListener("click", () => {
          abrirModalProducto(dish);
        });

        // Teclado (Enter / Space) también abre el modal
        img.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirModalProducto(dish);
          }
        });
      }

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error al cargar los platillos:", err);
    if (container) {
      container.innerHTML = "<p>Error al cargar el menú.</p>";
    }
  }
});
