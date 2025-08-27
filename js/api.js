/* ===============================
   SIMULADOR DE TURNOS
   =============================== */
(function () {
  const elTurno = document.getElementById('turnoActual');
  const elEspera = document.getElementById('enEspera');
  const elMins = document.getElementById('waitMins');
  const btnTomar = document.getElementById('btnTomar');
  const btnAdmin = document.getElementById('btnAdmin');

  if (!elTurno || !elEspera || !elMins) return; // por si el HTML cambia

  // Estado inicial (puedes ajustar estos valores)
  let letra = 'A';
  let numero = 37;           // Turno inicial
  let enEspera = 4;          // Personas esperando
  const minPorPersona = 2;   // Regla simple

  const fmt = () => `${letra}${String(numero).padStart(2, '0')}`;
  const calcMin = () => Math.max(1, enEspera * minPorPersona);

  function render() {
    elTurno.textContent = fmt();
    elEspera.textContent = String(enEspera);
    elMins.textContent = String(calcMin());
  }

  function siguienteLetra(l) {
    const code = l.charCodeAt(0);
    return code >= 90 ? 'A' : String.fromCharCode(code + 1); // Z -> A
  }

  function avanzarTurno() {
    if (enEspera > 0) enEspera = Math.max(0, enEspera - 1);
    numero++;
    if (numero > 99) { numero = 0; letra = siguienteLetra(letra); }
    render();
  }

  // Botón: Tomar turno
  if (btnTomar) {
    btnTomar.addEventListener('click', () => {
      const folioLetra = letra;
      const folioNumero = (numero + enEspera + 1) % 100;
      const folio = `${folioLetra}${String(folioNumero).padStart(2, '0')}`;

      enEspera++;
      render();

      alert(`Tu turno es: ${folio}\nHay ${enEspera - 1} persona(s) delante de ti.`);
    });
  }

  // Botón: Administración (demo)
  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      alert('Zona de administración (demo). Aquí iría el login.');
    });
  }

  // Arranque
  render();
  // Avanza turno cada 7 s
  setInterval(avanzarTurno, 7000);
})();

/* ===============================
   NAVBAR MÓVIL: HAMBURGUESA + PANEL
   =============================== */
(function () {
  const btn = document.getElementById('btnMenu');
  const panel = document.getElementById('navPanel');
  if (!btn || !panel) return;

  const openClass = 'open';
  const setState = (open) => {
    panel.classList.toggle(openClass, open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  };
  const toggle = () => setState(!panel.classList.contains(openClass));

  btn.addEventListener('click', toggle);

  // Cierra al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains(openClass)) return;
    const isInside = panel.contains(e.target) || btn.contains(e.target);
    if (!isInside) setState(false);
  });

  // Cierra con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains(openClass)) setState(false);
  });

  // Enlace "Administración" del panel móvil reutiliza el botón real
  const navAdminMobile = document.getElementById('navAdmin');
  const btnAdmin = document.getElementById('btnAdmin');
  if (navAdminMobile && btnAdmin) {
    navAdminMobile.addEventListener('click', (e) => {
      e.preventDefault();
      btnAdmin.click();
      setState(false);
    });
  }

  // Exponer utilidades para otros módulos (perfil) sin globales sucias
  window.__navPanelUtils__ = {
    closePanel: () => setState(false),
    isOpen: () => panel.classList.contains(openClass)
  };
})();

/* ===============================
   MENÚ INLINE (DESKTOP)
   =============================== */
(function () {
  // “Administración” del menú horizontal reutiliza el botón del panel
  const navAdminInline = document.getElementById('navAdminInline');
  const btnAdmin = document.getElementById('btnAdmin');
  if (navAdminInline && btnAdmin) {
    navAdminInline.addEventListener('click', (e) => {
      e.preventDefault();
      btnAdmin.click();
    });
  }

  // Scroll suave a “Tomar turno” desde cualquier link con href="#btnTomar"
  const links = Array.from(document.querySelectorAll('a[href="#btnTomar"]'));
  const btnTomar = document.getElementById('btnTomar');
  if (links.length && btnTomar) {
    const scrollToBtn = (e) => {
      e.preventDefault();
      btnTomar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    links.forEach(a => a.addEventListener('click', scrollToBtn));
  }
})();

/* ===============================
   VISTAS: HOME <-> PERFIL
   =============================== */
(function () {
  // Elementos de vistas
  const viewHome   = document.getElementById('view-home');
  const viewPerfil = document.getElementById('view-perfil');
  if (!viewHome || !viewPerfil) return; // si aún no agregas las vistas, salir

  // Botones / disparadores
  const btnPerfil = document.getElementById('btnPerfil')
                  || document.querySelector('.avatar[title="Perfil"]'); // fallback
  const btnVolver = document.getElementById('btnVolverHome');
  const navPerfil = document.getElementById('navPerfilLink'); // enlace en el nav (opcional)
  const navHome   = document.getElementById('navHome');       // enlace Inicio (opcional)

  // Utilidades del panel móvil (si existen)
  const panelUtils = window.__navPanelUtils__ || { closePanel: ()=>{}, isOpen: ()=>false };

  function showPerfil() {
    viewHome.hidden = true;
    viewPerfil.hidden = false;
    // Accesibilidad: foco al título
    const h2 = viewPerfil.querySelector('h2');
    if (h2) { h2.tabIndex = -1; h2.focus(); }

    // Cierra panel móvil si estaba abierto
    if (panelUtils.isOpen()) panelUtils.closePanel();
  }

  function showHome() {
    viewPerfil.hidden = true;
    viewHome.hidden = false;

    // Cierra panel móvil si estaba abierto
    if (panelUtils.isOpen()) panelUtils.closePanel();
  }

  // Disparadores
  if (btnPerfil) btnPerfil.addEventListener('click', showPerfil);
  if (btnVolver) btnVolver.addEventListener('click', showHome);

  if (navPerfil) {
    navPerfil.addEventListener('click', (e) => {
      e.preventDefault();
      showPerfil();
    });
  }

  if (navHome) {
    navHome.addEventListener('click', (e) => {
      e.preventDefault();
      showHome();
    });
  }
})();