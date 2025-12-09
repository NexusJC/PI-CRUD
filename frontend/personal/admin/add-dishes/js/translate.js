
// =====================================================================
// API key para Google Cloud Translation - Puedes cambiarla si necesitas otra API key
const API_KEY = 'AIzaSyBiGgFnc2QGkD5V51p45TTM9sPLHqUZn58';
let currentLanguage = 'es'; // Idioma predeterminado es español (es)

const translatableElements = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li','strong', 'button'
];

function getTranslatableContent() {
    const elements = {};
    translatableElements.forEach(tag => {
        document.querySelectorAll(tag).forEach((el, i) => {
            // Ignorar elementos sin contenido o con solo espacios
            if (el.innerText && el.innerText.trim() && !el.hasAttribute('data-no-translate')) {
                // Usar un ID único para cada elemento
                const id = `${tag}-${i}`;
                elements[id] = {
                    element: el,
                    text: el.innerText
                };
            }
        });
    });
    return elements;
}

function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
// =====================================================================
// TRADUCCIÓN DE RESPALDO (fallback)
// Aquí puedes mapear textos concretos de tu interfaz que Google
// no esté traduciendo bien. Si no hay coincidencia, regresa el
// mismo texto y no rompe nada.
// =====================================================================
function fallbackTranslate(text, lang) {
  if (!text) return text;
  const key = text.trim();

  const dict = {
    en: {
      // ==== Dashboard ====
      "Dashboard general": "General dashboard",
      "Resumen rápido de platillos, usuarios y equipo.": "Quick summary of dishes, users and staff.",
      "Platillos totales": "Total dishes",
      "Registros en el menú": "Records in the menu",
      "Usuarios registrados": "Registered users",
      "Clientes + personal": "Customers + staff",
      "Empleados activos": "Active employees",
      "Con acceso al sistema": "With system access",
      "Admins totales": "Total admins",
      "Usuarios con control completo": "Users with full control",
      "Distribución de usuarios por rol": "User distribution by role",
      "Relación entre clientes, empleados y administradores.": "Relationship between customers, employees and administrators.",
      "Ventas / platillos más vendidos": "Sales / top selling dishes",
      "Pendiente de conectar información del backend.": "Pending backend connection.",
      "Ingresos totales": "Total revenue",
      "Órdenes del día": "Today's orders",
      "Platillos destacados": "Featured dishes",
      "Panel en tiempo real": "Real-time panel"
      // aquí puedes ir agregando más textos específicos si lo deseas
    },
    es: {
      // Por ahora simplemente devolvemos el mismo texto,
      // pero puedes mapear palabras en inglés → español si quieres.
    }
  };

  const table = dict[lang];
  if (table && table[key]) {
    return table[key];
  }
  return text;
}
/**
 * Función principal que realiza la traducción de todo el contenido.
 * Procesa todos los elementos seleccionados por getTranslatableContent()
 * y los traduce usando la API de Google Cloud Translation.
 * 
 * @param {string} targetLanguage - Idioma al que se va a traducir ('en' para inglés, 'es' para español)
 */
async function translateContent(targetLanguage) {
    // No hacer nada si ya estamos en el idioma objetivo
    if (currentLanguage === targetLanguage) return;

    const elements = getTranslatableContent();
    const textsToTranslate = Object.values(elements).map(item => item.text);
    
    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: textsToTranslate,
                target: targetLanguage,
                source: currentLanguage
            })
        });
        
        const data = await response.json();
        
        if (data.data && data.data.translations) {
            Object.keys(elements).forEach((id, index) => {
                const translatedText = decodeHTMLEntities(data.data.translations[index].translatedText);
                elements[id].element.textContent = translatedText;
            });

    // Segunda pasada para textos que Google no tradujo
    document.querySelectorAll("*").forEach(el => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            const original = el.innerText.trim();
            const fixed = fallbackTranslate(original, targetLanguage);
            if (fixed !== original) el.innerText = fixed;
        }
    });
    
    currentLanguage = targetLanguage;
    
    document.documentElement.lang = targetLanguage;
            
    localStorage.setItem('preferredLanguage', targetLanguage);
            
// =====================================================================
// ACTUALIZACIÓN DE ELEMENTOS DE LA INTERFAZ DE USUARIO
// =====================================================================
            
// 1. Actualizar el texto del banner de idioma si existe
// Este banner puede estar presente en algunas páginas como alternativa
// al selector de bandera
const banner = document.getElementById('language-banner');
    if (banner) {
        const bannerText = banner.querySelector('p');
        if (bannerText) {
            bannerText.innerText = targetLanguage === 'en' 
                ? 'Would you like to read this article in Spanish?' 
                : '¿Prefieres leer este artículo en inglés?';
        }
        
        const buttons = banner.querySelectorAll('button:not(.close-btn)');
            if (buttons.length >= 2) {
                buttons[0].innerText = targetLanguage === 'en' ? 'English' : 'English';
                buttons[1].innerText = targetLanguage === 'en' ? 'Spanish' : 'Español';
            }
        }
    }
} catch (error) {
    console.error('Error al traducir el contenido:', error);
}
}

/**
 @param {string} idioma - 'ingles' o 'espanol' (sin tilde)
 */
function cambiarIdioma(idioma) {    
    currentLanguage = idioma === 'ingles' ? 'en' : 'es';
    
    translateContent(currentLanguage);
    
    const opciones = document.getElementById('idiomasOpciones');
    if (opciones) {
        opciones.style.display = 'none';
    }
}

/**
 * Alterna entre español e inglés.
 * Esta función es llamada al hacer clic en la bandera principal
 * en las páginas que usan el selector de bandera.
 */
function alternarIdioma() {
    const bandera = document.getElementById('banderaIdioma');
    let idiomaActual = bandera.getAttribute('data-idioma') || 'es';
    let nuevoIdioma, nuevaBandera;

    if (idiomaActual === 'es') {
        nuevoIdioma = 'en';
    } else {
        nuevoIdioma = 'es';
    }
    bandera.setAttribute('data-idioma', nuevoIdioma);

    // Llama a la función de traducción
    translateContent(nuevoIdioma);

    localStorage.setItem('preferredLanguage', nuevoIdioma);
}

// =======================================================
// TRADUCCIÓN AUTOMÁTICA PARA CONTENIDO CREADO POR JS
// =======================================================
const observer = new MutationObserver(mutations => {
    const lang = localStorage.getItem("preferredLanguage") || "es";
    if (lang === "es") return;

    mutations.forEach(m => {
        m.addedNodes.forEach(node => {
            if (node.nodeType === 3) {
                node.textContent = fallbackTranslate(node.textContent.trim(), lang);
            }
            if (node.nodeType === 1) {
                const text = node.innerText?.trim();
                if (text && fallbackTranslate(text, lang) !== text) {
                    node.innerText = fallbackTranslate(text, lang);
                }
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'es';

    actualizarTextoBotonIdioma(savedLanguage);

    if (savedLanguage === 'es') {
        currentLanguage = 'es'; 
        document.documentElement.lang = 'es';
        return;
    }

    requestAnimationFrame(() => {
        setTimeout(() => {
            translateContent(savedLanguage);
        }, 80);
    });

function actualizarTextoBotonIdioma(idiomaActual) {
    const banderaBtn = document.querySelector("#banderaIdioma .bandera-container");
    if (!banderaBtn) return;

    banderaBtn.setAttribute(
        "data-idioma-text",
        idiomaActual === "es" ? "English" : "Español"
    );
}
});