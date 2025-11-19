let pedidoActivo = '401';

const pedidosData = {
    '401': {
        cliente: 'Ana López',
        total: 248.00,
        ordenes: [
            { nombre: 'Hamburguesa Azteca', cantidad: 1, precio: 110.00 },
            { nombre: 'Papas Crujientes', cantidad: 1, precio: 60.00 },
            { nombre: 'Refresco', cantidad: 2, precio: 78.00 }
        ],
        comentario: 'Por favor, sin cebolla y con extra de salsa. Que la hamburguesa esté bien cocida.',
        horaPedido: '16:45',
        horaEstimada: '17:05',
        estado: 'proceso'
    },
    '402': {
        cliente: 'Juan Pérez',
        total: 156.50,
        ordenes: [
            { nombre: 'Tacos al Pastor', cantidad: 3, precio: 117.00 },
            { nombre: 'Agua de Jamaica', cantidad: 1, precio: 39.50 }
        ],
        comentario: 'Poco picante, por favor.',
        horaPedido: '16:50',
        horaEstimada: '17:10',
        estado: 'pendiente'
    },
    '403': {
        cliente: 'Laura García',
        total: 189.00,
        ordenes: [
            { nombre: 'Ensalada César', cantidad: 1, precio: 95.00 },
            { nombre: 'Limonada Natural', cantidad: 2, precio: 94.00 }
        ],
        comentario: 'Agregar aderezo aparte.',
        horaPedido: '17:00',
        horaEstimada: '17:20',
        estado: 'pendiente'
    },
    '404': {
        cliente: 'Sofía Ramírez',
        total: 275.50,
        ordenes: [
            { nombre: 'Pizza Mexicana', cantidad: 1, precio: 180.00 },
            { nombre: 'Refresco de Manzana', cantidad: 1, precio: 95.50 }
        ],
        comentario: 'Agregar piña extra.',
        horaPedido: '17:10',
        horaEstimada: '17:30',
        estado: 'pendiente'
    },
    '405': {
        cliente: 'Carlos Mendoza',
        total: 320.00,
        ordenes: [
            { nombre: 'Burrito de Carne Asada', cantidad: 2, precio: 200.00 },
            { nombre: 'Nachos con Queso', cantidad: 1, precio: 70.00 },
            { nombre: 'Agua Mineral', cantidad: 1, precio: 50.00 }
        ],
        comentario: 'Sin cilantro, por favor.',
        horaPedido: '17:15',
        horaEstimada: '17:35',
        estado: 'pendiente'
    },
    '406': {
        cliente: 'Miguel Torres',
        total: 195.75,
        ordenes: [
            { nombre: 'Quesadillas', cantidad: 4, precio: 120.00 },
            { nombre: 'Sopa de Tortilla', cantidad: 1, precio: 45.75 },
            { nombre: 'Refresco de Cola', cantidad: 1, precio: 30.00 }
        ],
        comentario: 'Para llevar.',
        horaPedido: '17:20',
        horaEstimada: '17:40',
        estado: 'pendiente'
    }
};

const menuItems = [
    "Pizza Mexicana",
    "Hamburguesa Azteca", 
    "Pollo Estilo Parrilla",
    "Papas Crujientes",
    "Carne Asada",
    "Chilaquiles",
    "Tostadas tradicionales",
    "Enchiladas",
    "Pozole",
    "Costillas BBQ",
    "Tacos al Pastor",
    "Tacos de Asada",
    "Refresco",
    "Agua de Jamaica",
    "Limonada Natural",
    "Refresco de Manzana",
    "Agua Mineral",
    "Refresco de Cola"
];

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('preferredLanguage')) {
        localStorage.setItem('preferredLanguage', 'es');
    }
    
    inicializarCarrusel();
    inicializarBotones();
    inicializarModal();
    actualizarVista();
    inicializarSidebar();
    
    console.log('Aplicación completamente inicializada');
});

function inicializarCarrusel() {
    const cards = document.querySelectorAll('.turno-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const pedidoId = card.getAttribute('data-pedido');
            seleccionarPedido(pedidoId);
        });
    });
}

function seleccionarPedido(pedidoId) {
    document.querySelectorAll('.turno-card').forEach(card => {
        card.classList.remove('activo');
    });
    
    const cardSeleccionado = document.querySelector(`[data-pedido="${pedidoId}"]`);
    cardSeleccionado.classList.add('activo');
    
    pedidoActivo = pedidoId;
    
    actualizarVista();
}

function inicializarBotones() {
    const btnCancelar = document.getElementById('btnCancelar');
    const btnEditar = document.getElementById('btnEditar');
    const btnEntregar = document.getElementById('btnEntregar');
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', manejarCancelar);
    }
    
    if (btnEditar) {
        const newBtn = btnEditar.cloneNode(true);
        btnEditar.parentNode.replaceChild(newBtn, btnEditar);
        
        const freshBtn = document.getElementById('btnEditar');
        
        freshBtn.addEventListener('click', function(e) {
            console.log('Botón editar clickeado');
            e.preventDefault();
            e.stopPropagation();
            manejarEditar();
        });
        
        console.log('Botón editar configurado correctamente');
    } else {
        console.error('No se encontró el botón editar');
    }
    
    if (btnEntregar) {
        btnEntregar.addEventListener('click', manejarEntregar);
    }
}

function manejarCancelar() {
    const pedido = pedidosData[pedidoActivo];
    if (confirm(`¿Está seguro de que desea cancelar el pedido #${pedidoActivo} de ${pedido.cliente}?`)) {
        eliminarPedido(pedidoActivo);
    }
}

function manejarEditar() {
    console.log('✏️ Abriendo modal de edición...');
    abrirModalEdicion(pedidoActivo);
}

function manejarEntregar() {
    const btnEntregar = document.getElementById('btnEntregar');
    
    if (btnEntregar.classList.contains('activo')) {
        const pedido = pedidosData[pedidoActivo];
        if (confirm(`¿Marcar como entregado el pedido #${pedidoActivo} de ${pedido.cliente}?`)) {
            entregarPedido(pedidoActivo);
        }
    }
}

function actualizarVista() {
    const pedido = pedidosData[pedidoActivo];
    const btnEntregar = document.getElementById('btnEntregar');
    
    const esPrimerPedido = pedidoActivo === '401';
    if (esPrimerPedido) {
        btnEntregar.classList.add('activo');
    } else {
        btnEntregar.classList.remove('activo');
    }
    
    actualizarDetallesPanel(pedido);
    
    actualizarPrecioCarrusel(pedidoActivo, pedido.total);
}

function actualizarDetallesPanel(pedido) {
    const detallesPanel = document.getElementById('detallesPanel');
    
    detallesPanel.innerHTML = `
        <div class="detalles-header">
            <h3 data-translate="true #${pedidoActivo} - ${pedido.cliente}">Pedido #${pedidoActivo} - ${pedido.cliente}</h3>
            <span class="total-pedido" data-translate="true $${pedido.total.toFixed(2)}">Total: $${pedido.total.toFixed(2)}</span>
        </div>
        
        <div class="ordenes-container">
            <h4 data-translate="true">Órdenes de Comida</h4>
            <div class="ordenes-lista">
                ${pedido.ordenes.map(orden => `
                    <div class="orden-item">
                        <span class="orden-nombre" data-translate="${orden.nombre}">${orden.nombre}</span>
                        <span class="orden-cantidad">x${orden.cantidad}</span>
                        <span class="orden-precio">$${orden.precio.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="comentarios-section">
            <h4 data-translate="true">Comentarios del Cliente</h4>
            <div class="comentario-texto">
                "${pedido.comentario}"
            </div>
        </div>

        <div class="info-adicional">
            <div class="info-item">
                <strong data-translate="true">Hora del pedido:</strong> ${pedido.horaPedido}
            </div>
            <div class="info-item">
                <strong data-translate="true">Hora estimada:</strong> ${pedido.horaEstimada}
            </div>
            <div class="info-item">
                <strong data-translate="true">Tiempo restante:</strong> <span class="tiempo-restante">${calcularTiempoRestante(pedido.horaEstimada)}</span>
            </div>
        </div>
    `;

    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('carruselChanged'));
    }, 100);
}

function actualizarPrecioCarrusel(pedidoId, nuevoTotal) {
    const card = document.querySelector(`[data-pedido="${pedidoId}"]`);
    if (card) {
        const elementoCosto = card.querySelector('.costo');
        elementoCosto.textContent = `$${nuevoTotal.toFixed(2)}`;
    }
}

function calcularTiempoRestante(horaEstimada) {
    const ahora = new Date();
    const [horas, minutos] = horaEstimada.split(':').map(Number);
    const estimada = new Date();
    estimada.setHours(horas, minutos, 0, 0);
    
    const diffMs = estimada - ahora;
    const diffMins = Math.max(0, Math.round(diffMs / (1000 * 60)));
    
    return `${diffMins} min`;
}

function eliminarPedido(pedidoId) {
    const card = document.querySelector(`[data-pedido="${pedidoId}"]`);
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        card.remove();
        
        if (pedidoId === pedidoActivo) {
            const siguienteCard = document.querySelector('.turno-card');
            if (siguienteCard) {
                const siguienteId = siguienteCard.getAttribute('data-pedido');
                seleccionarPedido(siguienteId);
            } else {
                document.getElementById('detallesPanel').innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3 data-translate="true">No hay pedidos en cocina</h3>
                    <p data-translate="true">Todos los pedidos han sido completados</p>
                </div>
                `;
                document.querySelector('.acciones-panel').style.display = 'none';
            }
        }
    }, 300);
}

function entregarPedido(pedidoId) {
    eliminarPedido(pedidoId);
}

function inicializarModal() {
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('editarModal').classList.remove('active');
    });

    document.getElementById('cancelarEdicion').addEventListener('click', () => {
        document.getElementById('editarModal').classList.remove('active');
    });

    document.getElementById('guardarCambios').addEventListener('click', () => {
        guardarCambiosModal();
    });
}

function abrirModalEdicion(pedidoId) {
    const pedido = pedidosData[pedidoId];
    const modal = document.getElementById('editarModal');
    const modalBody = document.getElementById('modalBody');
    const modalPedidoId = document.getElementById('modalPedidoId');
    
    modalPedidoId.textContent = pedidoId;
    
    modalBody.innerHTML = `
    <div class="menu-items">
        <h4 data-translate="true">Editar Órdenes del Pedido</h4>
        <div id="itemsList">
            ${pedido.ordenes.map((orden, index) => `
                <div class="menu-item" data-index="${index}">
                    <div class="item-info">
                        <span class="item-name">${orden.nombre}</span>
                        <span class="item-quantity" data-translate="true ${orden.cantidad}">Cantidad: ${orden.cantidad}</span>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="decrease-qty">-</button>
                            <span>${orden.cantidad}</span>
                            <button class="increase-qty">+</button>
                        </div>
                        <button class="remove-item">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    <div class="add-item">
        <select id="nuevoItem">
            <option value="" data-translate="Seleccionar item...">Seleccionar item...</option>
            ${menuItems.map(item => `<option value="${item}">${item}</option>`).join('')}
        </select>
        <input type="number" id="nuevaCantidad" min="1" max="10" value="1">
        <button id="agregarItem" data-translate="true">Agregar</button>
    </div>
    `;
    
    agregarEventosModal();
    
    modal.classList.add('active');
}

function agregarEventosModal() {
    const modalBody = document.getElementById('modalBody');
    
    modalBody.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.menu-item');
        
        if (e.target.classList.contains('remove-item')) {
            itemElement.remove();
        }
        
        if (e.target.classList.contains('decrease-qty')) {
            const quantitySpan = itemElement.querySelector('.quantity-controls span');
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 1) {
                quantity--;
                quantitySpan.textContent = quantity;
                itemElement.querySelector('.item-quantity').textContent = `Cantidad: ${quantity}`;
            }
        }
        
        if (e.target.classList.contains('increase-qty')) {
            const quantitySpan = itemElement.querySelector('.quantity-controls span');
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity < 10) {
                quantity++;
                quantitySpan.textContent = quantity;
                itemElement.querySelector('.item-quantity').textContent = `Cantidad: ${quantity}`;
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.id === 'agregarItem') {
            const select = document.getElementById('nuevoItem');
            const cantidadInput = document.getElementById('nuevaCantidad');
            const nuevoItem = select.value;
            const cantidad = parseInt(cantidadInput.value) || 1;
            
            if (nuevoItem && cantidad > 0) {
                const itemsList = document.getElementById('itemsList');
                
                const itemsExistentes = itemsList.querySelectorAll('.item-name');
                let itemExistente = null;
                
                itemsExistentes.forEach(item => {
                    if (item.textContent === nuevoItem) {
                        itemExistente = item.closest('.menu-item');
                    }
                });
                
                if (itemExistente) {
                    const quantitySpan = itemExistente.querySelector('.quantity-controls span');
                    let currentQuantity = parseInt(quantitySpan.textContent);
                    const newQuantity = currentQuantity + cantidad;
                    quantitySpan.textContent = newQuantity;
                    itemExistente.querySelector('.item-quantity').textContent = `Cantidad: ${newQuantity}`;
                } else {
                    const nuevoElemento = document.createElement('div');
                    nuevoElemento.className = 'menu-item';
                    nuevoElemento.innerHTML = `
                    <div class="item-info">
                        <span class="item-name">${nuevoItem}</span>
                        <span class="item-quantity" data-translate="true: ${cantidad}">Cantidad: ${cantidad}</span>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="decrease-qty">-</button>
                            <span>${cantidad}</span>
                            <button class="increase-qty">+</button>
                        </div>
                        <button class="remove-item">🗑️</button>
                    </div>
                    `;
                    
                    itemsList.appendChild(nuevoElemento);
                }
                
                select.value = '';
                cantidadInput.value = '1';
            }
        }
    });
}

function guardarCambiosModal() {
    const itemsList = document.getElementById('itemsList');
    const itemsElements = itemsList.querySelectorAll('.menu-item');
    const nuevosItems = Array.from(itemsElements).map(element => {
        const nombre = element.querySelector('.item-name').textContent;
        const cantidad = parseInt(element.querySelector('.quantity-controls span').textContent);
        const precio = calcularPrecioItem(nombre) * cantidad;
        return { nombre, cantidad, precio };
    });
    
    const total = nuevosItems.reduce((sum, item) => sum + item.precio, 0);
    pedidosData[pedidoActivo].ordenes = nuevosItems;
    pedidosData[pedidoActivo].total = total;
    
    actualizarVista();
    
    alert('Cambios guardados correctamente para el pedido #' + pedidoActivo);
    document.getElementById('editarModal').classList.remove('active');
}

function calcularPrecioItem(nombre) {
    const precios = {
        'Hamburguesa Azteca': 110.00,
        'Papas Crujientes': 60.00,
        'Tacos al Pastor': 39.00,
        'Pizza Mexicana': 180.00,
        'Refresco': 39.00,
        'Agua de Jamaica': 39.50,
        'Ensalada César': 95.00,
        'Limonada Natural': 47.00,
        'Burrito de Carne Asada': 100.00,
        'Nachos con Queso': 70.00,
        'Agua Mineral': 50.00,
        'Quesadillas': 30.00,
        'Sopa de Tortilla': 45.75,
        'Refresco de Cola': 30.00
    };
    
    return precios[nombre] || 50.00;
}

function inicializarSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
            menuToggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
        });
    }

    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('active')) {
            const clickInsideSidebar = sidebar.contains(e.target);
            const clickOnToggle = menuToggle.contains(e.target);
            if (!clickInsideSidebar && !clickOnToggle) {
                sidebar.classList.remove("active");
                menuToggle.textContent = "☰";
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const originalActualizarDetallesPanel = window.actualizarDetallesPanel;
    if (originalActualizarDetallesPanel) {
        window.actualizarDetallesPanel = function(pedido) {
            originalActualizarDetallesPanel(pedido);
            document.dispatchEvent(new CustomEvent('carruselChanged'));
        };
    }
});