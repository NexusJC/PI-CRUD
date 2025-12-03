
// =====================================================================
// API key para Google Cloud Translation - Puedes cambiarla si necesitas otra API key
const API_KEY = 'AIzaSyBiGgFnc2QGkD5V51p45TTM9sPLHqUZn58';
let currentLanguage = 'es'; // Idioma predeterminado es español (es)

// Elementos HTML que serán traducidos
// Si necesitas traducir otros elementos, agrégalos a este array
const translatableElements = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li','strong','button'
];

// =====================================================================
// FUNCIONES PRINCIPALES DE TRADUCCIÓN
// =====================================================================

/**
 * Recopila todos los elementos para traducir de la página actual.
 * Esta función busca todos los elementos definidos en 'translatableElements'
 * y los prepara para la traducción.
 * 
 * Si necesitas excluir algún elemento específico de la traducción,
 * añade el atributo 'data-no-translate' a ese elemento en tu HTML.
 */
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

/**
 * Decodifica entidades HTML en el texto traducido.
 * IMPORTANTE: Soluciona el problema de los apóstrofes (') que aparecían como &#39;
 * y otros caracteres especiales en las traducciones.
 * 
 * Esta función fue añadida para corregir problemas con caracteres especiales
 * en las traducciones devueltas por la API.
 */
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
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
    
    // Mostrar indicador de carga (puedes personalizar el estilo aquí)
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'translation-loading';
    loadingIndicator.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; z-index: 9999; text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.2);';
    loadingIndicator.innerHTML = '<p style="margin: 0;">Traduciendo contenido, por favor espere...</p>';
    document.body.appendChild(loadingIndicator);
    
    const elements = getTranslatableContent();
    const textsToTranslate = Object.values(elements).map(item => item.text);
    
    try {
        // URL para la API de Google Cloud Translation - No cambiar a menos que la API cambie
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
                // Decodificar entidades HTML para corregir apóstrofes y otros caracteres especiales
                const translatedText = decodeHTMLEntities(data.data.translations[index].translatedText);
                elements[id].element.innerText = translatedText;
            });
            
            // Actualizar el idioma actual
            currentLanguage = targetLanguage;
            
            // Actualizar el atributo lang de HTML
            document.documentElement.lang = targetLanguage;
            
            // Guardar la preferencia de idioma en localStorage
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
            
            // 2. Actualizar los botones de idioma en los artículos
            // Estos botones están en el pequeño cuadro flotante en las páginas de artículos
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
    } catch (error) {
        console.error('Error al traducir:', error);
        alert('Error al traducir el contenido. Por favor, inténtalo de nuevo más tarde.');
    } finally {
        // Eliminar indicador de carga
        const loadingElement = document.getElementById('translation-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
}

// =====================================================================
// FUNCIONES DE INTERFAZ DE USUARIO PARA CAMBIO DE IDIOMA
// =====================================================================

/**
 * Cambia el idioma de la página y actualiza los elementos visuales.
 * Esta función es llamada desde los botones de idioma y otros controles.
 * 
 * @param {string} idioma - 'ingles' o 'espanol' (sin tilde)
 */
function cambiarIdioma(idioma) {
    // 1. Actualizar la bandera principal y las banderas del menú
    const banderaPrincipal = document.getElementById('banderaIdioma');
    const banderaIngles = document.querySelector('.ingles');
    const banderaEspana = document.querySelector('.españa');
    
    if (banderaPrincipal) {
        banderaPrincipal.src = idioma === 'ingles' 
            ? 'https://flagcdn.com/w20/gb.png'
            : 'https://flagcdn.com/w20/es.png';
    }
    
    if (banderaIngles && banderaEspana) {
        banderaIngles.style.display = idioma === 'espanol' ? 'none' : 'block';
        banderaEspana.style.display = idioma === 'espanol' ? 'block' : 'none';
    }
    
    // 2. Actualizar el idioma actual
    currentLanguage = idioma === 'ingles' ? 'en' : 'es';
    
    // 3. Llamar a la función de traducción
    translateContent(currentLanguage);
    
    // 4. Cerrar el menú de opciones si existe
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
        nuevaBandera = 'https://flagcdn.com/w20/gb.png';
    } else {
        nuevoIdioma = 'es';
        nuevaBandera = 'https://flagcdn.com/w20/es.png';
    }

    bandera.src = nuevaBandera;
    bandera.setAttribute('data-idioma', nuevoIdioma);
    document.querySelector('.bandera-container').setAttribute(
    'data-idioma-text',
    nuevoIdioma === 'es' ? ' Español' : ' English'
);


    // Llama a la función de traducción
    translateContent(nuevoIdioma);

    // Guarda la preferencia
    localStorage.setItem('preferredLanguage', nuevoIdioma);
}

// =====================================================================
// INICIALIZACIÓN Y CONFIGURACIÓN EN CARGA DE PÁGINA
// =====================================================================

/**
 * Esta sección se ejecuta cuando la página termina de cargar.
 * Configura los eventos de idioma, carga el idioma preferido del usuario
 * y establece los manejadores de eventos para los controles de idioma.
 */
document.addEventListener('DOMContentLoaded', () => {
    const bandera = document.getElementById('banderaIdioma');
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'es';
    bandera.src = savedLanguage === 'en'
        ? 'https://flagcdn.com/w20/gb.png'
        : 'https://flagcdn.com/w20/es.png';
    bandera.setAttribute('data-idioma', savedLanguage);
    document.querySelector('.bandera-container')
    .setAttribute('data-idioma-text', savedLanguage === 'es' ? 'Español' : 'English');
    translateContent(savedLanguage);
}); 

