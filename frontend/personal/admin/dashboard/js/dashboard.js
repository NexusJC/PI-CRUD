// ===============================================
// PROTECCIÓN CONTRA BACK NAVIGATION (bfcache)
// ===============================================
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        // La página está siendo restaurada desde caché
        localStorage.clear();
        window.location.replace("/login/login.html");
    }
});

// ===============================================
// VALIDACIÓN DE SESIÓN AL CARGAR
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || user.role !== "admin") {
        window.location.replace("/login/login.html");
        return;
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".menu-dashboard");
    const toggle = document.querySelector(".toggle");
    const toggleIcon = toggle ? toggle.querySelector("i") : null;

    if (!sidebar) {
        console.error("❌ No se encontró .menu-dashboard");
        return;
    }

    if (!toggle) {
        console.error("❌ No se encontró .toggle");
        return;
    }

    // === Toggle del sidebar ===
    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");

        if (toggleIcon) {
            if (sidebar.classList.contains("open")) {
                toggleIcon.classList.remove("bx-menu");
                toggleIcon.classList.add("bx-x");
            } else {
                toggleIcon.classList.remove("bx-x");
                toggleIcon.classList.add("bx-menu");
            }
        }
    });

    // === Abrir sidebar al navegar entre enlaces ===
    const links = document.querySelectorAll(".menu .enlace");
    links.forEach(link => {
        link.addEventListener("click", () => {
            sidebar.classList.add("open");
            if (toggleIcon) {
                toggleIcon.classList.remove("bx-menu");
                toggleIcon.classList.add("bx-x");
            }
        });
    });
});

// =========================
// SESIÓN / LOGOUT (MISMO QUE EN INDEX)
// =========================
function getLoginUrl() {
    const isLocal =
        location.hostname === "127.0.0.1" ||
        location.hostname === "localhost";

    if (isLocal) {
        return "../../../login/login.html";
    }

    return "/login/login.html";
}

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

// =========================================================
// GRÁFICA REAL: Platillos más vendidos
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {
    const ctxTop = document.getElementById("chartTopDishes");

    if (!ctxTop) return;

    try {
        // Llamar al backend
        const res = await fetch("/api/dashboard/top-dishes");
        const data = await res.json();

        console.log("Top dishes:", data);

        // Preparar datos para Chart.js
        if (!Array.isArray(data)) {
        console.error("❌ La API no devolvió un arreglo:", data);
        return; // Evita que truene el dashboard
        }

        const labels = data.map(item => item.dish);
        const values = data.map(item => item.total_sold);


        // Crear gráfica
        new Chart(ctxTop, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Ventas",
                    data: values,
                    backgroundColor: "rgba(227, 104, 66, 0.75)", // Color naranja del dashboard
                    borderRadius: 10,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }},
                scales: {
                    x: { ticks: { color: "#2b2b2b" }},
                    y: { beginAtZero: true }
                }
            }
        });

    } catch (err) {
        console.error("Error al generar gráfica de top dishes:", err);
    }
});
//  AUTO-REFRESH CADA 2 SEGUNDOS
setInterval(async () => {
    const pedidoAnterior = pedidoActivo;
    await cargarPedidos();

    if (pedidoAnterior && pedidosData[pedidoAnterior]) {
        seleccionarPedido(pedidoAnterior);
    }
}, 2000); 