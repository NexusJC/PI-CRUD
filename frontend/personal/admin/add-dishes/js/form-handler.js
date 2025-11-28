const form = document.getElementById('dish-form');
const tableBody = document.querySelector('#dishes-table tbody');

// Cargar platillos al iniciar
window.addEventListener('DOMContentLoaded', loadDishes);

//  Agregar platillo
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/dishes', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message || 'Dish added successfully!');
      form.reset();
      loadDishes();
    } else {
      alert(result.message || 'Failed to add dish.');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred while adding the dish.');
  }
});

//  Función para cargar todos los platillos
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
        <td><img src="${dish.imagen}" alt="${dish.nombre}" width="60" /></td>
        <td><button class="delete-btn" data-id="${dish.id}"> Eliminar</button></td>
      `;

      tableBody.appendChild(row);
    });

    // Delegación de evento: Eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Eliminar este platillo?')) {
          await deleteDish(id);
        }
      });
    });

  } catch (err) {
    console.error('Error al cargar platillos:', err);
    tableBody.innerHTML = '<tr><td colspan="6">Error al cargar datos.</td></tr>';
  }
}

//  Función para eliminar platillo
async function deleteDish(id) {
  try {
    const res = await fetch(`/api/dishes/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (res.ok) {
      alert(result.message || 'Platillo eliminado');
      loadDishes();
    } else {
      alert(result.message || 'No se pudo eliminar');
    }
  } catch (err) {
    console.error('Error eliminando:', err);
    alert('Error al eliminar');
  }
}

// =========================
// SESIÓN / LOGOUT (MISMO QUE EN INDEX)
// =========================

/*
function getLoginUrl() {
    const isLocal =
        location.hostname === "127.0.0.1" ||
        location.hostname === "localhost";

    if (isLocal) {
        return "../../../login/login.html";
    }

    return "/login/login.html";
}
*/
const logoutBtn = document.getElementById("logoutBtn");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg = document.getElementById("sidebarUserImg");

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!token || !user || user.role !== "admin") {
    window.location.href = getLoginUrl();
}

if (user && sidebarUserName) {
    sidebarUserName.textContent = user.name || "Usuario";
    if (user.profile_picture) {
        sidebarUserImg.src = "/uploads/" + user.profile_picture;
    }
}

logoutBtn?.addEventListener("click", () => {
    const confirmar = confirm("¿Seguro que quieres cerrar sesión?");
    if (!confirmar) return;

    localStorage.clear();
    window.location.href = getLoginUrl();
});

