// =====================================================================
// CONFIGURACIÓN PRINCIPAL
// =====================================================================
const API_KEY = 'AIzaSyBiGgFnc2QGkD5V51p45TTM9sPLHqUZn58';
let currentLanguage = 'es';

// Elementos HTML que serán traducidos
const translatableElements = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li', 'strong'
];

// =====================================================================
// SISTEMA DE PERSISTENCIA ENTRE PÁGINAS
// =====================================================================

function saveTranslationState() {
    const translationState = {
        language: currentLanguage,
        timestamp: Date.now(),
        pageUrl: window.location.pathname
    };
    localStorage.setItem('translationState', JSON.stringify(translationState));
    sessionStorage.setItem('currentLanguage', currentLanguage);
}

function loadTranslationState() {
    const sessionLang = sessionStorage.getItem('currentLanguage');
    if (sessionLang) {
        currentLanguage = sessionLang;
        return currentLanguage;
    }
    
    const savedState = localStorage.getItem('translationState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            const isRecent = (Date.now() - state.timestamp) < 3600000;
            
            if (isRecent) {
                currentLanguage = state.language;
                sessionStorage.setItem('currentLanguage', currentLanguage);
                return currentLanguage;
            }
        } catch (e) {
            console.error('Error cargando estado de traducción:', e);
        }
    }
    
    return currentLanguage;
}

function setupNavigationTracking() {
    window.addEventListener('beforeunload', () => {
        saveTranslationState();
    });
    
    const originalTranslateContent = translateContent;
    window.translateContent = async function(targetLanguage) {
        await originalTranslateContent(targetLanguage);
        saveTranslationState();
    };
}

// =====================================================================
// FUNCIONES PRINCIPALES DE TRADUCCIÓN
// =====================================================================

function getTranslatableContent() {
    const elements = {};
    translatableElements.forEach(tag => {
        document.querySelectorAll(tag).forEach((el, i) => {
            if (el.innerText && el.innerText.trim() && !el.hasAttribute('data-no-translate')) {
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

async function translateContent(targetLanguage) {
    if (currentLanguage === targetLanguage) return;
    
    // Mostrar indicador de carga
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'translation-loading';
    loadingIndicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 20px 30px;
        border-radius: 10px;
        z-index: 9999;
        text-align: center;
        box-shadow: 0 0 20px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        min-width: 200px;
    `;
    
    const loadingText = targetLanguage === 'en' 
        ? 'Translating content, please wait...' 
        : 'Traduciendo contenido, por favor espere...';
    
    loadingIndicator.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div class="spinner" style="
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <p style="margin: 0; color: #333; font-size: 14px;">${loadingText}</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadingIndicator);
    
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
                source: currentLanguage,
                format: 'text'
            })
        });
        
        const data = await response.json();
        
        if (data.data && data.data.translations) {
            Object.keys(elements).forEach((id, index) => {
                if (elements[id] && elements[id].element && elements[id].element.isConnected) {
                    const translatedText = decodeHTMLEntities(data.data.translations[index].translatedText);
                    elements[id].element.innerText = translatedText;
                    
                    elements[id].element.setAttribute('data-translated', 'true');
                    elements[id].element.setAttribute('data-original-lang', currentLanguage);
                    elements[id].element.setAttribute('data-current-lang', targetLanguage);
                }
            });
            
            currentLanguage = targetLanguage;
            updatePageMetadata(targetLanguage);
            saveTranslationState();
            updateInterfaceLanguage(targetLanguage);
        }
    } catch (error) {
        console.error('Error al traducir:', error);
        
        const errorMsg = currentLanguage === 'es' 
            ? 'Error al traducir el contenido. Por favor, recarga la página e inténtalo de nuevo.' 
            : 'Error translating content. Please reload the page and try again.';
        
        showErrorNotification(errorMsg);
    } finally {
        const loadingElement = document.getElementById('translation-loading');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            loadingElement.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (loadingElement.parentNode) {
                    loadingElement.remove();
                }
            }, 300);
        }
    }
}

function updatePageMetadata(targetLanguage) {
    document.documentElement.lang = targetLanguage;
    
    let metaLanguage = document.querySelector('meta[http-equiv="content-language"]');
    if (!metaLanguage) {
        metaLanguage = document.createElement('meta');
        metaLanguage.setAttribute('http-equiv', 'content-language');
        document.head.appendChild(metaLanguage);
    }
    metaLanguage.setAttribute('content', targetLanguage);
    
    document.body.classList.remove('lang-es', 'lang-en');
    document.body.classList.add(`lang-${targetLanguage}`);
    
    document.cookie = `preferred_language=${targetLanguage}; path=/; max-age=31536000; SameSite=Lax`;
}

function showErrorNotification(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    
    errorDiv.innerHTML = `
        <p style="margin: 0; font-size: 14px;">${message}</p>
        <button onclick="this.parentElement.remove()" style="
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 12px;
        ">✕</button>
        <style>
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

// =====================================================================
// ACTUALIZACIÓN DE INTERFAZ PARA BOTÓN SIN BANDERAS
// =====================================================================

function updateInterfaceLanguage(targetLanguage) {
    // 1. Actualizar el botón principal de idioma
    const banderaContainer = document.querySelector('.bandera-container');
    if (banderaContainer) {
        banderaContainer.setAttribute('data-idioma-text', 
            targetLanguage === 'es' ? ' Español' : ' English');
    }
    
    // 2. Actualizar el texto del banner de idioma si existe
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
    
    // 3. Actualizar los botones de idioma en los artículos (si existen)
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

function setupTabSync() {
    window.addEventListener('storage', (event) => {
        if (event.key === 'translationState') {
            try {
                const newState = JSON.parse(event.newValue);
                if (newState && newState.language && newState.language !== currentLanguage) {
                    console.log(`Sincronizando idioma desde otra pestaña: ${newState.language}`);
                    translateContent(newState.language);
                }
            } catch (e) {
                console.error('Error sincronizando idioma:', e);
            }
        }
    });
    
    if (typeof BroadcastChannel !== 'undefined') {
        const translationChannel = new BroadcastChannel('translation_channel');
        
        translationChannel.onmessage = (event) => {
            if (event.data.type === 'LANGUAGE_CHANGE' && event.data.language !== currentLanguage) {
                translateContent(event.data.language);
            }
        };
        
        window.translationChannel = translationChannel;
    }
}

// =====================================================================
// FUNCIÓN PRINCIPAL DEL BOTÓN DE IDIOMA
// =====================================================================

function alternarIdioma() {
    const banderaContainer = document.querySelector('.bandera-container');
    let idiomaActual = banderaContainer ? banderaContainer.getAttribute('data-idioma-text') : ' Español';
    
    let nuevoIdioma;
    if (idiomaActual.includes('Español') || currentLanguage === 'en') {
        nuevoIdioma = 'es';
    } else {
        nuevoIdioma = 'en';
    }
    
    translateContent(nuevoIdioma);
}

// =====================================================================
// INICIALIZACIÓN
// =====================================================================

function initializeTranslationSystem() {
    // 1. Cargar estado de traducción
    const savedLanguage = loadTranslationState();
    
    // 2. Configurar seguimiento de navegación
    setupNavigationTracking();
    
    // 3. Configurar sincronización entre pestañas
    setupTabSync();
    
    // 4. Configurar botón principal
    const banderaContainer = document.querySelector('.bandera-container');
    if (banderaContainer) {
        banderaContainer.setAttribute('data-idioma-text', 
            savedLanguage === 'es' ? ' Español' : ' English');
    }
    
    // 5. Aplicar traducción si es necesario
    if (savedLanguage !== 'es') {
        setTimeout(() => {
            translateContent(savedLanguage);
        }, 100);
    }
    
    // 6. Configurar eventos de botones
    const banderaBtn = document.getElementById('banderaIdioma');
    if (banderaBtn) {
        banderaBtn.addEventListener('click', alternarIdioma);
    }
    
    const btnEs = document.getElementById('btn-es');
    const btnEn = document.getElementById('btn-en');
    
    if (btnEs) btnEs.addEventListener('click', () => translateContent('es'));
    if (btnEn) btnEn.addEventListener('click', () => translateContent('en'));
}

// =====================================================================
// EJECUCIÓN AL CARGAR LA PÁGINA
// =====================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTranslationSystem);
} else {
    initializeTranslationSystem();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const savedLang = sessionStorage.getItem('currentLanguage') || 
                         localStorage.getItem('preferredLanguage');
        if (savedLang && savedLang !== 'es') {
            translateContent(savedLang);
        }
    }, 500);
});

// Exportar funciones para uso global
window.translateContent = translateContent;
window.alternarIdioma = alternarIdioma;