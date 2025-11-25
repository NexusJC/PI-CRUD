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
