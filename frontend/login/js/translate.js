// =====================================================================
// API key para Google Cloud Translation
const API_KEY = 'AIzaSyBiGgFnc2QGkD5V51p45TTM9sPLHqUZn58';
let currentLanguage = 'es'; // Idioma original del sitio: español

// Etiquetas HTML que intentaremos traducir
const translatableElements = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a', 'span', 'li', 'strong', 'button'
];

// =====================================================================
// UTILIDADES
// =====================================================================

// Decide si un elemento debe quedar SIN traducir
function shouldSkipElement(el) {
  if (!el) return true;

  // 1) Si el propio elemento o algún padre tiene data-no-translate
  if (el.hasAttribute('data-no-translate') || el.closest('[data-no-translate]')) {
    return true;
  }

  // 2) Textos vacíos o sólo espacios
  const text = (el.innerText || '').trim();
  if (!text) return true;

  const lower = text.toLowerCase();

  // 3) Nombre del restaurante: nunca traducirlo
  if (lower === 'la parrilla azteca') return true;

  // 4) Nombre de los platillos en las tarjetas del menú
  if (el.classList.contains('menu-card-title')) return true;

  // 5) Nombre de los platillos dentro del panel de orden
  if (el.classList.contains('name') && el.closest('.od-info')) return true;

  // 6) Título del modal de producto (muestra el nombre del platillo)
  if (el.id === 'modalTitle') return true;

  return false;
}

// Recolecta todos los nodos que se van a traducir
function getTranslatableContent() {
  const elementsMap = {};
  let counter = 0;

  translatableElements.forEach(tag => {
    document.querySelectorAll(tag).forEach(el => {
      if (shouldSkipElement(el)) return;

      const id = `${tag}-${counter++}`;
      elementsMap[id] = {
        element: el,
        text: el.innerText
      };
    });
  });

  return elementsMap;
}

// Decodifica entidades HTML (&amp;, &#39;, etc.)
function decodeHTMLEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Actualiza textos de algunos elementos de UI auxiliares (banner, toggles…)
function updateLanguageUI(targetLanguage) {
  // Banner superior (si existe en alguna página)
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
      buttons[0].innerText = 'English';
      buttons[1].innerText = targetLanguage === 'en' ? 'Spanish' : 'Español';
    }
  }

  // Botones flotantes de idioma en artículos (si existen)
  const btnEs = document.getElementById('btn-es');
  const btnEn = document.getElementById('btn-en');
  const toggleText = document.getElementById('toggle-text');

  if (btnEs && btnEn && toggleText) {
    if (targetLanguage === 'en') {
      btnEs.classList.remove('active');
      btnEn.classList.add('active');
      toggleText.innerText = 'Change language?';
    } else {
      btnEn.classList.remove('active');
      btnEs.classList.add('active');
      toggleText.innerText = '¿Cambiar idioma?';
    }
  }
}

// =====================================================================
// FUNCIÓN PRINCIPAL DE TRADUCCIÓN
// =====================================================================

/**
 * Traduce el contenido de la página al idioma indicado.
 * @param {string} targetLanguage - 'en' para inglés, 'es' para español.
 */
async function translateContent(targetLanguage) {
  // Si ya estamos en ese idioma, no hacemos nada
  if (currentLanguage === targetLanguage) return;

  // Recolectar elementos traducibles
  const elements = getTranslatableContent();
  const entries = Object.entries(elements);

  if (!entries.length) {
    // Aunque no haya nada que traducir, actualizamos el estado de idioma
    currentLanguage = targetLanguage;
    document.documentElement.lang = targetLanguage;
    localStorage.setItem('preferredLanguage', targetLanguage);
    updateLanguageUI(targetLanguage);
    return;
  }

  // Mostrar indicador de carga
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'translation-loading';
  loadingIndicator.style.cssText =
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
    'background:rgba(255,255,255,0.9);padding:20px;border-radius:10px;' +
    'z-index:9999;text-align:center;box-shadow:0 0 10px rgba(0,0,0,0.2);';
  loadingIndicator.innerHTML =
    '<p style="margin:0;">Traduciendo contenido, por favor espera...</p>';
  document.body.appendChild(loadingIndicator);

  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  const MAX_PER_REQUEST = 90; // evitar el error 400 por exceder el límite de textos

  try {
    for (let i = 0; i < entries.length; i += MAX_PER_REQUEST) {
      const batch = entries.slice(i, i + MAX_PER_REQUEST);
      const textsToTranslate = batch.map(([, data]) => data.text);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: textsToTranslate,
          target: targetLanguage
          // No enviamos "source": dejamos que Google detecte el idioma
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Respuesta no válida de la API de traducción:', errorText);
        throw new Error('Error en la petición de traducción');
      }

      const data = await response.json();
      if (!data.data || !data.data.translations) {
        console.error('Respuesta sin traducciones válidas:', data);
        throw new Error('No se recibieron traducciones válidas');
      }

      // Aplicar traducciones a los elementos correspondientes
      data.data.translations.forEach((tr, index) => {
        const [, info] = batch[index];
        const translatedText = decodeHTMLEntities(tr.translatedText);
        info.element.innerText = translatedText;
      });
    }

    // Todo OK → actualizamos idioma actual y UI
    currentLanguage = targetLanguage;
    document.documentElement.lang = targetLanguage;
    localStorage.setItem('preferredLanguage', targetLanguage);
    updateLanguageUI(targetLanguage);
  } catch (error) {
    console.error('Error al traducir:', error);
    alert('Error al traducir el contenido. Por favor, inténtalo de nuevo más tarde.');
  } finally {
    const loadingElement = document.getElementById('translation-loading');
    if (loadingElement) loadingElement.remove();
  }
}

// =====================================================================
// FUNCIONES PARA LOS BOTONES / SELECTOR DE IDIOMA
// =====================================================================

/**
 * Cambio de idioma cuando se usa un menú con opciones "ingles"/"espanol".
 * @param {string} idioma - 'ingles' o 'espanol'
 */
function cambiarIdioma(idioma) {
  const banderaPrincipal = document.getElementById('banderaIdioma');
  const banderaIngles = document.querySelector('.ingles');
  const banderaEspana = document.querySelector('.españa');

  const targetLang = idioma === 'ingles' ? 'en' : 'es';

  if (banderaPrincipal) {
    banderaPrincipal.src = targetLang === 'en'
      ? 'https://flagcdn.com/w20/gb.png'
      : 'https://flagcdn.com/w20/es.png';
  }

  if (banderaIngles && banderaEspana) {
    banderaIngles.style.display = idioma === 'espanol' ? 'none' : 'block';
    banderaEspana.style.display = idioma === 'espanol' ? 'block' : 'none';
  }

  translateContent(targetLang);

  const opciones = document.getElementById('idiomasOpciones');
  if (opciones) {
    opciones.style.display = 'none';
  }
}

/**
 * Alterna entre español e inglés con un solo botón (bandera en el menú).
 */
function alternarIdioma() {
  const bandera = document.getElementById('banderaIdioma');
  if (!bandera) return;

  let idiomaActual = bandera.getAttribute('data-idioma') || 'es';
  let nuevoIdioma, nuevaBandera;

  if (idiomaActual === 'es') {
    nuevoIdioma = 'en';
    nuevaBandera = 'https://flagcdn.com/w20/gb.png';
  } else {
    nuevoIdioma = 'es';
    nuevaBandera = 'https://flagcdn.com/w20/es.png';
  }

  bandera.src = nuevaBandera;
  bandera.setAttribute('data-idioma', nuevoIdioma);

  const contenedor = document.querySelector('.bandera-container');
  if (contenedor) {
    contenedor.setAttribute(
      'data-idioma-text',
      nuevoIdioma === 'es' ? ' Español' : ' English'
    );
  }

  translateContent(nuevoIdioma);
  localStorage.setItem('preferredLanguage', nuevoIdioma);
}

// =====================================================================
// INICIALIZACIÓN EN CARGA DE PÁGINA
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
  const bandera = document.getElementById('banderaIdioma');
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'es';

  if (bandera) {
    bandera.src = savedLanguage === 'en'
      ? 'https://flagcdn.com/w20/gb.png'
      : 'https://flagcdn.com/w20/es.png';
    bandera.setAttribute('data-idioma', savedLanguage);
  }

  const contenedor = document.querySelector('.bandera-container');
  if (contenedor) {
    contenedor.setAttribute(
      'data-idioma-text',
      savedLanguage === 'es' ? ' Español' : ' English'
    );
  }

  // Sólo traducimos automáticamente si el idioma guardado NO es español
  if (savedLanguage !== 'es') {
    translateContent(savedLanguage);
  }
});
