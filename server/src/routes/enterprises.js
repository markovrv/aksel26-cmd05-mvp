import express from "express";
import { dbGet, dbAll, dbRun } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

// Получить список активных предприятий (публичный)
router.get("/", async (req, res) => {
	try {
		const { city, search } = req.query;
		let sql = "SELECT * FROM enterprises WHERE is_active = 1";
		const params = [];

		if (city) {
			sql += " AND city = ?";
			params.push(city);
		}

		if (search) {
			sql += " AND (name LIKE ? OR description LIKE ?)";
			params.push(`%${search}%`, `%${search}%`);
		}

		sql += " ORDER BY average_rating DESC";

		const enterprises = await dbAll(sql, params);

		const result = enterprises.map((e) => ({
			...e,
			social_links: e.social_links ? JSON.parse(e.social_links) : [],
			certificates: e.certificates ? JSON.parse(e.certificates) : [],
			photos: e.photos ? JSON.parse(e.photos) : [],
		}));

		res.json(result);
	} catch (err) {
		console.error("Ошибка получения предприятий:", err);
		res.status(500).json({ error: "Ошибка при получении списка предприятий" });
	}
});

// Получить одно предприятие (публичный)
router.get("/:id", async (req, res) => {
	try {
		const enterprise = await dbGet("SELECT * FROM enterprises WHERE id = ?", [
			req.params.id,
		]);

		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}

		res.json({
			...enterprise,
			social_links: enterprise.social_links
				? JSON.parse(enterprise.social_links)
				: [],
			certificates: enterprise.certificates
				? JSON.parse(enterprise.certificates)
				: [],
			photos: enterprise.photos ? JSON.parse(enterprise.photos) : [],
		});
	} catch (err) {
		console.error("Ошибка получения предприятия:", err);
		res.status(500).json({ error: "Ошибка при получении предприятия" });
	}
});

// Создать предприятие (admin)
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
	try {
		const {
			name,
			description,
			city,
			address,
			contacts,
			social_links,
			certificates,
			photos,
		} = req.body;

		if (!name || !description || !city || !address || !contacts) {
			return res
				.status(400)
				.json({ error: "Недостаточно данных для создания предприятия" });
		}

		const result = await dbRun(
			`INSERT INTO enterprises (name, description, city, address, contacts, social_links, certificates, photos, is_active)
	       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
			[
				name,
				description,
				city,
				address,
				contacts,
				social_links ? JSON.stringify(social_links) : null,
				certificates ? JSON.stringify(certificates) : null,
				photos ? JSON.stringify(photos) : null,
			],
		);

		res
			.status(201)
			.json({ id: result.lastInsertRowid, message: "Предприятие создано" });
	} catch (err) {
		console.error("Ошибка создания предприятия:", err);
		res.status(500).json({ error: "Ошибка при создании предприятия" });
	}
});

// Редактировать предприятие (admin или b2b своего предприятия)
router.put("/:id", authenticateToken, async (req, res) => {
	try {
		const {
			name,
			description,
			city,
			address,
			contacts,
			social_links,
			certificates,
			photos,
		} = req.body;
		const enterpriseId = req.params.id;

		if (req.user.role !== "admin" && req.user.enterprise_id != enterpriseId) {
			return res.status(403).json({ error: "Доступ запрещён" });
		}

		await dbRun(
			`UPDATE enterprises SET name = COALESCE(?, name), description = COALESCE(?, description),
	       city = COALESCE(?, city), address = COALESCE(?, address), contacts = COALESCE(?, contacts),
	       social_links = COALESCE(?, social_links), certificates = COALESCE(?, certificates),
	       photos = COALESCE(?, photos) WHERE id = ?`,
			[
				name,
				description,
				city,
				address,
				contacts,
				social_links ? JSON.stringify(social_links) : null,
				certificates ? JSON.stringify(certificates) : null,
				photos ? JSON.stringify(photos) : null,
				enterpriseId,
			],
		);

		res.json({ message: "Предприятие обновлено" });
	} catch (err) {
		console.error("Ошибка обновления предприятия:", err);
		res.status(500).json({ error: "Ошибка при обновлении предприятия" });
	}
});

// Одобрить предприятие (admin)
router.patch(
	"/:id/activate",
	authenticateToken,
	requireRole("admin"),
	async (req, res) => {
		try {
			await dbRun("UPDATE enterprises SET is_active = 1 WHERE id = ?", [
				req.params.id,
			]);
			res.json({ message: "Предприятие активировано" });
		} catch (err) {
			console.error("Ошибка активации:", err);
			res.status(500).json({ error: "Ошибка при активации" });
		}
	},
);

export default router;
