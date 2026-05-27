import express from "express";
import { dbGet, dbAll } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

// Агрегат для B2G (Ministry)
router.get(
	"/summary",
	authenticateToken,
	requireRole("ministry", "admin"),
	async (req, res) => {
		try {
			const { from, to, city, industry } = req.query;

			let whereClause = "WHERE 1=1";
			const params = [];

			if (from) {
				whereClause += " AND s.start_datetime >= ?";
				params.push(from);
			}

			if (to) {
				whereClause += " AND s.start_datetime <= ?";
				params.push(to);
			}

			if (city) {
				whereClause += " AND ent.city = ?";
				params.push(city);
			}

			const stats = await dbGet(
				`
	      SELECT
	        COUNT(DISTINCT e.id) as total_excursions,
	        COUNT(DISTINCT b.id) as total_visitors,
	        COALESCE(SUM(CASE WHEN b.status IN ('paid', 'confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as excursion_revenue
	      FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      ${whereClause}
	    `,
				params,
			);

			const souvenirStats = await dbGet(
				`
	      SELECT COALESCE(SUM(so.final_price), 0) as souvenir_revenue
	      FROM souvenir_orders so
	      JOIN bookings b ON so.booking_id = b.id
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      ${whereClause}
	    `,
				params,
			);

			const avgCheck = await dbGet(
				`
	      SELECT COALESCE(AVG(b.total_price), 0) as avg_check
	      FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      ${whereClause} AND b.status IN ('paid', 'confirmed', 'completed')
	    `,
				params,
			);

			const topEnterprises = await dbAll(`
	      SELECT ent.id, ent.name, ent.city,
	        COUNT(DISTINCT b.id) as bookings_count,
	        COALESCE(SUM(CASE WHEN b.status IN ('paid', 'confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as revenue
	      FROM enterprises ent
	      LEFT JOIN excursions e ON e.enterprise_id = ent.id
	      LEFT JOIN slots s ON s.excursion_id = e.id
	      LEFT JOIN bookings b ON b.slot_id = s.id
	      WHERE ent.is_active = 1
	      GROUP BY ent.id
	      ORDER BY revenue DESC
	      LIMIT 5
	    `);

			const monthly = await dbAll(
				`
	      SELECT
	        strftime('%Y-%m', s.start_datetime) as month,
	        COUNT(DISTINCT b.id) as visitors
	      FROM bookings b
	      JOIN slots s ON b.slot_id = s.id
	      JOIN excursions e ON s.excursion_id = e.id
	      JOIN enterprises ent ON e.enterprise_id = ent.id
	      ${whereClause}
	      GROUP BY strftime('%Y-%m', s.start_datetime)
	      ORDER BY month DESC
	      LIMIT 12
	    `,
				params,
			);

			res.json({
				total_excursions: stats.total_excursions,
				total_visitors: stats.total_visitors,
				excursion_revenue: stats.excursion_revenue,
				souvenir_revenue: souvenirStats.souvenir_revenue,
				avg_check: avgCheck.avg_check,
				top_enterprises: topEnterprises,
				monthly: monthly.reverse(),
			});
		} catch (err) {
			console.error("Ошибка получения аналитики:", err);
			res.status(500).json({ error: "Ошибка при получении аналитики" });
		}
	},
);

// Список городов для фильтров
router.get(
	"/cities",
	authenticateToken,
	requireRole("ministry", "admin"),
	async (req, res) => {
		try {
			const cities = await dbAll(`
	      SELECT DISTINCT city FROM enterprises WHERE is_active = 1 ORDER BY city
	    `);
			res.json(cities.map((c) => c.city));
		} catch (err) {
			console.error("Ошибка получения городов:", err);
			res.status(500).json({ error: "Ошибка при получении списка городов" });
		}
	},
);

export default router;
