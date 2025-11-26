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
