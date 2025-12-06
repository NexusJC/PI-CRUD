/* ==========================================================
   VARIABLES PRINCIPALES
========================================================== */
const form = document.getElementById('dish-form');
const tableBody = document.querySelector('#dishes-table tbody');

const CLOUD_NAME = "dwwaxrr6r";
const UPLOAD_PRESET = "unsigned_preset";

const openDishModal = document.getElementById("openDishModal");
const closeDishModal = document.getElementById("closeDishModal");
const dishModal = document.getElementById("dishModal");
const dishOverlay = document.getElementById("dishOverlay");

const fileInput = document.getElementById("dishImage");
const fileText  = document.getElementById("dishFileText");

let editingDishId = null;
let editingDishImageUrl = null;

/* ==========================================================
   PREVISUALIZACIÓN DE NOMBRE DE ARCHIVO
========================================================== */
if (fileInput && fileText) {
  fileInput.addEventListener("change", () => {
    fileText.textContent = fileInput.files?.[0]?.name || "Haz clic para subir imagen";
  });
}


/* ==========================================================
   FUNCIONES PARA MOSTRAR Y OCULTAR MODAL
========================================================== */
function openModal(isEditing = false) {
  dishModal.style.display = "block";
  dishOverlay.style.display = "block";

  document.querySelector(".dish-modal-title").textContent = isEditing
    ? "Editar platillo"
    : "Agregar nuevo platillo";

  document.querySelector(".dish-submit-btn").innerHTML = isEditing
    ? `<i class="fa-solid fa-check"></i> Guardar cambios`
    : `<i class="fa-solid fa-check"></i> Agregar platillo`;
}
function closeModal() {
  dishModal.style.display = "none";
  dishOverlay.style.display = "none";
  form.reset();
  fileText.textContent = "Haz clic para subir imagen";
  editingDishId = null;
  editingDishImageUrl = null; // 👈 importante
}


// Abrir modal (modo crear)
openDishModal.addEventListener("click", () => openModal(false));

// Cerrar modal
closeDishModal.addEventListener("click", closeModal);
dishOverlay.addEventListener("click", closeModal);


/* ==========================================================
   SUBIDA DE IMAGEN A CLOUDINARY
========================================================== */
async function uploadImageToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd
  });

  if (!res.ok) throw new Error("Error al subir la imagen");

  const data = await res.json();
  return data.secure_url;
}


/* ==========================================================
   GUARDAR / EDITAR PLATILLO
========================================================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre      = form.nombre.value.trim();
  const descripcion = form.descripcion.value.trim();
  const precio      = form.precio.value;
  const categoria   = form.categoria.value;
  const file        = fileInput.files[0];

  let imageUrl = null;

  try {
    // Si hay archivo nuevo → subirlo
    if (file) {
      imageUrl = await uploadImageToCloudinary(file);
    }

    const body = {
      nombre,
      descripcion,
      precio,
      categoria,
    };

    // Si estamos editando, usamos la imagen nueva o la anterior
    if (editingDishId) {
      body.imagen = imageUrl || editingDishImageUrl;
    } else {
      // Modo crear: es obligatorio subir imagen
      if (!imageUrl) {
        alert("Selecciona una imagen.");
        return;
      }
      body.imagen = imageUrl;
    }

    const url    = editingDishId ? `/api/dishes/${editingDishId}` : `/api/dishes`;
    const method = editingDishId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
      alert(editingDishId ? "Platillo actualizado" : "Platillo agregado");
      closeModal();
      loadDishes();
    } else {
      alert(result.message || "Error al guardar");
    }

  } catch (err) {
    console.error(err);
    alert("Error en el proceso");
  }
});


/* ==========================================================
   CARGAR PLATILLOS EN TABLA
========================================================== */
async function loadDishes() {
  tableBody.innerHTML = "";

  try {
    const res = await fetch("/api/dishes");
    const dishes = await res.json();

    dishes.forEach(dish => {
      const precioNum = Number(dish.precio || 0);

const row = document.createElement("tr");
row.innerHTML = `
  <td>${dish.id}</td>

  <td>
    <div class="table-img-wrapper">
      <img src="${dish.imagen}" alt="${dish.nombre}">
    </div>
  </td>

  <td class="table-name">${dish.nombre}</td>

  <td><span class="badge badge-category">${dish.categoria}</span></td>

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

    // Eventos de acciones
    attachDeleteEvents();
    attachEditEvents();

  } catch (err) {
    console.error(err);
  tableBody.innerHTML = "<tr><td colspan='6'>Error al cargar platillos</td></tr>";
  }
}


/* ==========================================================
   ELIMINAR PLATILLO
========================================================== */
function attachDeleteEvents() {
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("¿Eliminar platillo?")) return;

      try {
        const res = await fetch(`/api/dishes/${id}`, { method: "DELETE" });
        const result = await res.json();

        if (res.ok) {
          alert("Platillo eliminado");
          loadDishes();
        } else {
          alert(result.message || "Error al eliminar");
        }

      } catch (err) {
        console.error(err);
        alert("Error eliminando platillo");
      }
    });
  });
}


/* ==========================================================
   EDITAR PLATILLO
========================================================== */
function attachEditEvents() {
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      editingDishId = id;

      try {
        const res = await fetch(`/api/dishes/${id}`);
        const dish = await res.json();

        if (!res.ok) return alert("Error al obtener datos");

        // Rellenar modal
// Rellenar modal
form.nombre.value      = dish.nombre;
form.descripcion.value = dish.descripcion;
form.precio.value      = dish.precio;
form.categoria.value   = dish.categoria;

// Guardar imagen actual para usarla si no se cambia
editingDishImageUrl = dish.imagen || null;

fileText.textContent = "Selecciona una imagen solo si deseas cambiarla";

openModal(true);
      } catch (err) {
        console.error(err);
        alert("Error cargando platillo");
      }
    });
  });
}


/* ==========================================================
   Cargar al iniciar
========================================================== */
loadDishes();
