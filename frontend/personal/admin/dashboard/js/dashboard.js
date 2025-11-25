// GRAFICA — ÓRDENES ÚLTIMOS 7 DÍAS
const ctxOrders = document.getElementById("chartOrders");

new Chart(ctxOrders, {
    type: "line",
    data: {
        labels: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
        datasets: [{
            label: "Órdenes",
            data: [12, 17, 9, 14, 20, 18, 11],
            borderColor: "#e36842",
            backgroundColor: "rgba(227,104,66,0.2)",
            tension: 0.3,
            borderWidth: 3
        }]
    },
    options: {
        responsive: true
    }
});

// GRAFICA — PLATILLOS MÁS VENDIDOS
const ctxTop = document.getElementById("chartTopDishes");

new Chart(ctxTop, {
    type: "bar",
    data: {
        labels: ["Tacos", "Pozole", "Enchiladas", "Burritos"],
        datasets: [{
            label: "Ventas",
            data: [35, 50, 28, 43],
            backgroundColor: "#e36842"
        }]
    },
    options: {
        responsive: true
    }
});
