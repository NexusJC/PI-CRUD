/* ============================================================
   MODO OSCURO PARA EMPLOYEES (TOTALMENTE SEPARADO)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggleBtn = document.getElementById("adminThemeToggle");
    const sidebar = document.getElementById("adminSidebar");

    /* ============================
       1. Cargar estado desde LocalStorage
       ============================ */
    const temaGuardado = localStorage.getItem("adminTheme");

    if (temaGuardado === "dark") {
        body.classList.add("admin-dark");
        sidebar.classList.add("admin-dark");
        toggleBtn.innerHTML = `<i class="bx bx-sun"></i><span>Modo claro</span>`;
    } else {
        toggleBtn.innerHTML = `<i class="bx bx-moon"></i><span>Modo oscuro</span>`;
    }

    /* ============================
       2. Alternar modo oscuro
       ============================ */
    toggleBtn.addEventListener("click", () => {
        const oscuro = body.classList.toggle("admin-dark");
        sidebar.classList.toggle("admin-dark");

        if (oscuro) {
            toggleBtn.innerHTML = `<i class="bx bx-sun"></i><span>Modo claro</span>`;
            localStorage.setItem("adminTheme", "dark");
        } else {
            toggleBtn.innerHTML = `<i class="bx bx-moon"></i><span>Modo oscuro</span>`;
            localStorage.setItem("adminTheme", "light");
        }
    });

    /* ============================
       3. Sidebar colapsado mantiene apariencia
       ============================ */
    const sidebarToggle = document.querySelector(".top-menu .toggle");

    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");

        // Garantizar que modo oscuro siga aplicándose
        if (body.classList.contains("admin-dark")) {
            sidebar.classList.add("admin-dark");
        }
    });
});
