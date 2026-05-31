import express from "express";
import { dbGet, dbAll, dbRun } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

// Получить список экскурсий (публичный)
router.get("/", async (req, res) => {
	try {
		const { city, date, enterprise_id, search } = req.query;
		let sql = `
	      SELECT e.*, ent.name as enterprise_name, ent.city, ent.average_rating as enterprise_rating
	      FROM excursions e
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      WHERE e.is_active = 1 AND ent.is_active = 1
	    `;
		const params = [];

		if (city) {
			sql += " AND ent.city = ?";
			params.push(city);
		}

		if (enterprise_id) {
			sql += " AND e.enterprise_id = ?";
			params.push(enterprise_id);
		}

		if (date) {
			sql +=
				" AND EXISTS (SELECT 1 FROM slots s WHERE s.excursion_id = e.id AND DATE(s.start_datetime) = ? AND s.available_slots > 0 AND s.is_cancelled = 0)";
			params.push(date);
		}

		if (search) {
			// Регистронезависимый поиск для кириллицы: заменяем каждую букву на класс символов [Аа]
			const ciPattern = search.replace(/[а-яёa-z]/gi, (ch) => {
				const lower = ch.toLowerCase();
				const upper = ch.toUpperCase();
				if (lower === upper) return ch; // не буква
				return `[${upper}${lower}]`;
			});
			sql += " AND (e.title GLOB ? OR ent.name GLOB ? OR e.description GLOB ?)";
			const globPattern = `*${ciPattern}*`;
			params.push(globPattern, globPattern, globPattern);
		}

		sql += " ORDER BY e.created_at DESC";

		const excursions = await dbAll(sql, params);
		res.json(excursions);
	} catch (err) {
		console.error("Ошибка получения экскурсий:", err);
		res.status(500).json({ error: "Ошибка при получении списка экскурсий" });
	}
});

// Получить список дат, в которые есть свободные слоты
router.get("/dates", async (_req, res) => {
	try {
		const rows = await dbAll(
			`SELECT DISTINCT DATE(s.start_datetime) as date
			 FROM slots s
			 JOIN excursions e ON s.excursion_id = e.id
			 JOIN enterprises ent ON e.enterprise_id = ent.id
			 WHERE s.start_datetime >= datetime('now')
			   AND s.available_slots > 0
			   AND s.is_cancelled = 0
			   AND e.is_active = 1
			   AND ent.is_active = 1
			 ORDER BY date ASC`,
		);
		res.json(rows.map((r) => r.date));
	} catch (err) {
		console.error("Ошибка получения дат экскурсий:", err);
		res.status(500).json({ error: "Ошибка при получении дат" });
	}
});

// Получить одну экскурсию со слотами и сувенирами
router.get("/:id", async (req, res) => {
	try {
		const excursion = await dbGet(
			`
	      SELECT e.*, ent.name as enterprise_name, ent.city, ent.address, ent.description as enterprise_description, ent.photos as enterprise_photos
	      FROM excursions e
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      WHERE e.id = ?
	    `,
			[req.params.id],
		);

		if (!excursion) {
			return res.status(404).json({ error: "Экскурсия не найдена" });
		}

		excursion.enterprise_photos = excursion.enterprise_photos
			? JSON.parse(excursion.enterprise_photos)
			: [];

		const slots = await dbAll(
			`
	      SELECT * FROM slots
	      WHERE excursion_id = ? AND start_datetime >= datetime('now') AND is_cancelled = 0
	      ORDER BY start_datetime ASC
	    `,
			[req.params.id],
		);

		const souvenirs = await dbAll(
			`
	      SELECT * FROM souvenirs WHERE enterprise_id = ? AND is_available = 1
	    `,
			[excursion.enterprise_id],
		);

		const reviews = await dbAll(
			`
	      SELECT r.*, u.full_name as user_name
	      FROM reviews r
	      JOIN users u ON r.user_id = u.id
	      WHERE r.booking_id IN (
	        SELECT b.id FROM bookings b WHERE b.slot_id IN (
	          SELECT s.id FROM slots s WHERE s.excursion_id = ?
	        )
	      ) AND r.is_moderated = 1
	      ORDER BY r.created_at DESC
	      LIMIT 10
	    `,
			[req.params.id],
		);

		res.json({
			...excursion,
			slots,
			souvenirs,
			reviews,
		});
	} catch (err) {
		console.error("Ошибка получения экскурсии:", err);
		res.status(500).json({ error: "Ошибка при получении экскурсии" });
	}
});

// Создать экскурсию (b2b своего предприятия)
router.post("/", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "b2b_employee" && req.user.role !== "admin") {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		const {
			enterprise_id,
			title,
			description,
			duration_minutes,
			default_price,
			max_participants,
			min_participants,
			photo_url,
		} = req.body;

		if (req.user.role !== "admin" && req.user.enterprise_id != enterprise_id) {
			return res
				.status(403)
				.json({ error: "Доступ к этому предприятию запрещён" });
		}

		if (
			!title ||
			!description ||
			!duration_minutes ||
			!default_price ||
			!max_participants
		) {
			return res
				.status(400)
				.json({ error: "Недостаточно данных для создания экскурсии" });
		}

		const result = await dbRun(
			`INSERT INTO excursions (enterprise_id, title, description, duration_minutes, default_price, max_participants, min_participants, photo_url)
	       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				enterprise_id,
				title,
				description,
				duration_minutes,
				default_price,
				max_participants,
				min_participants || 1,
				photo_url,
			],
		);

		res
			.status(201)
			.json({ id: result.lastInsertRowid, message: "Экскурсия создана" });
	} catch (err) {
		console.error("Ошибка создания экскурсии:", err);
		res.status(500).json({ error: "Ошибка при создании экскурсии" });
	}
});

// Редактировать экскурсию (b2b)
router.put("/:id", authenticateToken, async (req, res) => {
	try {
		const excursion = await dbGet(
			"SELECT enterprise_id FROM excursions WHERE id = ?",
			[req.params.id],
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

		const {
			title,
			description,
			duration_minutes,
			default_price,
			max_participants,
			min_participants,
			photo_url,
		} = req.body;

		await dbRun(
			`UPDATE excursions SET
	       title = COALESCE(?, title),
	       description = COALESCE(?, description),
	       duration_minutes = COALESCE(?, duration_minutes),
	       default_price = COALESCE(?, default_price),
	       max_participants = COALESCE(?, max_participants),
	       min_participants = COALESCE(?, min_participants),
		       photo_url = COALESCE(?, photo_url)
	       WHERE id = ?`,
			[
				title,
				description,
				duration_minutes,
				default_price,
				max_participants,
				min_participants,
				photo_url,
				req.params.id,
			],
		);

		res.json({ message: "Экскурсия обновлена" });
	} catch (err) {
		console.error("Ошибка обновления экскурсии:", err);
		res.status(500).json({ error: "Ошибка при обновлении экскурсии" });
	}
});

// Показать/скрыть экскурсию (b2b)
router.patch("/:id/toggle", authenticateToken, async (req, res) => {
	try {
		const excursion = await dbGet(
			"SELECT enterprise_id, is_active FROM excursions WHERE id = ?",
			[req.params.id],
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

		await dbRun("UPDATE excursions SET is_active = ? WHERE id = ?", [
			excursion.is_active ? 0 : 1,
			req.params.id,
		]);
		res.json({
			message: excursion.is_active ? "Экскурсия скрыта" : "Экскурсия показана",
		});
	} catch (err) {
		console.error("Ошибка переключения статуса экскурсии:", err);
		res.status(500).json({ error: "Ошибка при изменении статуса" });
	}
});

// Получить экскурсии для управления (admin/b2b, включая неактивные)
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

			const excursions = await dbAll(
				`SELECT e.*, ent.name as enterprise_name, ent.city
		       FROM excursions e
		       JOIN enterprises ent ON e.enterprise_id = ent.id
		       WHERE e.enterprise_id = ?
		       ORDER BY e.created_at DESC`,
				[enterprise_id],
			);

			res.json(excursions);
		} catch (err) {
			console.error("Ошибка получения экскурсий:", err);
			res.status(500).json({ error: "Ошибка при получении списка экскурсий" });
		}
	},
);

export default router;
