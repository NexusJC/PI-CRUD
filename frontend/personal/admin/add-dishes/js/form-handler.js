/* ==========================================================
   VARIABLES PRINCIPALES
========================================================== */
const form = document.getElementById("dish-form");
const tableBody = document.querySelector("#dishes-table tbody");

const CLOUD_NAME = "dwwaxrr6r";
const UPLOAD_PRESET = "unsigned_preset";

const openDishModal = document.getElementById("openDishModal");
const closeDishModal = document.getElementById("closeDishModal");
const dishModal = document.getElementById("dishModal");
const dishOverlay = document.getElementById("dishOverlay");

const fileInput = document.getElementById("dishImage");
const fileText  = document.getElementById("dishFileText");

// 🔹 Input de precio
const priceInput = document.getElementById("dishPrice");

// 🔹 NUEVO: elementos para FILTRO
const filterToggleBtn  = document.getElementById("filterToggleBtn");
const filterDropdown   = document.getElementById("filterDropdown");

// Estado de edición
let editingDishId = null;          // id del platillo que se está editando
let editingDishImageUrl = null;    // url de la imagen actual del platillo

// Cache local de platillos (id -> objeto platillo)
const dishesMap = new Map();

// 🔹 NUEVO: lista completa de platillos y filtro actual
let dishesList = [];
let currentFilter = "__all"; // "__all" = todas las categorías

/* ==========================================================
   PREVISUALIZACIÓN DE NOMBRE DE ARCHIVO
========================================================== */
if (fileInput && fileText) {
  fileInput.addEventListener("change", () => {
    fileText.textContent =
      fileInput.files?.[0]?.name || "Haz clic para subir imagen";
  });
}

/* ==========================================================
   RESTRICCIONES DE PRECIO
   - No negativos
   - No 0
   - Máx 4 dígitos en la parte entera
========================================================== */
if (priceInput) {
  priceInput.addEventListener("input", () => {
    let value = priceInput.value;

    // Quitar todo lo que no sea número o punto
    value = value.replace(/[^0-9.]/g, "");

    // Evitar más de un punto decimal
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    // Limitar la parte entera a 4 dígitos
    const [intPart, decPart] = value.split(".");
    let newInt = intPart || "";
    if (newInt.length > 4) {
      newInt = newInt.slice(0, 4);
    }

    // Reconstruir el valor
    value = decPart !== undefined ? `${newInt}.${decPart}` : newInt;

    // Evitar que el valor sea 0 exacto
    if (value === "0" || value === "0." || value === "00") {
      value = "";
    }

    priceInput.value = value;
  });
}

/* ==========================================================
   FUNCIONES PARA MOSTRAR Y OCULTAR MODAL
========================================================== */
function openModal(isEditing = false) {
  if (!dishModal || !dishOverlay) return;

  dishModal.style.display = "block";
  dishOverlay.style.display = "block";

  const titleEl  = document.querySelector(".dish-modal-title");
  const submitBtn = document.querySelector(".dish-submit-btn");

  if (titleEl) {
    titleEl.textContent = isEditing ? "Editar platillo" : "Agregar nuevo platillo";
  }

  if (submitBtn) {
    submitBtn.innerHTML = isEditing
      ? `<i class="fa-solid fa-check"></i> Guardar cambios`
      : `<i class="fa-solid fa-check"></i> Guardar platillo`;
  }
}

function closeModal() {
  if (!dishModal || !dishOverlay || !form) return;

  dishModal.style.display = "none";
  dishOverlay.style.display = "none";

  form.reset();
  if (fileText) fileText.textContent = "Haz clic para subir imagen";
  if (fileInput) fileInput.value = "";

  editingDishId = null;
  editingDishImageUrl = null;
}

// Abrir modal (modo crear)
if (openDishModal) {
  openDishModal.addEventListener("click", () => openModal(false));
}

// Cerrar modal
if (closeDishModal) closeDishModal.addEventListener("click", closeModal);
if (dishOverlay)    dishOverlay.addEventListener("click", closeModal);

/* ==========================================================
   SUBIDA DE IMAGEN A CLOUDINARY
========================================================== */
async function uploadImageToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: fd,
    }
  );

  if (!res.ok) throw new Error("Error al subir la imagen");

  const data = await res.json();
  return data.secure_url;
}

/* ==========================================================
   GUARDAR / EDITAR PLATILLO (SUBMIT DEL FORM)
========================================================== */
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre      = form.nombre.value.trim();
    const descripcion = form.descripcion.value.trim();
    const precio      = form.precio.value;     // string como viene del input
    const categoria   = form.categoria.value;
    const file        = fileInput.files[0];

    // Validaciones de precio
    const precioNum = Number(precio);

    if (!precio || isNaN(precioNum)) {
      alert("Ingresa un precio válido.");
      return;
    }

    if (precioNum <= 0) {
      alert("El precio debe ser mayor que 0.");
      return;
    }

    if (precioNum > 9999) {
      alert("El precio no puede tener más de 4 dígitos (máx. 9999).");
      return;
    }

    let imageUrl = null;

    try {
      // Si el usuario sube una imagen nueva → la subimos
      if (file) {
        imageUrl = await uploadImageToCloudinary(file);
      }

      const body = {
        nombre,
        descripcion,
        precio: precioNum,
        categoria,
      };

      // =============== MODO EDITAR ===============
      if (editingDishId) {
        // si no se sube nueva, usamos la que ya tenía
        body.imagen = imageUrl || editingDishImageUrl;

        const res = await fetch(`/api/dishes/${editingDishId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        let result = {};
        try {
          result = await res.json();
        } catch (_) {}

        if (!res.ok) {
          console.error("Error PUT /api/dishes/:id →",
            res.status, res.statusText, result);
          alert(result.message || "Error al actualizar platillo");
          return;
        }

        alert("Platillo actualizado correctamente");
      } else {
        // =============== MODO CREAR ===============
        if (!imageUrl) {
          alert("Selecciona una imagen para el platillo.");
          return;
        }
        body.imagen = imageUrl;

        const res = await fetch("/api/dishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        let result = {};
        try {
          result = await res.json();
        } catch (_) {}

        if (!res.ok) {
          console.error("Error POST /api/dishes →",
            res.status, res.statusText, result);
          alert(result.message || "Error al agregar platillo");
          return;
        }

        alert("Platillo agregado correctamente");
      }

      closeModal();
      await loadDishes();
    } catch (err) {
      console.error("Excepción al guardar platillo:", err);
      alert("Ocurrió un error al guardar el platillo");
    }
  });
}

/* ==========================================================
   🔸 RENDER TABLA (con filtro aplicado)
========================================================== */
function renderDishesTable() {
  if (!tableBody) return;

  tableBody.innerHTML = "";
  dishesMap.clear();

  // Aplicar filtro
  const filtered = currentFilter === "__all"
    ? dishesList
    : dishesList.filter((dish) => String(dish.categoria) === String(currentFilter));

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:14px;">
          No hay platillos para la categoría seleccionada.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach((dish) => {
    const precioNum = Number(dish.precio || 0);
    const idKey = String(dish.id);

    // guardamos el platillo en cache (para edición)
    dishesMap.set(idKey, dish);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${dish.id}</td>

      <td>
        <div class="table-img-wrapper">
          <img src="${dish.imagen}" alt="${dish.nombre}">
        </div>
      </td>

      <td class="table-name">${dish.nombre}</td>

      <td>
        <span class="badge badge-category">${dish.categoria}</span>
      </td>

      <td class="table-price">$${precioNum.toFixed(2)}</td>

      <td class="table-actions">
        <button class="btn-icon btn-edit" data-id="${dish.id}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-delete" data-id="${dish.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachDeleteEvents();
  attachEditEvents();
}

/* ==========================================================
   🔸 CONSTRUIR OPCIONES DEL FILTRO (dropdown)
========================================================== */
function buildCategoryFilterOptions() {
  if (!filterDropdown) return;

  filterDropdown.innerHTML = "";

  // Obtener categorías únicas desde los platillos cargados
  const categoriesSet = new Set();
  dishesList.forEach((dish) => {
    if (dish.categoria) {
      categoriesSet.add(String(dish.categoria));
    }
  });

  // Opción "todas"
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "filter-option";
  allBtn.dataset.category = "__all";
  allBtn.textContent = "Todas las categorías";
  if (currentFilter === "__all") {
    allBtn.classList.add("active");
  }
  filterDropdown.appendChild(allBtn);

  // Una opción por categoría
  categoriesSet.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-option";
    btn.dataset.category = cat;
    // Capitalizar un poco visualmente
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.textContent = label;

    if (currentFilter === cat) {
      btn.classList.add("active");
    }

    filterDropdown.appendChild(btn);
  });
}

/* ==========================================================
   CARGAR PLATILLOS DESDE BACKEND
========================================================== */
async function loadDishes() {
  if (!tableBody) return;

  tableBody.innerHTML = "";
  dishesMap.clear();
  dishesList = [];

  try {
    const res = await fetch("/api/dishes");
    if (!res.ok) {
      console.error("Error GET /api/dishes →", res.status, res.statusText);
      tableBody.innerHTML =
        "<tr><td colspan='6'>Error al cargar platillos</td></tr>";
      return;
    }

    const dishes = await res.json();

    if (!Array.isArray(dishes)) {
      console.error("Respuesta inesperada en /api/dishes:", dishes);
      tableBody.innerHTML =
        "<tr><td colspan='6'>Error: respuesta inesperada del servidor</td></tr>";
      return;
    }

    // Guardamos lista completa
    dishesList = dishes;

    // Construimos las opciones de filtro en base a los datos
    buildCategoryFilterOptions();

    // Renderizamos tabla con el filtro actual
    renderDishesTable();

  } catch (err) {
    console.error("Error cargando platillos:", err);
    tableBody.innerHTML =
      "<tr><td colspan='6'>Error al cargar platillos</td></tr>";
  }
}

/* ==========================================================
   ELIMINAR PLATILLO
========================================================== */
function attachDeleteEvents() {
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!id) return;

      if (!confirm("¿Eliminar platillo?")) return;

      try {
        const res = await fetch(`/api/dishes/${id}`, { method: "DELETE" });
        let result = {};
        try {
          result = await res.json();
        } catch (_) {}

        if (!res.ok) {
          console.error("Error DELETE /api/dishes/:id →",
            res.status, res.statusText, result);
          alert(result.message || "Error al eliminar platillo");
          return;
        }

        alert("Platillo eliminado");

        // Recargamos todo para actualizar lista + filtro
        await loadDishes();
      } catch (err) {
        console.error("Excepción al eliminar platillo:", err);
        alert("Ocurrió un error al eliminar el platillo");
      }
    };
  });
}

/* ==========================================================
   EDITAR PLATILLO (ABRIR MODAL YA RELLENO)
========================================================== */
function attachEditEvents() {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (!id) return;

      const dish = dishesMap.get(String(id));
      if (!dish) {
        alert("No se encontraron los datos del platillo");
        return;
      }

      // Guardar id que se está editando
      editingDishId = id;
      editingDishImageUrl = dish.imagen || null;

      // Rellenar el formulario con los datos actuales
      form.nombre.value      = dish.nombre || "";
      form.descripcion.value = dish.descripcion || "";
      form.precio.value      = dish.precio || "";
      form.categoria.value   = dish.categoria || "";

      // Limpiar input de archivo (para que pueda subir una nueva si quiere)
      if (fileInput) fileInput.value = "";
      if (fileText)
        fileText.textContent =
          "Selecciona una imagen solo si deseas cambiarla";

      // Abrir modal en modo edición
      openModal(true);
    };
  });
}

/* ==========================================================
   🔸 EVENTOS DEL BOTÓN FILTRO
========================================================== */
if (filterToggleBtn && filterDropdown) {
  // Abrir / cerrar dropdown
  filterToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle("open");
  });

  // Cerrar si haces click fuera
  document.addEventListener("click", (e) => {
    if (!filterDropdown.contains(e.target) && !filterToggleBtn.contains(e.target)) {
      filterDropdown.classList.remove("open");
    }
  });

  // Click en una opción de filtro
  filterDropdown.addEventListener("click", (e) => {
    const optionBtn = e.target.closest(".filter-option");
    if (!optionBtn) return;

    const category = optionBtn.dataset.category || "__all";
    currentFilter = category;

    // Marcar activa visualmente
    filterDropdown.querySelectorAll(".filter-option").forEach((btn) => {
      btn.classList.toggle("active", btn === optionBtn);
    });

    // Volver a pintar la tabla con el filtro elegido
    renderDishesTable();

    // Cerrar dropdown
    filterDropdown.classList.remove("open");
  });
}

/* ==========================================================
   CARGAR AL INICIAR
========================================================== */
loadDishes();
