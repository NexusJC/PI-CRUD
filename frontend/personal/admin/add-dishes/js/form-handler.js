const form = document.getElementById('dish-form');
const tableBody = document.querySelector('#dishes-table tbody');
const CLOUD_NAME = "dwwaxrr6r";
const UPLOAD_PRESET = "unsigned_preset";
const openDishModal = document.getElementById("openDishModal");
const closeDishModal = document.getElementById("closeDishModal");
const dishModal = document.getElementById("dishModal");
const dishOverlay = document.getElementById("dishOverlay");

// ABRIR MODAL
openDishModal.addEventListener("click", () => {
  dishModal.style.display = "block";
  dishOverlay.style.display = "block";
});

// CERRAR MODAL
closeDishModal.addEventListener("click", () => {
  dishModal.style.display = "none";
  dishOverlay.style.display = "none";
});

// CERRAR SI HACEN CLICK FUERA
dishOverlay.addEventListener("click", () => {
  dishModal.style.display = "none";
  dishOverlay.style.display = "none";
});

// SUBIR IMAGEN A CLOUDINARY
async function uploadImageToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Error al subir la imagen");
  }

  const data = await res.json();
  return data.secure_url; 
}

// AGREGAR PLATILLO
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const descripcion = form.descripcion.value.trim();
  const precio = form.precio.value;
  const categoria = form.categoria.value.trim();
  const file = form.imagen.files[0];

  if (!file) {
    alert("Selecciona una imagen.");
    return;
  }

  try {
    // 1) Subir imagen a Cloudinary
    const imageUrl = await uploadImageToCloudinary(file);

    // 2) Enviar datos a tu backend (SOLO JSON)
    const body = {
      nombre,
      descripcion,
      precio,
      categoria,
      imagen: imageUrl
    };

    const res = await fetch('/api/dishes', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
      alert("Platillo agregado correctamente");
      form.reset();
      loadDishes();
    } else {
      alert(result.message || "Error al agregar platillo");
    }

  } catch (err) {
    console.error(err);
    alert("Error al agregar platillo");
  }
});

// CARGAR PLATILLOS
async function loadDishes() {
  tableBody.innerHTML = '';
  try {
    const res = await fetch('/api/dishes');
    const dishes = await res.json();

    dishes.forEach(dish => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${dish.id}</td>
        <td>${dish.nombre}</td>
        <td>$${dish.precio}</td>
        <td>${dish.categoria}</td>
        <td><img src="${dish.imagen}" width="60"></td>
        <td><button class="delete-btn" data-id="${dish.id}">Eliminar</button></td>
      `;

      tableBody.appendChild(row);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm("¿Eliminar?")) {
          await deleteDish(id);
        }
      });
    });

  } catch (err) {
    console.error("Error al cargar platillos:", err);
    tableBody.innerHTML = "<tr><td colspan='6'>Error al cargar platillos</td></tr>";
  }
}
// ELIMINAR PLATILLO
async function deleteDish(id) {
  try {
    const res = await fetch(`/api/dishes/${id}`, {
      method: "DELETE"
    });

    const result = await res.json();

    if (res.ok) {
      alert("Platillo eliminado");
      loadDishes();
    } else {
      alert("No se pudo eliminar");
    }

  } catch (err) {
    console.error(err);
    alert("Error eliminando platillo");
  }
}
