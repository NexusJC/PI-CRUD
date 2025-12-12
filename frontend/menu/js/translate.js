// =====================================================================
// API key para Google Cloud Translation
const API_KEY = 'AIzaSyBiGgFnc2QGkD5V51p45TTM9sPLHqUZn58';
let currentLanguage = 'es'; // Idioma original del sitio: español

// Etiquetas HTML que intentaremos traducir de forma genérica
const translatableElements = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a', 'span', 'li', 'strong', 'button','div'
];

// =====================================================================
// UTILIDADES
// =====================================================================

// Botones con iconos (para NO traducirlos con el sistema genérico,
// y no romper su estructura). A estos les pondremos el texto a mano.
function isIconButton(el) {
  return (
    el.tagName === 'BUTTON' &&
    el.querySelector('i, svg')
  );
}

// Botones estructurales que NO deben tocarse nunca (X de cierres, etc.)
function isStructuralButton(el) {
  if (el.tagName !== 'BUTTON') return false;

  const id = el.id || '';
  const classes = el.classList || [];

  // Botones de cierre explícitos
  if (
    id === 'modalClose' ||
    id === 'closeOrderDetailsBtn' ||
    classes.contains('modal-close') ||
    classes.contains('od-close')
  ) {
    return true;
  }

  // Botón que solo tiene "X" o "×" como contenido visible
  const text = (el.innerText || '').trim();
  if (text === 'X' || text === '×') return true;

  return false;
}

// Decide si un elemento debe quedar SIN traducir
function shouldSkipElement(el) {
  if (!el) return true;

  // 1) Si el propio elemento o algún padre tiene data-no-translate
  if (el.hasAttribute('data-no-translate') || el.closest('[data-no-translate]')) {
    return true;
  }

  // 2) *** PROTEGER COMPLETAMENTE EL PANEL DE ORDEN ***
  // Nada dentro de #orderDetails se traduce de forma genérica,
  // para no destruir la estructura de los items del carrito.
  if (el.closest('#orderDetails')) {
    return true;
  }

  // 3) Textos vacíos o sólo espacios
  const text = (el.innerText || '').trim();
  if (!text) return true;

  const lower = text.toLowerCase();

  // 4) Nombre del restaurante: nunca traducirlo
  if (lower === 'la parrilla azteca') return true;

  // 5) Nombre de los platillos en las tarjetas del menú
  if (el.classList.contains('menu-card-title')) return true;

  // 6) Nombre de los platillos dentro del panel de orden
  if (el.classList.contains('name') && el.closest('.od-info')) return true;

  // 7) Título del modal de producto (muestra el nombre del platillo)
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

      // No traducir el CONTENIDO de botones que tienen iconos dentro
      // (open-sidebar-btn, btn-logout, modalAddBtn, themeToggle, etc.)
      //if (isIconButton(el)) return;

      // No traducir botones estructurales como las X de cierre
      if (isStructuralButton(el)) return;

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

// Cambia SOLO el texto de un botón que tiene icono,
// sin borrar el <i> o <svg> y sin deformar el botón.
// Cambia SOLO el texto visible de un botón con icono,
// dando prioridad a un <span> etiqueta de texto.
function setButtonLabelWithIcon(btn, label) {
  if (!btn) return;

  // 1) Si el botón tiene un <span>, usamos ese como label
  const labelSpan = btn.querySelector('span');
  if (labelSpan) {
    labelSpan.textContent = label;

    // 2) Limpiamos posibles nodos de texto sueltos que quedaron
    //    directamente dentro del botón (para evitar duplicados).
    const textNodes = Array.from(btn.childNodes).filter(
      node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
    );
    textNodes.forEach(node => node.remove());

    return;
  }

  // 3) Si NO hay span (ej: btn-logout), usamos el método de nodo de texto
  const textNodes = Array.from(btn.childNodes).filter(
    node => node.nodeType === Node.TEXT_NODE
  );
  let textNode = textNodes[textNodes.length - 1];

  if (!textNode) {
    textNode = document.createTextNode('');
    btn.appendChild(textNode);
  }

  textNode.textContent = ' ' + label;
}

// =====================================================================
// ACTUALIZAR TEXTOS FIJOS SEGÚN IDIOMA (UI extra)
// =====================================================================

function updateLanguageUI(targetLanguage) {
  // -------- Banner superior (si existe en alguna página) --------
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

  // -------- Botones flotantes de idioma en artículos (si existen) --------
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

  // -------- Botones con iconos del menú/topbar --------

  // Botón "Ver Orden" / "View Order"
  const openOrderBtn = document.getElementById('open-sidebar-btn');
  if (openOrderBtn) {
    setButtonLabelWithIcon(
      openOrderBtn,
      targetLanguage === 'en' ? 'View Order' : 'Ver Orden'
    );
  }

  // Botón "Cerrar sesión" / "Log out"
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    setButtonLabelWithIcon(
      logoutBtn,
      targetLanguage === 'en' ? 'Log out' : 'Cerrar sesión'
    );
  }

  // Botón del modal "Agregar a la orden" / "Add to order"
  const modalAddBtn = document.getElementById('modalAddBtn');
  if (modalAddBtn) {
    setButtonLabelWithIcon(
      modalAddBtn,
      targetLanguage === 'en' ? 'Add to order' : 'Agregar a la orden'
    );
  }

  // Botón de modo oscuro del sidebar
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    const spanText = themeToggleBtn.querySelector('span');
    if (spanText) {
      spanText.textContent = targetLanguage === 'en' ? 'Dark Mode' : 'Modo oscuro';
    }
  }

  // =====================================================================
  //  textos fijos traducidos A MANO
  // =====================================================================

  // Título "Tu orden" / "Your order"
  const orderTitle = document.querySelector('#orderDetails .od-header h2');
  if (orderTitle) {
    orderTitle.textContent = targetLanguage === 'en' ? 'Your order' : 'Su pedido';
  }

  // Mensaje vacío
  const emptyMsgP = document.querySelector('#empty-cart-msg p');
  if (emptyMsgP) {
    emptyMsgP.innerHTML = targetLanguage === 'en'
      ? 'Your order is empty.<br>Add a dish to start'
      : 'Tu orden está vacía.<br>Agrega un platillo para comenzar';
  }

  // Labels de Subtotal / Impuestos / Total
  const summaryRows = document.querySelectorAll('#orderDetails .od-summary .row');
  if (summaryRows[0]) {
    const label = summaryRows[0].querySelector('span:first-child');
    if (label) {
      // En español lo tienes como "Total parcial:"
      label.textContent = targetLanguage === 'en' ? 'Subtotal:' : 'Total parcial:';
    }
  }
  if (summaryRows[1]) {
    const label = summaryRows[1].querySelector('span:first-child');
    if (label) {
      label.textContent = targetLanguage === 'en' ? 'Taxes:' : 'Impuestos:';
    }
  }
  if (summaryRows[2]) {
    const label = summaryRows[2].querySelector('span:first-child');
    if (label) {
      label.textContent = targetLanguage === 'en' ? 'Total:' : 'Total:';
    }
  }

  // Botón Confirmar pedido / Confirm Order
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    confirmBtn.textContent = targetLanguage === 'en'
      ? 'Confirm Order'
      : 'Confirmar pedido';
  }

  // Botón Imprimir ticket / Print Ticket
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.textContent = targetLanguage === 'en'
      ? 'Print Ticket'
      : 'Imprimir ticket';
  }

    // ================================================================
  //   TEXTOS DEL SIDEBAR (Ver Menú / Mi Perfil / Turnos)
  // ================================================================
  const menuLabel = document.querySelector('.menu-label');
  if (menuLabel) {
    menuLabel.textContent = targetLanguage === 'en'
      ? 'View Menu'
      : 'Ver Menú';
  }

  const perfilLabel = document.querySelector('.perfil-label');
  if (perfilLabel) {
    perfilLabel.textContent = targetLanguage === 'en'
      ? 'My Profile'
      : 'Mi Perfil';
  }

  const shiftsLabel = document.querySelector('.shifts-label');
  if (shiftsLabel) {
    shiftsLabel.textContent = targetLanguage === 'en'
      ? 'Shifts'
      : 'Turnos';
  }
}

// Hacemos accesible updateLanguageUI desde otros scripts (sidebar.js)
window.updateLanguageUI = updateLanguageUI;

// =====================================================================
// FUNCIÓN PRINCIPAL DE TRADUCCIÓN (toda la página)
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
          // Dejamos que Google detecte el idioma origen
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

      data.data.translations.forEach((tr, index) => {
        const [, info] = batch[index];
        const translatedText = decodeHTMLEntities(tr.translatedText);
        // Si es un botón con icono → traducir solo el texto, no los hijos
/*if (info.element.tagName === 'BUTTON' && info.element.querySelector('i, svg')) {
    const textNodes = Array.from(info.element.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE);

    let textNode = textNodes[textNodes.length - 1];

    if (!textNode) {
      // Si no existe nodo de texto, lo creamos (ej. botones con solo iconos)
      textNode = document.createTextNode('');
      info.element.appendChild(textNode);
    }

    textNode.textContent = ' ' + translatedText;
} else {*/
    // Elementos normales
    info.element.innerText = translatedText;
//}

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
// TRADUCCIÓN DE UN SOLO ELEMENTO (para la descripción del modal)
// =====================================================================

async function translateElementText(el, targetLanguage) {
  if (!el) return;
  const text = (el.innerText || '').trim();
  if (!text) return;

  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: [text],
        target: targetLanguage
      })
    });

    if (!response.ok) {
      console.error('Error al traducir elemento específico:', await response.text());
      return;
    }

    const data = await response.json();
    if (data.data && data.data.translations && data.data.translations[0]) {
      el.innerText = decodeHTMLEntities(data.data.translations[0].translatedText);
    }
  } catch (err) {
    console.error('Error en translateElementText:', err);
  }
}

// Hacemos accesible la función desde otros archivos (load-dishes.js)
window.translateElementText = translateElementText;

// =====================================================================
// FUNCIONES PARA LOS BOTONES / SELECTOR DE IDIOMA
// =====================================================================

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
  if (opciones) opciones.style.display = 'none';
}

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

  if (savedLanguage !== 'es') {
    translateContent(savedLanguage);
  }
});
