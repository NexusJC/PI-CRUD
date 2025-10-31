let editoresOriginal = [];
let editoresFiltrados = [];
let sortField = 'nombre';
let sortDirection = 'asc';
let searchTerm = '';
function cargarEditores() {
    editoresOriginal = [
        {
            Usuario_ID: 1,
            Nombre: "Ana García",
            Correo: "ana.garcia@ejemplo.com",
            estado: "activo",
            total_posts: 15,
            total_visitas: 2450
        },
        {
            Usuario_ID: 2,
            Nombre: "Carlos López",
            Correo: "carlos.lopez@ejemplo.com",
            estado: "activo",
            total_posts: 8,
            total_visitas: 1200
        },
        {
            Usuario_ID: 3,
            Nombre: "María Rodríguez",
            Correo: "maria.rodriguez@ejemplo.com",
            estado: "inactivo",
            total_posts: 22,
            total_visitas: 3800
        },
        {
            Usuario_ID: 4,
            Nombre: "Javier Martínez",
            Correo: "javier.martinez@ejemplo.com",
            estado: "activo",
            total_posts: 5,
            total_visitas: 600
        },
        {
            Usuario_ID: 5,
            Nombre: "Beatriz Sánchez",
            Correo: "beatriz.sanchez@ejemplo.com",
            estado: "inactivo",
            total_posts: 12,
            total_visitas: 1800
        },
        {
            Usuario_ID: 6,
            Nombre: "David Fernández",
            Correo: "david.fernandez@ejemplo.com",
            estado: "activo",
            total_posts: 18,
            total_visitas: 2100
        },
        {
            Usuario_ID: 7,
            Nombre: "Elena Torres",
            Correo: "elena.torres@ejemplo.com",
            estado: "activo",
            total_posts: 7,
            total_visitas: 850
        },
        {
            Usuario_ID: 8,
            Nombre: "Francisco Ruiz",
            Correo: "francisco.ruiz@ejemplo.com",
            estado: "inactivo",
            total_posts: 25,
            total_visitas: 4200
        },
        {
            Usuario_ID: 9,
            Nombre: "Gabriela Morales",
            Correo: "gabriela.morales@ejemplo.com",
            estado: "activo",
            total_posts: 11,
            total_visitas: 1500
        },
        {
            Usuario_ID: 10,
            Nombre: "Héctor Vargas",
            Correo: "hector.vargas@ejemplo.com",
            estado: "activo",
            total_posts: 3,
            total_visitas: 300
        }
    ];
    
    editoresFiltrados = [...editoresOriginal];
    aplicarFiltrosYOrdenamiento();
}

function aplicarFiltrosYOrdenamiento() {
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        editoresFiltrados = editoresOriginal.filter(editor => 
            editor.Nombre.toLowerCase().includes(term) ||
            editor.Correo.toLowerCase().includes(term)
        );
    } else {
        editoresFiltrados = [...editoresOriginal];
    }
    
    editoresFiltrados.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortField) {
            case 'nombre':
                valueA = a.Nombre.toLowerCase();
                valueB = b.Nombre.toLowerCase();
                break;
            case 'email':
                valueA = a.Correo.toLowerCase();
                valueB = b.Correo.toLowerCase();
                break;
            case 'posts':
                valueA = a.total_posts;
                valueB = b.total_posts;
                break;
            case 'estado':
                valueA = a.estado;
                valueB = b.estado;
                break;
            default:
                valueA = a.Nombre.toLowerCase();
                valueB = b.Nombre.toLowerCase();
        }
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    mostrarEditores();
}

function mostrarEditores() {
    const tbody = document.getElementById('editoresTableBody');
    const resultsCount = document.getElementById('resultsCount');
    
    const total = editoresOriginal.length;
    const filtrados = editoresFiltrados.length;
    
    if (searchTerm) {
        resultsCount.textContent = `Mostrando ${filtrados} de ${total} editores (filtrados por: "${searchTerm}")`;
    } else {
        resultsCount.textContent = `Mostrando todos los ${total} editores`;
    }
    
    if (editoresFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No se encontraron editores</td></tr>';
        return;
    }
    
    let html = '';
    editoresFiltrados.forEach(editor => {
        html += `
            <tr>
                <td>${escapeHtml(editor.Nombre)}</td>
                <td>${escapeHtml(editor.Correo)}</td>
                <td>${editor.total_posts.toLocaleString()}</td>
                <td>
                    <span class="status-badge ${editor.estado}">
                        ${editor.estado.charAt(0).toUpperCase() + editor.estado.slice(1)}
                    </span>
                </td>
                <td class="actions">
                    <button onclick="confirmarEliminacion(${editor.Usuario_ID})" 
                            class="btn-delete" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function ordenarPor(campo) {
    const sortableHeaders = document.querySelectorAll('.sortable');
    
    if (sortField === campo) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = campo;
        sortDirection = 'asc';
    }
    
    sortableHeaders.forEach(header => {
        header.classList.remove('asc', 'desc');
        if (header.dataset.sort === campo) {
            header.classList.add(sortDirection);
        }
    });
    
    aplicarFiltrosYOrdenamiento();
}

function buscarEditores(termino) {
    searchTerm = termino;
    aplicarFiltrosYOrdenamiento();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function confirmarEliminacion(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este editor?')) {
        console.log(`Eliminando editor con ID: ${id}`);
        
        editoresOriginal = editoresOriginal.filter(editor => editor.Usuario_ID !== id);
        aplicarFiltrosYOrdenamiento();
        
        alert(`Editor eliminado correctamente`);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    function toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        sidebarToggle.classList.toggle('hidden');
    }

    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    const overlay = document.querySelector('.sidebar-overlay');
    overlay.addEventListener('click', toggleSidebar);
});

document.addEventListener('DOMContentLoaded', function() {
    cargarEditores();
    
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            ordenarPor(this.dataset.sort);
        });
    });
    
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            buscarEditores(this.value.trim());
        }, 300); 
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarEditores(this.value.trim());
        }
    });
    
    const overlay = document.querySelector('.sidebar-overlay');
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }
});

function cargarEditoresDesdeAPI() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(editoresOriginal);
        }, 1000);
    });
}

function exportarDatos() {
    const datosExportar = searchTerm ? editoresFiltrados : editoresOriginal;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Nombre,Email,Posts,Estado\n"
        + datosExportar.map(editor => 
            `"${editor.Nombre}","${editor.Correo}",${editor.total_posts},"${editor.estado}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "editores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}