let currentLang = localStorage.getItem("preferredLang") || "es";

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("translate-toggle");

  toggle.addEventListener("click", () => {
    const newLang = currentLang === "es" ? "en" : "es";
    setGoogleTranslateLanguage(newLang);
  });
});

window.googleTranslateElementInit = function() {
  let container = document.getElementById('google_translate_element');
  if (!container) {
    container = document.createElement('div');
    container.id = 'google_translate_element';
    const switcher = document.querySelector('.language-switcher') || document.body;
    switcher.appendChild(container);
  }

  console.log('🔔 googleTranslateElementInit invoked');
  new google.translate.TranslateElement({
    pageLanguage: 'es',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
  container.style.display = '';
};

function setGoogleTranslateLanguage(lang) {
  const combo = document.querySelector(".goog-te-combo");
  if (!combo) {
    console.warn(" Google Translate aún no está listo. Reintentando...");
    setTimeout(() => setGoogleTranslateLanguage(lang), 500);
    return;
  }

  console.log(" Combo disponible. Cambiando idioma...");
  combo.value = lang;
  combo.dispatchEvent(new Event("change"));
  localStorage.setItem("preferredLang", lang);
  currentLang = lang;
  console.log(` Idioma cambiado a: ${lang.toUpperCase()}`);
}
