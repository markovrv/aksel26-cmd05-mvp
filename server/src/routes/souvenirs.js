import express from "express";
import { dbGet, dbAll, dbRun } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Получить все сувениры предприятия (admin/b2b, включая недоступные)
router.get(
	"/manage/:enterprise_id",
	authenticateToken,
	async (req, res) => {
		try {
			const { enterprise_id } = req.params;

			if (
				req.user.role !== "admin" &&
				req.user.enterprise_id != enterprise_id
			) {
				return res.status(403).json({ error: "Доступ запрещён" });
			}

			const souvenirs = await dbAll(
				`SELECT * FROM souvenirs WHERE enterprise_id = ? ORDER BY id DESC`,
				[enterprise_id],
			);

			const result = souvenirs.map((s) => ({
				...s,
				personalization_type: s.personalization_type
					? JSON.parse(s.personalization_type)
					: null,
			}));

			res.json(result);
		} catch (err) {
			console.error("Ошибка получения сувениров:", err);
			res.status(500).json({ error: "Ошибка при получении сувениров" });
		}
	},
);

// Витрина сувениров предприятия (публичная)
router.get("/:enterprise_id", async (req, res) => {
	try {
		const souvenirs = await dbAll(
			`
	      SELECT * FROM souvenirs WHERE enterprise_id = ? AND is_available = 1
	    `,
			[req.params.enterprise_id],
		);

		const result = souvenirs.map((s) => ({
			...s,
			personalization_type: s.personalization_type
				? JSON.parse(s.personalization_type)
				: null,
		}));

		res.json(result);
	} catch (err) {
		console.error("Ошибка получения сувениров:", err);
		res.status(500).json({ error: "Ошибка при получении сувениров" });
	}
});

// Добавить товар (b2b)
router.post("/", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const {
			enterprise_id,
			name,
			description,
			base_price,
			stock_quantity,
			photo_url,
			allows_personalization,
			personalization_type,
		} = req.body;

		if (req.user.role !== "admin" && req.user.enterprise_id != enterprise_id) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		if (!name || !base_price || !stock_quantity) {
			return res.status(400).json({ error: "Недостаточно данных" });
		}

		const result = await dbRun(
			`INSERT INTO souvenirs (enterprise_id, name, description, base_price, stock_quantity, photo_url, allows_personalization, personalization_type)
	       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				enterprise_id,
				name,
				description,
				base_price,
				stock_quantity,
				photo_url,
				allows_personalization ? 1 : 0,
				personalization_type ? JSON.stringify(personalization_type) : null,
			],
		);

		res
			.status(201)
			.json({ id: result.lastInsertRowid, message: "Товар добавлен" });
	} catch (err) {
		console.error("Ошибка добавления товара:", err);
		res.status(500).json({ error: "Ошибка при добавлении товара" });
	}
});

// Редактировать товар (b2b)
router.put("/:id", authenticateToken, async (req, res) => {
	try {
		const souvenir = await dbGet("SELECT enterprise_id FROM souvenirs WHERE id = ?", [
			req.params.id,
		]);

		if (!souvenir) {
			return res.status(404).json({ error: "Товар не найден" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id != souvenir.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const {
			name,
			description,
			base_price,
			stock_quantity,
			photo_url,
			allows_personalization,
			personalization_type,
		} = req.body;

		await dbRun(
			`UPDATE souvenirs SET
	       name = COALESCE(?, name),
	       description = COALESCE(?, description),
	       base_price = COALESCE(?, base_price),
	       stock_quantity = COALESCE(?, stock_quantity),
	       photo_url = COALESCE(?, photo_url),
	       allows_personalization = COALESCE(?, allows_personalization),
	       personalization_type = COALESCE(?, personalization_type)
	       WHERE id = ?`,
			[
				name,
				description,
				base_price,
				stock_quantity,
				photo_url,
				allows_personalization ? 1 : 0,
				personalization_type ? JSON.stringify(personalization_type) : null,
				req.params.id,
			],
		);

		res.json({ message: "Товар обновлён" });
	} catch (err) {
		console.error("Ошибка обновления товара:", err);
		res.status(500).json({ error: "Ошибка при обновлении товара" });
	}
});

// Показать/скрыть товар
router.patch("/:id/toggle", authenticateToken, async (req, res) => {
	try {
		const souvenir = await dbGet(
			"SELECT enterprise_id, is_available FROM souvenirs WHERE id = ?",
			[req.params.id],
		);

		if (!souvenir) {
			return res.status(404).json({ error: "Товар не найден" });
		}

		if (
			req.user.role !== "admin" &&
			req.user.enterprise_id != souvenir.enterprise_id
		) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		await dbRun("UPDATE souvenirs SET is_available = ? WHERE id = ?", [
			souvenir.is_available ? 0 : 1,
			req.params.id,
		]);
		res.json({
			message: souvenir.is_available ? "Товар скрыт" : "Товар показан",
		});
	} catch (err) {
		console.error("Ошибка переключения статуса:", err);
		res.status(500).json({ error: "Ошибка при изменении статуса" });
	}
});

export default router;
