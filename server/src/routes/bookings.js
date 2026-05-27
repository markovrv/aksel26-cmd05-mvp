import express from "express";
import { dbGet, dbAll, dbRun, transaction } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Создать бронь
router.post("/", authenticateToken, async (req, res) => {
	try {
		const { slot_id, participants_count } = req.body;

		if (!slot_id || !participants_count) {
			return res
				.status(400)
				.json({ error: "Недостаточно данных для бронирования" });
		}

		if (participants_count < 1) {
			return res
				.status(400)
				.json({ error: "Количество участников должно быть больше 0" });
		}

		const result = await transaction(async () => {
			const slot = await dbGet(
				"SELECT * FROM slots WHERE id = ? AND is_cancelled = 0",
				[slot_id],
			);

			if (!slot) {
				throw new Error("Слот не найден или отменён");
			}

			if (slot.available_slots < participants_count) {
				throw new Error("Недостаточно свободных мест");
			}

			const total_price = slot.price_per_person * participants_count;

			const updateResult = await dbRun(
				"UPDATE slots SET available_slots = available_slots - ? WHERE id = ? AND available_slots >= ?",
				[participants_count, slot_id, participants_count],
			);

			if (updateResult.changes === 0) {
				throw new Error("Недостаточно свободных мест (race condition)");
			}

			const bookingResult = await dbRun(
				`INSERT INTO bookings (user_id, slot_id, participants_count, total_price, status)
	         VALUES (?, ?, ?, ?, 'pending')`,
				[req.user.id, slot_id, participants_count, total_price],
			);

			return {
				booking_id: bookingResult.lastInsertRowid,
				total_price,
				participants_count,
			};
		});

		res.status(201).json({
			booking_id: result.booking_id,
			total_price: result.total_price,
			participants_count: result.participants_count,
			message: "Бронь создана, ожидает оплаты",
		});
	} catch (err) {
		console.error("Ошибка создания брони:", err);
		res.status(400).json({ error: err.message });
	}
});

// Мои бронирования
router.get("/my", authenticateToken, async (req, res) => {
	try {
		const bookings = await dbAll(
			`
	      SELECT b.*, s.start_datetime, s.end_datetime,
	             e.title as excursion_title, e.duration_minutes,
	             ent.name as enterprise_name, ent.city
	      FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      WHERE b.user_id = ?
	      ORDER BY s.start_datetime DESC
	    `,
			[req.user.id],
		);

		res.json(bookings);
	} catch (err) {
		console.error("Ошибка получения бронирований:", err);
		res.status(500).json({ error: "Ошибка при получении бронирований" });
	}
});

// Получить одно бронирование
router.get("/:id", authenticateToken, async (req, res) => {
	try {
		const booking = await dbGet(
			`
	      SELECT b.*, s.start_datetime, s.end_datetime,
	             e.title as excursion_title, e.duration_minutes,
	             ent.name as enterprise_name, ent.city
	      FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      WHERE b.id = ?
	    `,
			[req.params.id],
		);

		if (!booking) {
			return res.status(404).json({ error: "Бронирование не найдено" });
		}

		if (req.user.role !== "admin" && req.user.id !== booking.user_id) {
			if (req.user.role === "b2b_employee") {
				const isOwner = await dbGet(
					`
	          SELECT 1 FROM bookings b
	          JOIN slots s ON b.slot_id = s.id
	          JOIN excursions e ON s.excursion_id = e.id
	          WHERE b.id = ? AND e.enterprise_id = ?
	        `,
					[req.params.id, req.user.enterprise_id],
				);

				if (!isOwner) {
					return res.status(403).json({ error: "Доступ запрещён" });
				}
			} else {
				return res.status(403).json({ error: "Доступ запрещён" });
			}
		}

		const souvenirOrders = await dbAll(
			`
	      SELECT so.*, sv.name as souvenir_name, sv.photo_url
	      FROM souvenir_orders so
	      JOIN souvenirs sv ON so.souvenir_id = sv.id
	      WHERE so.booking_id = ?
	    `,
			[req.params.id],
		);

		res.json({ ...booking, souvenir_orders: souvenirOrders });
	} catch (err) {
		console.error("Ошибка получения бронирования:", err);
		res.status(500).json({ error: "Ошибка при получении бронирования" });
	}
});

// Отменить бронь
router.patch("/:id/cancel", authenticateToken, async (req, res) => {
	try {
		const booking = await dbGet("SELECT * FROM bookings WHERE id = ?", [
			req.params.id,
		]);

		if (!booking) {
			return res.status(404).json({ error: "Бронирование не найдено" });
		}

		if (booking.user_id !== req.user.id && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		if (!["pending", "paid"].includes(booking.status)) {
			return res
				.status(400)
				.json({ error: "Невозможно отменить бронь в текущем статусе" });
		}

		await transaction(async () => {
			await dbRun(
				"UPDATE slots SET available_slots = available_slots + ? WHERE id = ?",
				[booking.participants_count, booking.slot_id],
			);

			await dbRun(
				`UPDATE bookings SET status = 'cancelled', cancellation_date = datetime('now') WHERE id = ?`,
				[req.params.id],
			);
		});

		res.json({ message: "Бронь отменена" });
	} catch (err) {
		console.error("Ошибка отмены брони:", err);
		res.status(500).json({ error: "Ошибка при отмене брони" });
	}
});

// Отметить как проведённую (b2b)
router.patch("/:id/complete", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const booking = await dbGet(
			`
	      SELECT b.*, e.enterprise_id FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      WHERE b.id = ?
	    `,
			[req.params.id],
		);

		if (!booking) {
			return res.status(404).json({ error: "Бронирование не найдено" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id !== booking.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		await dbRun(`UPDATE bookings SET status = 'completed' WHERE id = ?`, [
			req.params.id,
		]);
		res.json({ message: "Экскурсия отмечена как проведённая" });
	} catch (err) {
		console.error("Ошибка завершения экскурсии:", err);
		res.status(500).json({ error: "Ошибка при завершении экскурсии" });
	}
});

// Заявки по предприятию (b2b)
router.get("/enterprise/list", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const enterpriseId =
			req.user.role === "admin" ? null : req.user.enterprise_id;

		let sql = `
	      SELECT b.*, s.start_datetime, u.full_name as user_name, u.email as user_email,
	             e.title as excursion_title
	      FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN users u ON b.user_id = u.id
	    `;

		const params = [];
		if (enterpriseId) {
			sql += " WHERE e.enterprise_id = ?";
			params.push(enterpriseId);
		}

		sql += " ORDER BY s.start_datetime DESC";

		const bookings = await dbAll(sql, params);
		res.json(bookings);
	} catch (err) {
		console.error("Ошибка получения заявок:", err);
		res.status(500).json({ error: "Ошибка при получении заявок" });
	}
});

export default router;
