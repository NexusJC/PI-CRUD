// ==== PERFIL.JS ====
document.addEventListener("DOMContentLoaded", () => {
  console.debug("[perfil.js] DOM listo");

  // ===== Imagen de perfil =====
  document.addEventListener("click", (e) => {
    const btnImg = e.target.closest("#btnEditarImg");
    if (btnImg) {
      e.preventDefault();
      const inputImg = document.getElementById("inputImg");
      if (!inputImg) return console.warn("No se encontró #inputImg");
      inputImg.click();
    }
  });

  const inputImg = document.getElementById("inputImg");
  const perfilImg = document.getElementById("perfilImg");
  if (inputImg && perfilImg) {
    inputImg.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { perfilImg.src = ev.target.result; };
      reader.readAsDataURL(file);
    });
  }

  // ===== Nombre: texto -> input -> texto =====
  function activarEdicionNombre() {
    const span = document.getElementById("perfilNombreText");
    if (!span) return console.warn("No se encontró #perfilNombreText");

    const valor = span.textContent.trim();
    const input = document.createElement("input");
    input.type = "text";
    input.value = valor;
    input.className = "input-dinamico";

    span.replaceWith(input);
    input.focus();
    input.select();

    const guardar = () => {
      const nuevo = input.value.trim() || "Sin nombre";
      const nuevoSpan = document.createElement("span");
      nuevoSpan.id = "perfilNombreText";
      nuevoSpan.textContent = nuevo;
      input.replaceWith(nuevoSpan);
      console.debug("[perfil.js] nombre guardado:", nuevo);
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") guardar();
      if (e.key === "Escape") input.blur();
    });

    input.addEventListener("blur", guardar);
  }

  // Delegación para botón de nombre
  document.addEventListener("click", (e) => {
    const btnNombre = e.target.closest("#btnEditarNombre");
    if (btnNombre) {
      e.preventDefault();
      activarEdicionNombre();
    }
  });

  console.debug("[perfil.js] handlers listos");
});
