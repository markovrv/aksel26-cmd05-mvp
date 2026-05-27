import express from "express";
import { dbGet, dbAll, dbRun } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Получить уведомления текущего пользователя
router.get("/my", authenticateToken, async (req, res) => {
	try {
		const notifications = await dbAll(
			`
	      SELECT * FROM notifications
	      WHERE user_id = ?
	      ORDER BY created_at DESC
	    `,
			[req.user.id],
		);

		res.json(notifications);
	} catch (err) {
		console.error("Ошибка получения уведомлений:", err);
		res.status(500).json({ error: "Ошибка при получении уведомлений" });
	}
});

// Количество непрочитанных уведомлений
router.get("/unread/count", authenticateToken, async (req, res) => {
	try {
		const result = await dbGet(
			`
	      SELECT COUNT(*) as count FROM notifications
	      WHERE user_id = ? AND is_read = 0
	    `,
			[req.user.id],
		);

		res.json({ count: result.count });
	} catch (err) {
		console.error("Ошибка подсчёта уведомлений:", err);
		res.status(500).json({ error: "Ошибка при подсчёте уведомлений" });
	}
});

// Отметить уведомление как прочитанное
router.patch("/:id/read", authenticateToken, async (req, res) => {
	try {
		const notification = await dbGet(
			"SELECT * FROM notifications WHERE id = ? AND user_id = ?",
			[req.params.id, req.user.id],
		);

		if (!notification) {
			return res.status(404).json({ error: "Уведомление не найдено" });
		}

		await dbRun("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id]);
		res.json({ message: "Уведомление отмечено как прочитанное" });
	} catch (err) {
		console.error("Ошибка обновления уведомления:", err);
		res.status(500).json({ error: "Ошибка при обновлении уведомления" });
	}
});

// Отметить все как прочитанные
router.patch("/read-all", authenticateToken, async (req, res) => {
	try {
		await dbRun("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [
			req.user.id,
		]);
		res.json({ message: "Все уведомления отмечены как прочитанные" });
	} catch (err) {
		console.error("Ошибка обновления уведомлений:", err);
		res.status(500).json({ error: "Ошибка при обновлении уведомлений" });
	}
});

export default router;
