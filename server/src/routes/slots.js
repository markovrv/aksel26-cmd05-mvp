import express from "express";
import { dbGet, dbAll, dbRun } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Получить слоты по экскурсии
router.get("/:excursion_id", async (req, res) => {
	try {
		const slots = await dbAll(
			`
	      SELECT * FROM slots
	      WHERE excursion_id = ? AND start_datetime >= datetime('now') AND is_cancelled = 0
	      ORDER BY start_datetime ASC
	    `,
			[req.params.excursion_id],
		);

		res.json(slots);
	} catch (err) {
		console.error("Ошибка получения слотов:", err);
		res.status(500).json({ error: "Ошибка при получении слотов" });
	}
});

// Создать слот (b2b)
router.post("/", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const {
			excursion_id,
			start_datetime,
			end_datetime,
			available_slots,
			price_per_person,
		} = req.body;

		const excursion = await dbGet(
			"SELECT enterprise_id FROM excursions WHERE id = ?",
			[excursion_id],
		);

		if (!excursion) {
			return res.status(404).json({ error: "Экскурсия не найдена" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id != excursion.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		if (
			!start_datetime ||
			!end_datetime ||
			!available_slots ||
			!price_per_person
		) {
			return res
				.status(400)
				.json({ error: "Недостаточно данных для создания слота" });
		}

		const result = await dbRun(
			`INSERT INTO slots (excursion_id, start_datetime, end_datetime, available_slots, price_per_person)
	       VALUES (?, ?, ?, ?, ?)`,
			[
				excursion_id,
				start_datetime,
				end_datetime,
				available_slots,
				price_per_person,
			],
		);

		res
			.status(201)
			.json({ id: result.lastInsertRowid, message: "Слот создан" });
	} catch (err) {
		console.error("Ошибка создания слота:", err);
		res.status(500).json({ error: "Ошибка при создании слота" });
	}
});

// Редактировать слот
router.put("/:id", authenticateToken, async (req, res) => {
	try {
		const slot = await dbGet(
			`
	      SELECT s.*, e.enterprise_id FROM slots s
	      JOIN excursions e ON s.excursion_id = e.id
	      WHERE s.id = ?
	    `,
			[req.params.id],
		);

		if (!slot) {
			return res.status(404).json({ error: "Слот не найден" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id != slot.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const { start_datetime, end_datetime, available_slots, price_per_person } =
			req.body;

		await dbRun(
			`UPDATE slots SET
	       start_datetime = COALESCE(?, start_datetime),
	       end_datetime = COALESCE(?, end_datetime),
	       available_slots = COALESCE(?, available_slots),
	       price_per_person = COALESCE(?, price_per_person)
	       WHERE id = ?`,
			[
				start_datetime,
				end_datetime,
				available_slots,
				price_per_person,
				req.params.id,
			],
		);

		res.json({ message: "Слот обновлён" });
	} catch (err) {
		console.error("Ошибка обновления слота:", err);
		res.status(500).json({ error: "Ошибка при обновлении слота" });
	}
});

// Отменить слот
router.delete("/:id", authenticateToken, async (req, res) => {
	try {
		const slot = await dbGet(
			`
	      SELECT s.*, e.enterprise_id FROM slots s
	      JOIN excursions e ON s.excursion_id = e.id
	      WHERE s.id = ?
	    `,
			[req.params.id],
		);

		if (!slot) {
			return res.status(404).json({ error: "Слот не найден" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id != slot.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		await dbRun("UPDATE slots SET is_cancelled = 1 WHERE id = ?", [req.params.id]);

		res.json({ message: "Слот отменён" });
	} catch (err) {
		console.error("Ошибка отмены слота:", err);
		res.status(500).json({ error: "Ошибка при отмене слота" });
	}
});

export default router;
