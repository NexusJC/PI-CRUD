/*************************************************
 *  SISTEMA DE VISUALIZACIÓN DE ÓRDENES
 *  Solo visualización y cancelación
 *************************************************/

document.addEventListener("DOMContentLoaded", function() {
    console.log("🔄 Inicializando sistema de órdenes...");
    
    /*************************************************
     *  ELEMENTOS DEL DOM
     *************************************************/
    // Sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const closeSidebar = document.getElementById("closeSidebar");
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
    
    if (closeSidebar) {
        closeSidebar.addEventListener("click", closeSidebarFunc);
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
     *  GESTIÓN DE ÓRDENES
     *************************************************/
    
    function updateMyOrderCard() {
        if (!myOrder) {
            if (myOrderCard) myOrderCard.style.display = "none";
            return;
        }
        
        if (myOrderCard) {
            myOrderCard.style.display = "block";
            
            // Actualizar información básica
            document.getElementById("myOrderNumber").textContent = `#${myOrder.id}`;
            document.getElementById("myOrderStatus").textContent = getStatusText(myOrder.status);
            document.getElementById("myPosition").textContent = `#${myOrder.position}`;
            document.getElementById("myEstimatedTime").textContent = `${myOrder.estimatedTime} min`;
            
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
                    itemsHtml += `
                        <li>
                            <span class="item-name">${item.name} x${item.quantity}</span>
                            <span class="item-price">$${item.price.toFixed(2)}</span>
                        </li>
                    `;
                });
                itemsList.innerHTML = itemsHtml;
            }
            
            if (orderTotal && myOrder.total) {
                orderTotal.textContent = myOrder.total.toFixed(2);
            }
        }
    }
    
    function updateProcessingOrdersList() {
        const processingList = document.getElementById("processingOrdersList");
        const emptyState = processingList.querySelector(".empty-state");
        const processingOrders = currentOrders.filter(o => o.status === 'processing');
        
        if (processingOrders.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            processingList.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><p>No hay órdenes en preparación</p></div>';
            return;
        }
        
        if (emptyState) emptyState.style.display = "none";
        
        // Ordenar por tiempo de creación
        processingOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        let html = '';
        processingOrders.forEach(order => {
            const timeAgo = getTimeAgo(order.createdAt);
            
            html += `
                <div class="order-item ${order.status}">
                    <div class="order-info">
                        <div class="order-number">#${order.id}</div>
                        <div class="order-customer">${order.customerName}</div>
                        <div class="order-details">${order.itemsCount} items • $${order.total.toFixed(2)}</div>
                        <div class="order-time">
                            <i class="fas fa-clock"></i> Hace ${timeAgo}
                        </div>
                    </div>
                </div>
            `;
        });
        
        processingList.innerHTML = html;
    }
    
    function updateCounters() {
        const processingCount = document.getElementById("processingCount");
        const processingOrders = currentOrders.filter(o => o.status === 'processing');
        
        if (processingCount) {
            processingCount.textContent = processingOrders.length;
        }
    }
    
    /*************************************************
     *  FUNCIONES AUXILIARES
     *************************************************/
    
    function getStatusText(status) {
        const statusMap = {
            'waiting': 'En espera',
            'processing': 'En preparación',
            'ready': 'Listo para recoger',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }
    
    function getTimeAgo(dateString) {
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
    
    /*************************************************
     *  CANCELACIÓN DE ORDEN
     *************************************************/
    
    function openCancelModal(order) {
        orderToCancel = order;
        cancelOrderNumber.textContent = `#${order.id}`;
        cancelModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
    
    function closeCancelModal() {
        cancelModal.style.display = "none";
        document.body.style.overflow = "";
        orderToCancel = null;
    }
    
    function cancelOrder() {
        if (!orderToCancel) return;
        
        // Cambiar estado de la orden
        const orderIndex = currentOrders.findIndex(o => o.id === orderToCancel.id);
        if (orderIndex !== -1) {
            currentOrders[orderIndex].status = 'cancelled';
            
            // Si es mi orden, actualizar
            if (myOrder && myOrder.id === orderToCancel.id) {
                myOrder.status = 'cancelled';
                updateMyOrderCard();
            }
            
            // Actualizar listas
            updateProcessingOrdersList();
            updateCounters();
            
            // Guardar cambios
            saveOrdersToStorage();
            
            // Mostrar mensaje
            showNotification(`❌ Orden #${orderToCancel.id} cancelada exitosamente`, 'danger');
            
            // Cerrar modal
            closeCancelModal();
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
     *  SIMULACIÓN DE ORDEN ACTUAL EN PREPARACIÓN
     *************************************************/
    
    function simulateCurrentOrder() {
        // Órdenes de ejemplo
        const exampleOrders = [
            { 
                id: 1001, 
                customer: "Juan Pérez",
                items: ["Hamburguesa Especial", "Papas Fritas", "Refresco"],
                time: "12 min"
            },
            { 
                id: 1002, 
                customer: "María García",
                items: ["Tacos al Pastor", "Orden de Guacamole"],
                time: "8 min"
            },
            { 
                id: 1003, 
                customer: "Carlos López",
                items: ["Enchiladas Verdes", "Sopa Tortilla"],
                time: "15 min"
            }
        ];
        
        let currentIndex = 0;
        
        function updateCurrentOrder() {
            const order = exampleOrders[currentIndex % exampleOrders.length];
            
            document.getElementById("currentOrderNumber").textContent = `#${order.id}`;
            document.getElementById("currentCustomer").textContent = order.customer;
            
            currentIndex++;
        }
        
        // Actualizar cada 45 segundos
        updateCurrentOrder();
        setInterval(updateCurrentOrder, 45000);
        
        // Simular timer
        let seconds = 0;
        function updateTimer() {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const timerString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            
            document.getElementById("currentTimer").textContent = timerString;
            document.getElementById("currentTimeElapsed").textContent = `${minutes} min`;
        }
        
        setInterval(updateTimer, 1000);
    }
    
    /*************************************************
     *  ALMACENAMIENTO LOCAL
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
        
        updateMyOrderCard();
        updateProcessingOrdersList();
        updateCounters();
    }
    
    function saveOrdersToStorage() {
        localStorage.setItem('currentOrders', JSON.stringify(currentOrders));
        localStorage.setItem('myOrder', JSON.stringify(myOrder));
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
    
    function init() {
        console.log("✅ Sistema de órdenes inicializado");
        
        // Inicializar tema
        initTheme();
        
        // Inicializar autenticación
        updateSidebarAuth();
        
        // Cargar órdenes desde almacenamiento
        loadOrdersFromStorage();
        
        // Iniciar simulación de orden actual
        simulateCurrentOrder();
        
        // Añadir órdenes de ejemplo si no hay ninguna
        if (currentOrders.length === 0) {
            setTimeout(() => {
                const exampleOrders = [
                    {
                        id: 1001,
                        customerName: "Cliente Ejemplo 1",
                        items: [
                            { name: "Hamburguesa Especial", quantity: 1, price: 85.50 },
                            { name: "Papas Fritas", quantity: 1, price: 25.00 },
                            { name: "Refresco", quantity: 1, price: 15.00 }
                        ],
                        total: 125.50,
                        itemsCount: 3,
                        status: 'processing',
                        createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
                        position: 1,
                        estimatedTime: 20
                    },
                    {
                        id: 1002,
                        customerName: "Cliente Ejemplo 2",
                        items: [
                            { name: "Tacos al Pastor", quantity: 3, price: 75.00 },
                            { name: "Orden de Guacamole", quantity: 1, price: 35.00 }
                        ],
                        total: 110.00,
                        itemsCount: 2,
                        status: 'processing',
                        createdAt: new Date(Date.now() - 8 * 60000).toISOString(), // 8 mins ago
                        position: 2,
                        estimatedTime: 15
                    },
                    {
                        id: 1003,
                        customerName: "Cliente Ejemplo 3",
                        items: [
                            { name: "Enchiladas Verdes", quantity: 1, price: 65.00 },
                            { name: "Sopa Tortilla", quantity: 1, price: 45.00 }
                        ],
                        total: 110.00,
                        itemsCount: 2,
                        status: 'waiting',
                        createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
                        position: 3,
                        estimatedTime: 25
                    }
                ];
                
                currentOrders = exampleOrders;
                
                // Asignar una orden al usuario actual si está logueado
                const token = localStorage.getItem("token");
                if (token) {
                    myOrder = exampleOrders[2]; // Asignar la orden en espera
                }
                
                updateMyOrderCard();
                updateProcessingOrdersList();
                updateCounters();
                saveOrdersToStorage();
            }, 1000);
        }
    }
    
    // Inicializar cuando el DOM esté listo
    init();
    
    // Actualizar autenticación al cambiar de página
    window.addEventListener("pageshow", updateSidebarAuth);
});