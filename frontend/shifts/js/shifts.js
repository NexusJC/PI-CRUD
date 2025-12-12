/*************************************************
 *  SISTEMA DE VISUALIZACIÓN DE ÓRDENES
 *  Conectado a API real
 *************************************************/

// Configuración de la API
const IS_LOCAL = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.port === '5500' || // Live Server
                 window.location.port === '3000';

// Usa esta URL base
const API_BASE_URL = IS_LOCAL ? 'http://localhost:3000/api' : 'https://tu-dominio.com/api';

document.addEventListener("DOMContentLoaded", function() {
    console.log("🔄 Inicializando sistema de órdenes...");
    
    /*************************************************
     *  ELEMENTOS DEL DOM
     *************************************************/
    // Sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.querySelector(".sidebar-overlay");
    const themeToggle = document.getElementById("themeToggle");
    
    // Reloj
    const clockDisplay = document.getElementById("currentTime");
    
    // Órdenes
    const cancelMyOrderBtn = document.getElementById("cancelMyOrderBtn");
    const myOrderCard = document.getElementById("myOrderCard");
    
    // Modal de cancelación
    const cancelModal = document.getElementById("cancelModal");
    const closeCancelModal = document.getElementById("closeCancelModal");
    const cancelCancelBtn = document.getElementById("cancelCancelBtn");
    const confirmCancelBtn = document.getElementById("confirmCancelBtn");
    const cancelOrderNumber = document.getElementById("cancelOrderNumber");
    
    // Autenticación
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const sidebarUserName = document.getElementById("sidebarUserName");
    const sidebarUserInfo = document.getElementById("sidebarUserInfo");
    
    /*************************************************
     *  VARIABLES GLOBALES
     *************************************************/
    let currentOrders = [];
    let myOrder = null;
    let orderToCancel = null;
    let cajaId = null; // ID de la caja del usuario
    
    /*************************************************
     *  SIDEBAR - FUNCIONALIDAD
     *************************************************/
    
    // Crear overlay si no existe
    if (!sidebarOverlay) {
        const overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }
    
    // Abrir sidebar
    function openSidebar() {
        sidebar.classList.add("active");
        document.querySelector(".sidebar-overlay").classList.add("active");
        document.body.style.overflow = "hidden";
        if (menuToggle) menuToggle.textContent = "✖";
    }
    
    // Cerrar sidebar
    function closeSidebarFunc() {
        sidebar.classList.remove("active");
        document.querySelector(".sidebar-overlay").classList.remove("active");
        document.body.style.overflow = "";
        if (menuToggle) menuToggle.textContent = "☰";
    }
    
    // Event listeners del sidebar
    if (menuToggle) {
        menuToggle.addEventListener("click", openSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebarFunc);
    }
    
    // Cerrar sidebar con ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && sidebar.classList.contains("active")) {
            closeSidebarFunc();
        }
    });
    
    /*************************************************
     *  MODO OSCURO
     *************************************************/
    
    function initTheme() {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
            updateThemeButton(true);
        }
    }
    
    function updateThemeButton(isDark) {
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector("i");
        const text = themeToggle.querySelector("span");
        
        if (icon && text) {
            if (isDark) {
                icon.className = "fas fa-sun";
                text.textContent = "Modo claro";
            } else {
                icon.className = "fas fa-moon";
                text.textContent = "Modo oscuro";
            }
        }
    }
    
    if (themeToggle) {
        themeToggle.addEventListener("click", function() {
            const isDark = document.body.classList.toggle("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            updateThemeButton(isDark);
        });
    }
    
    /*************************************************
     *  RELOJ EN TIEMPO REAL
     *************************************************/
    
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        if (clockDisplay) {
            clockDisplay.textContent = timeString;
        }
    }
    
    if (clockDisplay) {
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    /*************************************************
     *  AUTENTICACIÓN DE USUARIO
     *************************************************/
    
    function updateSidebarAuth() {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "null");
            
            if (!token || !user) {
                // Usuario no logueado
                if (btnLogin && btnLogout) {
                    btnLogin.style.display = "block";
                    btnLogout.style.display = "none";
                }
                if (sidebarUserName) sidebarUserName.textContent = "Te Damos La Bienvenida";
                if (sidebarUserInfo) sidebarUserInfo.textContent = "¡Explora el menú!";
                if (sidebarAvatar) sidebarAvatar.src = "../img/user.deflt.png";
                return;
            }
            
            // Usuario logueado
            if (btnLogin && btnLogout) {
                btnLogin.style.display = "none";
                btnLogout.style.display = "block";
            }
            
            // Actualizar información del usuario
            if (sidebarUserName) sidebarUserName.textContent = "Bienvenido/a";
            if (sidebarUserInfo && user.name) sidebarUserInfo.textContent = user.name;
            
            if (sidebarAvatar && user.image_url) {
                const avatarUrl = user.image_url.includes("http") 
                    ? user.image_url 
                    : `../uploads/${user.image_url}`;
                
                sidebarAvatar.src = avatarUrl;
                sidebarAvatar.onerror = function() {
                    this.src = "../img/user.deflt.png";
                };
            }
            
        } catch (error) {
            console.error("Error en autenticación:", error);
        }
    }
    
    // Logout
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            if (confirm("¿Estás seguro de cerrar sesión?")) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "../login/login.html";
            }
        });
    }
    
    /*************************************************
     *  CONEXIÓN A API - ÓRDENES
     *************************************************/
    
    async function fetchOrders() {
        try {
            const token = localStorage.getItem("token");
            
            if (!cajaId) {
                cajaId = await getUserCajaId();
            }
            
            // Añadir token a la petición
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE_URL}/orders/list?caja_id=${cajaId}`, {
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const orders = await response.json();
            return orders;
            
        } catch (error) {
            console.error('Error fetching orders:', error);
            
            // Si hay error, cargar datos de ejemplo
            if (currentOrders.length === 0) {
                loadExampleOrders();
            }
            
            return currentOrders;
        }
    }
    
    async function fetchMyOrders() {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "null");
            
            if (!token || !user) return null;
            
            // Usa el endpoint correcto
            const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expirado, cerrar sesión
                    localStorage.clear();
                    updateSidebarAuth();
                    return null;
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const myOrders = await response.json();
            return myOrders;
            
        } catch (error) {
            console.error('Error fetching my orders:', error);
            return null;
        }
    }
    
    async function cancelOrderAPI(orderId) {
        try {
            const token = localStorage.getItem("token");
            
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    }
    
    async function getOrderDetailsAPI(orderId) {
        try {
            const token = localStorage.getItem("token");
            
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const details = await response.json();
            return details;
            
        } catch (error) {
            console.error('Error fetching order details:', error);
            return null;
        }
    }
    
    /*************************************************
     *  GESTIÓN DE ÓRDENES
     *************************************************/
    
    async function loadAndDisplayOrders() {
        try {
            // Cargar órdenes de la API
            const orders = await fetchOrders();
            currentOrders = Array.isArray(orders) ? orders : [];
            
            // Cargar mi orden (si estoy logueado)
            const token = localStorage.getItem("token");
            if (token) {
                const myOrders = await fetchMyOrders();
                if (myOrders && Array.isArray(myOrders) && myOrders.length > 0) {
                    // Buscar la orden más reciente del usuario
                    myOrder = myOrders[0];
                    
                    // Obtener detalles completos de la orden
                    if (myOrder.id) {
                        const details = await getOrderDetailsAPI(myOrder.id);
                        if (details && details.items) {
                            myOrder.items = details.items;
                        }
                    }
                } else {
                    myOrder = null;
                }
            } else {
                myOrder = null;
            }
            
            // Actualizar la interfaz
            updateMyOrderCard();
            updateProcessingOrdersList();
            updateCounters();
            updateCurrentOrderDisplay();
            
            // Guardar en localStorage para offline
            saveOrdersToStorage();
            
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    
    function updateMyOrderCard() {
        if (!myOrder) {
            if (myOrderCard) myOrderCard.style.display = "none";
            return;
        }
        
        if (myOrderCard) {
            myOrderCard.style.display = "block";
            
            // Actualizar información básica
            document.getElementById("myOrderNumber").textContent = `#${myOrder.order_number || myOrder.id}`;
            document.getElementById("myOrderStatus").textContent = getStatusText(myOrder.status);
            
            // Calcular posición
            if (myOrder.position) {
                document.getElementById("myPosition").textContent = `#${myOrder.position}`;
            } else {
                // Calcular posición basada en órdenes en proceso
                const processingOrders = currentOrders.filter(o => o.status === 'en_proceso' || o.status === 'pendiente');
                const position = processingOrders.findIndex(o => o.id === myOrder.id) + 1;
                document.getElementById("myPosition").textContent = position > 0 ? `#${position}` : '--';
            }
            
            // Tiempo estimado
            const estimatedTime = calculateEstimatedTime(myOrder);
            document.getElementById("myEstimatedTime").textContent = `${estimatedTime} min`;
            
            // Actualizar estado
            const statusBadge = myOrderCard.querySelector(".status-badge");
            if (statusBadge) {
                statusBadge.className = `status-badge ${myOrder.status}`;
                statusBadge.textContent = getStatusText(myOrder.status);
            }
            
            // Actualizar items de la orden
            const itemsList = document.getElementById("itemsList");
            const orderTotal = document.getElementById("myOrderTotal");
            
            if (itemsList && myOrder.items) {
                let itemsHtml = '';
                myOrder.items.forEach(item => {
                    const name = item.dish_name || item.name || 'Producto';
                    const quantity = item.quantity || 1;
                    const price = item.price || 0;
                    
                    itemsHtml += `
                        <li>
                            <span class="item-name">${name} x${quantity}</span>
                            <span class="item-price">$${parseFloat(price).toFixed(2)}</span>
                        </li>
                    `;
                });
                itemsList.innerHTML = itemsHtml;
            }
            
            if (orderTotal && myOrder.total) {
                orderTotal.textContent = parseFloat(myOrder.total).toFixed(2);
            }
        }
    }
    
    function updateProcessingOrdersList() {
        const processingList = document.getElementById("processingOrdersList");
        const emptyState = processingList.querySelector(".empty-state");
        const processingOrders = currentOrders.filter(o => 
            o.status === 'en_proceso' || o.status === 'pendiente'
        );
        
        if (processingOrders.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            processingList.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><p>No hay órdenes en preparación</p></div>';
            return;
        }
        
        if (emptyState) emptyState.style.display = "none";
        
        // Ordenar por order_number o created_at
        processingOrders.sort((a, b) => {
            if (a.order_number && b.order_number) return a.order_number - b.order_number;
            return new Date(a.created_at) - new Date(b.created_at);
        });
        
        let html = '';
        processingOrders.forEach(order => {
            const timeAgo = getTimeAgo(order.created_at);
            const statusText = getStatusText(order.status);
            
            html += `
                <div class="order-item ${order.status}">
                    <div class="order-info">
                        <div class="order-number">#${order.order_number || order.id}</div>
                        <div class="order-customer">${order.customer_name || 'Cliente'}</div>
                        <div class="order-details">${order.items_count || '?'} items • $${parseFloat(order.total || 0).toFixed(2)}</div>
                        <div class="order-status-indicator">${statusText}</div>
                        <div class="order-time">
                            <i class="fas fa-clock"></i> Hace ${timeAgo}
                        </div>
                    </div>
                </div>
            `;
        });
        
        processingList.innerHTML = html;
    }
    
    function updateCurrentOrderDisplay() {
        // Encontrar la orden actualmente en proceso
        const currentOrder = currentOrders.find(o => o.status === 'en_proceso');
        
        if (currentOrder) {
            document.getElementById("currentOrderNumber").textContent = `#${currentOrder.order_number}`;
            document.getElementById("currentCustomer").textContent = currentOrder.customer_name || 'Cliente';
            
            // Actualizar timer si es necesario
            startCurrentOrderTimer(currentOrder.created_at);
        } else {
            document.getElementById("currentOrderNumber").textContent = "#--";
            document.getElementById("currentCustomer").textContent = "Esperando...";
        }
    }
    
    function updateCounters() {
        const processingCount = document.getElementById("processingCount");
        const processingOrders = currentOrders.filter(o => 
            o.status === 'en_proceso' || o.status === 'pendiente'
        );
        
        if (processingCount) {
            processingCount.textContent = processingOrders.length;
        }
    }
    
    /*************************************************
     *  FUNCIONES AUXILIARES
     *************************************************/
    
    function getStatusText(status) {
        const statusMap = {
            'pendiente': 'En espera',
            'en_proceso': 'En preparación',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado',
            'processing': 'En preparación',
            'waiting': 'En espera',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }
    
    function getTimeAgo(dateString) {
        if (!dateString) return '--';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'menos de 1 min';
        if (diffMins === 1) return '1 min';
        if (diffMins < 60) return `${diffMins} mins`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return '1 hora';
        return `${diffHours} horas`;
    }
    
    function calculateEstimatedTime(order) {
        // Estimación simple basada en posición
        const processingOrders = currentOrders.filter(o => 
            o.status === 'en_proceso' || o.status === 'pendiente'
        );
        
        // Ordenar para encontrar posición
        processingOrders.sort((a, b) => {
            if (a.order_number && b.order_number) return a.order_number - b.order_number;
            return new Date(a.created_at) - new Date(b.created_at);
        });
        
        const position = processingOrders.findIndex(o => o.id === order.id) + 1;
        
        // Estimación: 15 minutos por posición
        return position * 15;
    }
    
    function startCurrentOrderTimer(startTime) {
        if (!startTime) return;
        
        const start = new Date(startTime);
        const timerElement = document.getElementById("currentTimer");
        const timeElapsedElement = document.getElementById("currentTimeElapsed");
        
        function updateTimer() {
            const now = new Date();
            const diffMs = now - start;
            const diffMins = Math.floor(diffMs / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);
            
            // Formato MM:SS
            const timerString = `${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
            
            if (timerElement) timerElement.textContent = timerString;
            if (timeElapsedElement) timeElapsedElement.textContent = `${diffMins} min`;
        }
        
        // Actualizar inmediatamente y cada segundo
        updateTimer();
        setInterval(updateTimer, 1000);
    }
    
    /*************************************************
     *  CANCELACIÓN DE ORDEN
     *************************************************/
    
    function openCancelModal(order) {
        orderToCancel = order;
        cancelOrderNumber.textContent = `#${order.order_number || order.id}`;
        cancelModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
    
    function closeCancelModal() {
        cancelModal.style.display = "none";
        document.body.style.overflow = "";
        orderToCancel = null;
    }
    
    async function cancelOrder() {
        if (!orderToCancel) return;
        
        try {
            // Llamar a la API para cancelar
            const result = await cancelOrderAPI(orderToCancel.id);
            
            if (result.success) {
                // Actualizar estado localmente
                const orderIndex = currentOrders.findIndex(o => o.id === orderToCancel.id);
                if (orderIndex !== -1) {
                    currentOrders[orderIndex].status = 'cancelado';
                }
                
                // Si es mi orden, actualizar
                if (myOrder && myOrder.id === orderToCancel.id) {
                    myOrder.status = 'cancelado';
                    updateMyOrderCard();
                }
                
                // Actualizar listas
                updateProcessingOrdersList();
                updateCounters();
                updateCurrentOrderDisplay();
                
                // Guardar cambios
                saveOrdersToStorage();
                
                // Mostrar mensaje
                showNotification(`❌ Orden #${orderToCancel.order_number || orderToCancel.id} cancelada exitosamente`, 'danger');
                
                // Cerrar modal
                closeCancelModal();
            } else {
                throw new Error(result.message || 'Error al cancelar');
            }
            
        } catch (error) {
            console.error('Error canceling order:', error);
            showNotification('❌ Error al cancelar la orden', 'danger');
        }
    }
    
    // Event listeners para cancelación
    if (cancelMyOrderBtn) {
        cancelMyOrderBtn.addEventListener("click", function() {
            if (myOrder) {
                openCancelModal(myOrder);
            }
        });
    }
    
    if (closeCancelModal) {
        closeCancelModal.addEventListener("click", closeCancelModal);
    }
    
    if (cancelCancelBtn) {
        cancelCancelBtn.addEventListener("click", closeCancelModal);
    }
    
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener("click", cancelOrder);
    }
    
    // Cerrar modal al hacer clic fuera
    if (cancelModal) {
        cancelModal.addEventListener("click", function(e) {
            if (e.target === cancelModal) {
                closeCancelModal();
            }
        });
    }
    
    // Cerrar modal con ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && cancelModal.style.display === "flex") {
            closeCancelModal();
        }
    });
    
    /*************************************************
     *  ALMACENAMIENTO LOCAL Y EJEMPLOS
     *************************************************/
    
    function loadOrdersFromStorage() {
        const savedOrders = localStorage.getItem('currentOrders');
        const savedMyOrder = localStorage.getItem('myOrder');
        
        if (savedOrders) {
            currentOrders = JSON.parse(savedOrders);
        }
        
        if (savedMyOrder) {
            myOrder = JSON.parse(savedMyOrder);
        }
    }
    
    function saveOrdersToStorage() {
        localStorage.setItem('currentOrders', JSON.stringify(currentOrders));
        if (myOrder) {
            localStorage.setItem('myOrder', JSON.stringify(myOrder));
        }
    }
    
    function loadExampleOrders() {
        // Datos de ejemplo cuando no hay conexión
        const exampleOrders = [
            {
                id: 1001,
                order_number: 1001,
                customer_name: "Cliente Ejemplo 1",
                total: 125.50,
                status: 'en_proceso',
                created_at: new Date(Date.now() - 15 * 60000).toISOString(),
                caja_id: 1,
                items_count: 3
            },
            {
                id: 1002,
                order_number: 1002,
                customer_name: "Cliente Ejemplo 2",
                total: 110.00,
                status: 'pendiente',
                created_at: new Date(Date.now() - 8 * 60000).toISOString(),
                caja_id: 1,
                items_count: 2
            }
        ];
        
        currentOrders = exampleOrders;
        
        // Datos de ejemplo para mi orden si estoy logueado
        const token = localStorage.getItem("token");
        if (token) {
            myOrder = {
                id: 1002,
                order_number: 1002,
                customer_name: "Tú (Cliente Ejemplo)",
                total: 110.00,
                status: 'pendiente',
                created_at: new Date(Date.now() - 8 * 60000).toISOString(),
                items: [
                    { dish_name: "Tacos al Pastor", quantity: 3, price: 25.00 },
                    { dish_name: "Orden de Guacamole", quantity: 1, price: 35.00 }
                ]
            };
        }
    }
    
    /*************************************************
     *  NOTIFICACIONES
     *************************************************/
    
    function showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : 'check-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Añadir al body
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /*************************************************
     *  INICIALIZACIÓN
     *************************************************/
    
    async function init() {
        console.log("✅ Sistema de órdenes inicializado");
        
        // Inicializar tema
        initTheme();
        
        // Inicializar autenticación
        updateSidebarAuth();
        
        // Cargar órdenes desde almacenamiento (offline)
        loadOrdersFromStorage();
        
        // Intentar cargar órdenes desde API
        await loadAndDisplayOrders();
        
        // Configurar actualización periódica
        setInterval(async () => {
            await loadAndDisplayOrders();
        }, 30000); // Actualizar cada 30 segundos
        
        // Actualizar autenticación al cambiar de página
        window.addEventListener("pageshow", updateSidebarAuth);
    }
    
    // Helper para obtener caja_id del usuario
    async function getUserCajaId() {
        // Primero intenta obtener del usuario
        const user = JSON.parse(localStorage.getItem("user") || "null");
        
        if (user && user.caja_id) {
            localStorage.setItem('caja_id', user.caja_id);
            return user.caja_id;
        }
        
        // Si no, intenta obtener del localStorage
        const savedCajaId = localStorage.getItem('caja_id');
        if (savedCajaId) return parseInt(savedCajaId);
        
        // Si eres administrador, usa caja_id = 1 por defecto
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Opcional: hacer una petición para obtener la caja asignada
                // Por ahora, usa 1 por defecto
                return 1;
            } catch (error) {
                console.error('Error getting caja_id:', error);
                return 1;
            }
        }
        
        // Para visitantes, usa caja_id = 1 (general)
        return 1;
    }
    
    // Inicializar cuando el DOM esté listo
    init();
});