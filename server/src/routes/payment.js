import express from "express";
import { dbGet, dbRun, transaction } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";
import crypto from "crypto";

const router = express.Router();

// Эмулятор оплаты
router.post("/process", authenticateToken, async (req, res) => {
	try {
		const { booking_id, scenario } = req.body;

		if (!booking_id || !scenario) {
			return res.status(400).json({ error: "Недостаточно данных" });
		}

		if (!["success", "fail", "timeout"].includes(scenario)) {
			return res.status(400).json({ error: "Некорректный сценарий оплаты" });
		}

		const paymentResult = await transaction(async () => {
			const booking = await dbGet("SELECT * FROM bookings WHERE id = ?", [
				booking_id,
			]);

			if (!booking) {
				throw new Error("Бронирование не найдено");
			}

			if (booking.status !== "pending") {
				throw new Error("Бронирование уже обработано");
			}

			const payment_id = `PAY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

			switch (scenario) {
				case "success":
						await dbRun(
							`UPDATE bookings SET status = 'confirmed', payment_id = ? WHERE id = ?`,
							[payment_id, booking_id],
						);
					await dbRun(
						`INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'payment_success', ?, 0)`,
						[booking.user_id, `Оплата прошла успешно! Номер операции: ${payment_id}`],
					);
					return {
						success: true,
						payment_id,
						message: "Оплата прошла успешно",
					};

				case "fail":
					await dbRun(
						"UPDATE slots SET available_slots = available_slots + ? WHERE id = ?",
						[booking.participants_count, booking.slot_id],
					);
					await dbRun(
						`UPDATE bookings SET status = 'cancelled', cancellation_date = datetime('now') WHERE id = ?`,
						[booking_id],
					);
					await dbRun(
						`INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'payment_failed', ?, 0)`,
						[booking.user_id, "Оплата не прошла. Попробуйте ещё раз."],
					);
					return { success: false, payment_id: null, message: "Ошибка оплаты" };

				case "timeout":
					await dbRun(
						"UPDATE slots SET available_slots = available_slots + ? WHERE id = ?",
						[booking.participants_count, booking.slot_id],
					);
					await dbRun(
						`UPDATE bookings SET status = 'cancelled', cancellation_date = datetime('now') WHERE id = ?`,
						[booking_id],
					);
					await dbRun(
						`INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'payment_timeout', ?, 0)`,
						[booking.user_id, "Время ожидания оплаты истекло."],
					);
					return {
						success: false,
						payment_id: null,
						message: "Время ожидания истекло",
					};

				default:
					throw new Error("Неизвестный сценарий");
			}
		});

		if (scenario === "timeout") {
			setTimeout(() => {
				res.json(paymentResult);
			}, 3000);
		} else {
			res.json(paymentResult);
		}
	} catch (err) {
		console.error("Ошибка обработки оплаты:", err);
		res.status(400).json({ error: err.message });
	}
});

export default router;
