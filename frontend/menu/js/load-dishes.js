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

      // Agregar evento de clic en la imagen para abrir el popup con la descripción
      const img = card.querySelector("img");
      img.addEventListener("click", () => {
        const popup = document.getElementById("descriptionPopup");
        const popupTitle = document.getElementById("popupTitle");
        const popupImage = document.getElementById("popupImage");
        const popupDescription = document.getElementById("popupDescription");

        // Llenar el popup con los datos del platillo
        popupTitle.textContent = dish.nombre;  // Título del popup
        popupImage.src = dish.imagen;  // Imagen del platillo
        popupDescription.textContent = dish.descripcion;  // Descripción del platillo

        // Mostrar el popup
        popup.style.display = "block";  
      });

      container.appendChild(card);
    });

    // Evento para cerrar el popup
    const closePopupBtn = document.getElementById("closePopup");
    closePopupBtn.addEventListener("click", () => {
      const popup = document.getElementById("descriptionPopup");
      popup.style.display = "none";  // Cerrar el popup
    });

  } catch (err) {
    console.error("Error al cargar los platillos:", err);
    container.innerHTML = "<p>Error al cargar el menú.</p>";
  }
});
