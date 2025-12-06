import { pool } from "../db.js";  

export const createOrder = async (req, res) => {
  try {
    const { customerName, items, total } = req.body;

    // Obtener último número
    const [last] = await pool.query(
      "SELECT order_number FROM orders ORDER BY id DESC LIMIT 1"
    );

    const nextOrder = last.length ? last[0].order_number + 1 : 401;

    // Crear encabezado
    const [orderResult] = await pool.query(
      "INSERT INTO orders (order_number, customer_name, total) VALUES (?, ?, ?)",
      [nextOrder, customerName || "Cliente", total]
    );

    const orderId = orderResult.insertId;

    // Insertar detalles
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_details (order_id, dish_name, quantity, price, comments)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.name,
          item.quantity,
          item.price,
          item.comments || ""
        ]
      );
    }

    res.json({
      success: true,
      orderNumber: nextOrder,
      message: "Pedido guardado correctamente"
    });

  } catch (error) {
    console.log("ERROR createOrder:", error);
    res.status(500).json({
      success: false,
      error: "Error al guardar el pedido"
    });
  }
};

export const getOrders = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.log("ERROR getOrders:", error);
    res.status(500).json({
      error: "Error al obtener pedidos"
    });
  }
};
