// frontend/menu/js/load-dishes.js
window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("menuGrid");

  // Referencias al modal de producto
  const modal       = document.getElementById("productModal");
  const modalImg    = document.getElementById("modalImg");
  const modalTitle  = document.getElementById("modalTitle");
  const modalDesc   = document.getElementById("modalDesc");
  const modalPrice  = document.getElementById("modalPrice");
  const modalAddBtn = document.getElementById("modalAddBtn");

  // Helper para traducir la descripción del modal según el idioma actual
  const traducirDescripcionModalSiHaceFalta = () => {
    try {
      const lang =
        (window.getCurrentLanguage && window.getCurrentLanguage()) ||
        document.documentElement.lang ||
        "es";

      if (lang !== "es" && window.translateElementText) {
        window.translateElementText(modalDesc, lang);
      }
    } catch (err) {
      console.error("Error al traducir la descripción del modal:", err);
    }
  };

  const abrirModalProducto = (dish) => {
    if (!modal || !modalImg || !modalTitle || !modalDesc || !modalPrice || !modalAddBtn) return;

    modalImg.src = dish.imagen;
    modalImg.alt = dish.nombre;

    modalTitle.textContent = dish.nombre;
    modalDesc.textContent  = dish.descripcion || "Descripción no disponible.";

    // Ajustar la descripción al idioma actual (si la página está en inglés, etc.)
    traducirDescripcionModalSiHaceFalta();

    const precioNum = Number(dish.precio) || 0;
    modalPrice.textContent = `$${precioNum.toFixed(2)}`;

    modalAddBtn.dataset.name  = dish.nombre;
    modalAddBtn.dataset.price = String(precioNum);

    modal.classList.add("active");
  };

  // Mapeo para ordenar y mostrar bonito el nombre de la categoría
  const CATEGORY_ORDER = [
    "entradas",
    "tacos",
    "parrilladas",
    "carnes",
    "mariscos",
    "burgers",
    "antojitos",
    "guarniciones",
    "ensaladas",
    "sopas",
    "infantil",
    "postres",
    "bebidas",
    "cervezas",
    "cocteles",
    "vinos",
    "especialidades",
    "otros"
  ];

  const CATEGORY_LABELS = {
    entradas: "Entradas",
    tacos: "Tacos",
    parrilladas: "Parrilladas",
    carnes: "Carnes",
    mariscos: "Mariscos",
    burgers: "Hamburguesas",
    antojitos: "Antojitos",
    guarniciones: "Guarniciones",
    ensaladas: "Ensaladas",
    sopas: "Sopas",
    infantil: "Infantil",
    postres: "Postres",
    bebidas: "Bebidas",
    cervezas: "Cervezas",
    cocteles: "Cocteles",
    vinos: "Vinos",
    especialidades: "Especialidades",
    otros: "Otros"
  };

  const normalizarCategoria = (cat) => {
    if (!cat) return "otros";
    const c = cat.toString().trim().toLowerCase();
    return CATEGORY_ORDER.includes(c) ? c : c || "otros";
  };

  // Crea una tarjeta .menu-card a partir de un platillo
  const crearCardPlatillo = (dish) => {
    const card = document.createElement("div");
    card.classList.add("menu-card");

    const precioNum        = Number(dish.precio) || 0;
    const precioFormateado = `$${precioNum.toFixed(2)}`;

    const catKey   = normalizarCategoria(dish.categoria);
    const catLabel = CATEGORY_LABELS[catKey] || (dish.categoria || "Otros");

    // data-* usados por otros scripts (orderDetails, filtros, etc.)
    card.setAttribute("data-name", dish.nombre);
    card.setAttribute("data-price", String(precioNum));
    card.setAttribute("data-desc", dish.descripcion || "");
    card.setAttribute("data-category", catKey);

    card.innerHTML = `
      <img src="${dish.imagen}" alt="${dish.nombre}">
      <div class="menu-card-body">
        <div class="menu-card-header">
          <h3 class="menu-card-title">${dish.nombre}</h3>
          <span class="menu-card-price">${precioFormateado}</span>
        </div>
        <p class="menu-card-meta">${catLabel}</p>
        <button class="add-btn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5h2v14h-2z"></path>
            <path d="M5 11h14v2H5z"></path>
          </svg>
          Agregar
        </button>
      </div>
    `;

    // Badge "Detalles"
    const badge = document.createElement("div");
    badge.className = "details-badge";
    badge.innerHTML = '<i class="fas fa-info-circle"></i><span>Detalles</span>';
    card.appendChild(badge);

    // Cinta "Haz clic para ver detalles"
    const cta = document.createElement("div");
    cta.className = "img-cta";
    cta.innerHTML = "<span>Haz clic para ver detalles</span>";
    card.appendChild(cta);

    // Abrir modal al hacer clic en la imagen
    const img = card.querySelector("img");
    if (img) {
      img.style.cursor = "pointer";
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      img.setAttribute("aria-label", `Ver detalles de ${dish.nombre}`);

      img.addEventListener("click", () => abrirModalProducto(dish));

      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrirModalProducto(dish);
        }
      });
    }

    return card;
  };

  try {
    const res    = await fetch("/api/dishes");
    const dishes = await res.json();

    if (!Array.isArray(dishes)) throw new Error("Respuesta inválida de /api/dishes");

    if (!container) return;

    container.innerHTML = "";

    // 1) Agrupar platillos por categoría
    const grupos = new Map();
    dishes.forEach((dish) => {
      const catKey = normalizarCategoria(dish.categoria);
      if (!grupos.has(catKey)) grupos.set(catKey, [];
      grupos.get(catKey).push(dish);
    });

    // 2) Ordenar categorías según CATEGORY_ORDER
    const categoriasOrdenadas = [...grupos.keys()].sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a);
      const ib = CATEGORY_ORDER.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    // 3) Crear bloques por categoría dentro de #menuGrid
    categoriasOrdenadas.forEach((catKey) => {
      const platos = grupos.get(catKey);
      if (!platos || !platos.length) return;

      const section = document.createElement("section");
      section.className = "menu-category-block";
      section.dataset.category = catKey;

      const h3 = document.createElement("h3");
      h3.className = "menu-category-title";
      h3.textContent = CATEGORY_LABELS[catKey] || catKey;
      section.appendChild(h3);

      const grid = document.createElement("div");
      grid.className = "menu-category-grid";
      section.appendChild(grid);

      platos.forEach((dish) => {
        const card = crearCardPlatillo(dish);
        grid.appendChild(card);
      });

      container.appendChild(section);
    });

    // Avisar (por si en el futuro quieres enganchar filtros cuando ya haya tarjetas)
    document.dispatchEvent(new CustomEvent("dishesLoaded"));

  } catch (err) {
    console.error("Error al cargar los platillos:", err);
    if (container) {
      container.innerHTML = "<p>Error al cargar el menú.</p>";
    }
  }
});
