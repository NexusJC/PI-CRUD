import { pool } from "../db.js";

// Crear una orden
export const createOrder = async (req, res) => {
  try {
    const { customerName, items, total } = req.body;
    const userId = req.user?.id || null;

    // 🔥 1. Obtener cajas ACTIVAS
    const [cajas] = await pool.query(
      "SELECT id FROM cajas WHERE estado = 'activa' ORDER BY id ASC"
    );

    if (cajas.length === 0) {
      return res.status(400).json({ message: "No hay cajas activas disponibles" });
    }

    // Recuperar la última caja usada
    const [cfg] = await pool.query("SELECT last_caja_id FROM config WHERE id = 1");
    let lastCaja = cfg[0].last_caja_id;

    // Encontrar la siguiente caja en secuencia
    let nextIndex = 0;

    if (lastCaja !== null) {
      const pos = cajas.findIndex(c => c.id === lastCaja);
      nextIndex = (pos + 1) % cajas.length;
    }

    const cajaAsignada = cajas[nextIndex].id;

    // Guardar la nueva última caja
    await pool.query("UPDATE config SET last_caja_id = ? WHERE id = 1", [cajaAsignada]);

    // 🔥 3. Obtener último número de orden
    const [last] = await pool.query(
      "SELECT order_number FROM orders ORDER BY id DESC LIMIT 1"
    );

    const nextOrder = last.length ? last[0].order_number + 1 : 1;

    // 🔥 4. Crear encabezado de la orden **YA CON caja_id**
    const [orderResult] = await pool.query(
      `INSERT INTO orders (order_number, customer_name, total, user_id, caja_id)
      VALUES (?, ?, ?, ?, ?)`,
      [nextOrder, customerName || "Cliente", total, userId, cajaAsignada] // ✔ CORRECTO
    );

    const orderId = orderResult.insertId;

    // 🔥 5. Insertar detalles
    for (const item of items) {
      const name = item.name ?? item.nombre;
      const quantity = item.quantity ?? item.qty ?? item.cantidad ?? 1;
      const price = item.price ?? item.unit ?? item.precio ?? 0;
      const comments = item.comments ?? item.comment ?? item.comentario ?? "";

      await pool.query(
        `INSERT INTO order_details (order_id, dish_name, quantity, price, comments)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, name, quantity, price, comments]
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

// Obtener órdenes en pendiente y en proceso por caja
export const getOrders = async (req, res) => {
  try {
    const caja_id = req.query.caja_id;

    if (!caja_id) {
      return res.status(400).json({ error: "Falta caja_id" });
    }

    // Obtener órdenes de ESTA caja
    const [rows] = await pool.query(
      `SELECT id, order_number, customer_name, total, status, created_at,
        COUNT(od.id) AS items_count
       FROM orders o
       LEFT JOIN order_details od ON od.order_id = o.id
       WHERE o.caja_id = ?
         AND o.status IN ('pendiente','en_proceso')
       GROUP BY o.id
       ORDER BY order_number ASC`,
      [caja_id]
    );

    // Si no hay órdenes → regresamos vacías
    if (rows.length === 0) {
      return res.json(rows);
    }

    // Primera orden del carrusel
    const first = rows[0];

    // Si la primera está pendiente → ponerla EN PROCESO AUTOMÁTICAMENTE
    if (first.status === "pendiente") {
      await pool.query(
        "UPDATE orders SET status = 'en_proceso' WHERE id = ?",
        [first.id]
      );

      first.status = "en_proceso"; // actualizar en memoria
      rows[0] = first;
    }

    res.json(rows);
  } catch (error) {
    console.log("ERROR getOrders:", error);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
};

// Obtener detalles del pedido
export const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    const [[order]] = await pool.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );

    const [items] = await pool.query(
      "SELECT dish_name, quantity, price, comments FROM order_details WHERE order_id = ?",
      [orderId]
    );

    res.json({ order, items });
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo detalles" });
  }
};

// Entregar pedido
export const deliverOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Marcar como ENTREGADO
    const [current] = await pool.query(
      "SELECT caja_id FROM orders WHERE id = ? AND status = 'en_proceso'",
      [id]
    );

    if (current.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden entregar pedidos en proceso"
      });
    }

    const cajaId = current[0].caja_id;

    await pool.query(
      "UPDATE orders SET status = 'entregado' WHERE id = ?",
      [id]
    );

    // 2. Buscar el siguiente, PERO SOLO DE ESTA CAJA
    const [next] = await pool.query(
      `SELECT id
       FROM orders
       WHERE caja_id = ?
         AND status = 'pendiente'
       ORDER BY order_number ASC
       LIMIT 1`,
      [cajaId]
    );

    if (next.length > 0) {
      await pool.query(
        "UPDATE orders SET status = 'en_proceso' WHERE id = ?",
        [next[0].id]
      );
    }

    res.json({
      success: true,
      message: "Pedido entregado y turno avanzado"
    });
  } catch (error) {
    console.log("ERROR deliverOrder:", error);
    res.status(500).json({ error: "Error entregando el pedido" });
  }
};

// Cancelar pedido
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Cancelar el pedido
    await pool.query(
      "UPDATE orders SET status = 'cancelado' WHERE id = ?",
      [id]
    );

    // 2) Ver si todavía hay un pedido en_proceso
    const [procesos] = await pool.query(
      "SELECT id FROM orders WHERE status = 'en_proceso' LIMIT 1"
    );

    if (procesos.length === 0) {
      // 3) Si NO hay en_proceso, tomamos el siguiente pendiente y lo ponemos en_proceso
      const [next] = await pool.query(
        "SELECT id FROM orders WHERE status = 'pendiente' ORDER BY order_number ASC LIMIT 1"
      );

      if (next.length > 0) {
        await pool.query(
          "UPDATE orders SET status = 'en_proceso' WHERE id = ?",
          [next[0].id]
        );
      }
    }

    res.json({ success: true, message: "Pedido cancelado" });
  } catch (error) {
    console.log("ERROR cancelOrder:", error);
    res.status(500).json({ error: "Error cancelando el pedido" });
  }
};

// Editar pedido
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;

  try {
    // Validación mínima
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El pedido debe tener items" });
    }

    // 1. Eliminar detalles anteriores
    await pool.query("DELETE FROM order_details WHERE order_id = ?", [id]);

    // 2. Insertar nuevos detalles
    for (const item of items) {
      const name = item.nombre ?? item.name;
      const quantity =
        item.cantidad ?? item.quantity ?? item.qty ?? 1;
      const price =
        item.precio ?? item.price ?? item.unit ?? 0;
      const comments =
        item.comments ?? item.comentario ?? item.comment ?? "";

      await pool.query(
        `INSERT INTO order_details (order_id, dish_name, quantity, price, comments)
         VALUES (?, ?, ?, ?, ?)`,
        [id, name, quantity, price, comments]
      );
    }

    // 3. Calcular y actualizar total
    const total = items.reduce((acc, it) => {
      const quantity =
        it.cantidad ?? it.quantity ?? it.qty ?? 1;
      const price =
        it.precio ?? it.price ?? it.unit ?? 0;
      return acc + quantity * price;
    }, 0);

    await pool.query(
      "UPDATE orders SET total = ? WHERE id = ?",
      [total, id]
    );

    res.json({
      success: true,
      message: "Pedido actualizado",
      total
    });
  } catch (error) {
    console.log("ERROR updateOrder:", error);
    res.status(500).json({ error: "Error actualizando el pedido" });
  }
};

// Obtener todos los pedidos
export const getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, order_number, customer_name, total, status, caja_id, created_at
       FROM orders
       ORDER BY order_number ASC`
    );

    res.json(rows);
  } catch (error) {
    console.log("ERROR getAllOrders:", error);
    res.status(500).json({ error: "Error obteniendo todos los pedidos" });
  }
};
