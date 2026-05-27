import express from "express";
import { dbGet, dbAll, dbRun } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

// Создать отзыв (b2c, только для завершённых экскурсий с прошедшей датой)
router.post("/", authenticateToken, async (req, res) => {
	try {
		const { booking_id, rating, comment } = req.body;

		if (!booking_id || !rating) {
			return res.status(400).json({ error: "Недостаточно данных" });
		}

		if (rating < 1 || rating > 5) {
			return res.status(400).json({ error: "Рейтинг должен быть от 1 до 5" });
		}

		const booking = await dbGet(
			`
	      SELECT b.*, s.start_datetime FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      WHERE b.id = ? AND b.user_id = ?
	    `,
			[booking_id, req.user.id],
		);

		if (!booking) {
			return res.status(404).json({ error: "Бронирование не найдено" });
		}

		if (booking.status !== "completed") {
			return res
				.status(400)
				.json({
					error: "Оставить отзыв можно только после проведения экскурсии",
				});
		}

		const excursionDate = new Date(booking.start_datetime);
		const now = new Date();

		if (excursionDate > now) {
			return res
				.status(400)
				.json({
					error: "Оставить отзыв можно только после наступления даты экскурсии",
				});
		}

		const existingReview = await dbGet(
			"SELECT id FROM reviews WHERE booking_id = ?",
			[booking_id],
		);
		if (existingReview) {
			return res
				.status(400)
				.json({ error: "Отзыв на эту экскурсию уже существует" });
		}

		const result = await dbRun(
			`INSERT INTO reviews (user_id, booking_id, rating, comment, is_moderated)
	       VALUES (?, ?, ?, ?, 0)`,
			[req.user.id, booking_id, rating, comment || null],
		);

		res
			.status(201)
			.json({
				id: result.lastInsertRowid,
				message: "Отзыв отправлен на модерацию",
			});
	} catch (err) {
		console.error("Ошибка создания отзыва:", err);
		res.status(500).json({ error: "Ошибка при создании отзыва" });
	}
});

// Получить отзывы предприятия (публично, только модерация)
router.get("/:enterprise_id", async (req, res) => {
	try {
		const reviews = await dbAll(
			`
	      SELECT r.*, u.full_name as user_name, b.id as booking_id
	      FROM reviews r
	      JOIN users u ON r.user_id = u.id
	      JOIN bookings b ON r.booking_id = b.id
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      WHERE e.enterprise_id = ? AND r.is_moderated = 1
	      ORDER BY r.created_at DESC
	    `,
			[req.params.enterprise_id],
		);

		res.json(reviews);
	} catch (err) {
		console.error("Ошибка получения отзывов:", err);
		res.status(500).json({ error: "Ошибка при получении отзывов" });
	}
});

// Очередь модерации (admin)
router.get("/", authenticateToken, requireRole("admin"), async (req, res) => {
	try {
		const reviews = await dbAll(`
	      SELECT r.*, u.full_name as user_name, u.email as user_email,
	             e.title as excursion_title, ent.name as enterprise_name
	      FROM reviews r
	      JOIN users u ON r.user_id = u.id
	      JOIN bookings b ON r.booking_id = b.id
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      WHERE r.is_moderated = 0
	      ORDER BY r.created_at DESC
	    `);

		res.json(reviews);
	} catch (err) {
		console.error("Ошибка получения очереди модерации:", err);
		res.status(500).json({ error: "Ошибка при получении очереди модерации" });
	}
});

// Одобрить/отклонить отзыв (admin)
router.patch(
	"/:id/moderate",
	authenticateToken,
	requireRole("admin"),
	async (req, res) => {
		try {
			const { approved, moderator_comment } = req.body;

			if (approved) {
				await dbRun(
					"UPDATE reviews SET is_moderated = 1, moderator_comment = ? WHERE id = ?",
					[moderator_comment || null, req.params.id],
				);
				res.json({ message: "Отзыв одобрен" });
			} else {
				await dbRun("DELETE FROM reviews WHERE id = ?", [req.params.id]);
				res.json({ message: "Отзыв отклонён" });
			}
		} catch (err) {
			console.error("Ошибка модерации:", err);
			res.status(500).json({ error: "Ошибка при модерации" });
		}
	},
);

export default router;
