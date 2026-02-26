// =====================================================================
// TRADUCTOR PARA PESTAÑA DE EMPLEADOS (USA GOOGLE TRANSLATE API)
// =====================================================================

// Usa la MISMA API_KEY que tu translate.js general
const API_KEY = "AIzaSyBiGgFnc2QGkD5V51p45TTM9sPLHqUZn58";

// Idioma actual de la página (es / en)
let currentLanguage = "es";

// Etiquetas que vamos a mandar a traducir
const translatableElements = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "span",
  "li",
  "strong",
  "button",
];

/**
 * Recorre el DOM y devuelve un objeto con:
 *  id -> { element, text }
 */
function getTranslatableContent() {
  const elements = {};

  translatableElements.forEach((tag) => {
    document.querySelectorAll(tag).forEach((el, i) => {
      if (
        el.innerText &&
        el.innerText.trim() &&
        !el.hasAttribute("data-no-translate")
      ) {
        const id = `${tag}-${i}`;
        elements[id] = {
          element: el,
          text: el.innerText,
        };
      }
    });
  });

  return elements;
}

function decodeHTMLEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Fallback MUY simple para textos dinámicos generados por JS.
 * Si no quieres reemplazos extra, solo devuelve el texto tal cual.
 */
function fallbackTranslate(text, targetLanguage) {
  if (!text) return text;
  // Aquí podrías meter algunos reemplazos manuales si quieres.
  return text;
}

/**
 * Función principal que traduce todo el contenido de la página.
 * targetLanguage: "en" o "es"
 */
async function translateContent(targetLanguage) {
  if (currentLanguage === targetLanguage) return;

  const elements = getTranslatableContent();
  const textsToTranslate = Object.values(elements).map((item) => item.text);

  // Si no hay nada que traducir, solo actualizamos estado
  if (!textsToTranslate.length) {
    currentLanguage = targetLanguage;
    localStorage.setItem("preferredLanguage", targetLanguage);
    document.documentElement.lang = targetLanguage;
    actualizarTextoBotonIdioma(targetLanguage);
    return;
  }

  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: textsToTranslate,
        target: targetLanguage,
        source: currentLanguage,
      }),
    });

    const data = await response.json();

    if (data.data && data.data.translations) {
      Object.keys(elements).forEach((id, index) => {
        const translatedText = decodeHTMLEntities(
          data.data.translations[index].translatedText
        );
        elements[id].element.textContent = translatedText;
      });
    }

    // Segunda pasada SUAVE para nodos que se agregan o que Google no tradujo bien
    document.querySelectorAll("*").forEach((el) => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        const original = el.innerText.trim();
        const fixed = fallbackTranslate(original, targetLanguage);
        if (fixed !== original) el.innerText = fixed;
      }
    });

    currentLanguage = targetLanguage;
    document.documentElement.lang = targetLanguage;
    localStorage.setItem("preferredLanguage", targetLanguage);

    actualizarTextoBotonIdioma(targetLanguage);
  } catch (error) {
    console.error("Error al traducir el contenido:", error);
  }
}

/**
 * Actualiza el texto del botón de idioma (English / Español)
 */
function actualizarTextoBotonIdioma(idiomaActual) {
  const banderaBtn = document.querySelector("#banderaIdioma .bandera-container");
  if (!banderaBtn) return;

  banderaBtn.setAttribute(
    "data-idioma-text",
    idiomaActual === "es" ? "English" : "Español"
  );
}

/**
 * Alterna entre español e inglés al hacer click en el botón del sidebar.
 */
function alternarIdioma() {
  const bandera = document.getElementById("banderaIdioma");
  if (!bandera) return;

  const idiomaActual = bandera.getAttribute("data-idioma") || "es";
  const nuevoIdioma = idiomaActual === "es" ? "en" : "es";

  bandera.setAttribute("data-idioma", nuevoIdioma);
  translateContent(nuevoIdioma);
}

// =======================================================
// TRADUCCIÓN AUTOMÁTICA PARA CONTENIDO CREADO POR JS
// =======================================================
const observer = new MutationObserver((mutations) => {
  const lang = localStorage.getItem("preferredLanguage") || "es";
  if (lang === "es") return;

  mutations.forEach((m) => {
    m.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = fallbackTranslate(node.textContent.trim(), lang);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const text = node.innerText?.trim();
        if (!text) return;
        const fixed = fallbackTranslate(text, lang);
        if (fixed !== text) node.innerText = fixed;
      }
    });
  });
});

// =======================================================
// INICIALIZACIÓN
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  const savedLanguage = localStorage.getItem("preferredLanguage") || "es";
  currentLanguage = savedLanguage;

  const bandera = document.getElementById("banderaIdioma");
  if (bandera) {
    bandera.setAttribute("data-idioma", savedLanguage);
    bandera.addEventListener("click", alternarIdioma);
  }

  actualizarTextoBotonIdioma(savedLanguage);

  // Si el idioma guardado ya es inglés, traducimos la página al cargar
  if (savedLanguage !== "es") {
    requestAnimationFrame(() => {
      setTimeout(() => {
        translateContent(savedLanguage);
      }, 80);
    });
  }

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
});
