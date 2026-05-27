import express from "express";
import { dbGet, dbAll, dbRun } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Создать заказы в рамках бронирования
router.post("/", authenticateToken, async (req, res) => {
	try {
		const { booking_id, orders } = req.body;

		if (!booking_id || !orders || !Array.isArray(orders)) {
			return res.status(400).json({ error: "Недостаточно данных" });
		}

		const booking = await dbGet(
			"SELECT * FROM bookings WHERE id = ? AND user_id = ?",
			[booking_id, req.user.id],
		);

		if (!booking) {
			return res.status(404).json({ error: "Бронирование не найдено" });
		}

		const createdOrders = [];

		for (const order of orders) {
			const { souvenir_id, quantity, personalization_text } = order;

			if (!souvenir_id || !quantity) {
				continue;
			}

			const souvenir = await dbGet("SELECT * FROM souvenirs WHERE id = ?", [
				souvenir_id,
			]);

			if (!souvenir) {
				continue;
			}

			const final_price = souvenir.base_price * quantity;

			const result = await dbRun(
				`INSERT INTO souvenir_orders (booking_id, souvenir_id, quantity, personalization_text, final_price, status)
	         VALUES (?, ?, ?, ?, ?, 'pending')`,
				[
					booking_id,
					souvenir_id,
					quantity,
					personalization_text || null,
					final_price,
				],
			);

			createdOrders.push({
				id: result.lastInsertRowid,
				souvenir_id,
				quantity,
				final_price,
			});
		}

		res.status(201).json({ orders: createdOrders, message: "Заказы созданы" });
	} catch (err) {
		console.error("Ошибка создания заказов:", err);
		res.status(500).json({ error: "Ошибка при создании заказов" });
	}
});

// Список заказов брони
router.get("/:booking_id", authenticateToken, async (req, res) => {
	try {
		const orders = await dbAll(
			`
	      SELECT so.*, s.name as souvenir_name, s.photo_url, s.base_price
	      FROM souvenir_orders so
	      JOIN souvenirs s ON so.souvenir_id = s.id
	      WHERE so.booking_id = ?
	    `,
			[req.params.booking_id],
		);

		res.json(orders);
	} catch (err) {
		console.error("Ошибка получения заказов:", err);
		res.status(500).json({ error: "Ошибка при получении заказов" });
	}
});

// Подтвердить заказ (b2b)
router.patch("/:id/confirm", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const order = await dbGet(
			`
	      SELECT so.*, s.enterprise_id FROM souvenir_orders so
	      JOIN souvenirs s ON so.souvenir_id = s.id
	      WHERE so.id = ?
	    `,
			[req.params.id],
		);

		if (!order) {
			return res.status(404).json({ error: "Заказ не найден" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id != order.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		await dbRun(
			`UPDATE souvenir_orders SET status = 'confirmed', enterprise_confirmed = 1 WHERE id = ?`,
			[req.params.id],
		);
		res.json({ message: "Заказ подтверждён" });
	} catch (err) {
		console.error("Ошибка подтверждения заказа:", err);
		res.status(500).json({ error: "Ошибка при подтверждении заказа" });
	}
});

// Отклонить заказ (b2b)
router.patch("/:id/reject", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const order = await dbGet(
			`
	      SELECT so.*, s.enterprise_id FROM souvenir_orders so
	      JOIN souvenirs s ON so.souvenir_id = s.id
	      WHERE so.id = ?
	    `,
			[req.params.id],
		);

		if (!order) {
			return res.status(404).json({ error: "Заказ не найден" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id != order.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		await dbRun(`UPDATE souvenir_orders SET status = 'rejected' WHERE id = ?`, [
			req.params.id,
		]);
		res.json({ message: "Заказ отклонён" });
	} catch (err) {
		console.error("Ошибка отклонения заказа:", err);
		res.status(500).json({ error: "Ошибка при отклонении заказа" });
	}
});

// Список заказов мерча для предприятия (b2b)
router.get("/enterprise/list", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const enterpriseId =
			req.user.role === "admin" ? null : req.user.enterprise_id;

		let sql = `
	      SELECT so.*, s.name as souvenir_name, s.photo_url,
	             b.id as booking_id, b.status as booking_status,
	             u.full_name as user_name, u.email as user_email
	      FROM souvenir_orders so
	      JOIN souvenirs s ON so.souvenir_id = s.id
	      JOIN bookings b ON so.booking_id = b.id
	      JOIN users u ON b.user_id = u.id
	    `;

		const params = [];
		if (enterpriseId) {
			sql += " WHERE s.enterprise_id = ?";
			params.push(enterpriseId);
		}

		sql += " ORDER BY so.id DESC";

		const orders = await dbAll(sql, params);
		res.json(orders);
	} catch (err) {
		console.error("Ошибка получения заказов:", err);
		res.status(500).json({ error: "Ошибка при получении заказов" });
	}
});

export default router;
