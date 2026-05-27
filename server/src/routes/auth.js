import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbRun, dbGet, dbAll } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

// Регистрация
router.post("/register", async (req, res) => {
	try {
		const { email, password, full_name, phone, consent_to_pd } = req.body;

		if (!email || !password || !full_name || !phone) {
			return res
				.status(400)
				.json({ error: "Все поля обязательны для заполнения" });
		}

		if (!email.includes("@") || !email.includes(".")) {
			return res.status(400).json({ error: "Некорректный email" });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "Пароль должен содержать минимум 6 символов" });
		}

		if (!consent_to_pd) {
			return res
				.status(400)
				.json({
					error: "Необходимо согласие на обработку персональных данных",
				});
		}

		const existing = await dbGet("SELECT id FROM users WHERE email = ?", [email]);
		if (existing) {
			return res
				.status(400)
				.json({ error: "Пользователь с таким email уже существует" });
		}

		const password_hash = bcrypt.hashSync(password, 10);

		const result = await dbRun(
			"INSERT INTO users (email, password_hash, full_name, phone, role, consent_to_pd) VALUES (?, ?, ?, ?, ?, ?)",
			[email, password_hash, full_name, phone, "b2c", consent_to_pd ? 1 : 0],
		);

		const token = jwt.sign(
			{ id: result.lastInsertRowid, email, role: "b2c" },
			process.env.JWT_SECRET || "change_me_in_production",
			{ expiresIn: "7d" },
		);

		res.status(201).json({
			token,
			user: { id: result.lastInsertRowid, email, role: "b2c", full_name },
		});
	} catch (err) {
		console.error("Ошибка регистрации:", err);
		res.status(500).json({ error: "Ошибка при регистрации" });
	}
});

// Логин
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Введите email и пароль" });
		}

		const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
		if (!user) {
			return res.status(401).json({ error: "Неверный email или пароль" });
		}

		const validPassword = bcrypt.compareSync(password, user.password_hash);
		if (!validPassword) {
			return res.status(401).json({ error: "Неверный email или пароль" });
		}

		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET || "change_me_in_production",
			{ expiresIn: "7d" },
		);

		res.json({
			token,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				full_name: user.full_name,
				phone: user.phone,
				enterprise_id: user.enterprise_id,
			},
		});
	} catch (err) {
		console.error("Ошибка входа:", err);
		res.status(500).json({ error: "Ошибка при входе" });
	}
});

// Получить текущего пользователя
router.get("/me", authenticateToken, async (req, res) => {
	try {
		const user = await dbGet("SELECT id, email, full_name, phone, role, enterprise_id FROM users WHERE id = ?", [req.user.id]);
		if (!user) return res.status(404).json({ error: "Пользователь не найден" });
		res.json({ user });
	} catch (err) {
		console.error("Ошибка получения пользователя:", err);
		res.status(500).json({ error: "Ошибка при получении пользователя" });
	}
});

// Получить список всех пользователей (admin)
router.get(
	"/users",
	authenticateToken,
	requireRole("admin"),
	async (req, res) => {
		try {
			const users = await dbAll(
				`SELECT id, email, full_name, phone, role, enterprise_id, created_at, is_blocked
		       FROM users ORDER BY created_at DESC`,
			);
			res.json(users);
		} catch (err) {
			console.error("Ошибка получения пользователей:", err);
			res.status(500).json({ error: "Ошибка при получении пользователей" });
		}
	},
);

// Заблокировать/разблокировать пользователя (admin)
router.patch(
	"/users/:id/block",
	authenticateToken,
	requireRole("admin"),
	async (req, res) => {
		try {
			const user = await dbGet("SELECT is_blocked FROM users WHERE id = ?", [
				req.params.id,
			]);
			if (!user) {
				return res.status(404).json({ error: "Пользователь не найден" });
			}

			await dbRun("UPDATE users SET is_blocked = ? WHERE id = ?", [
				user.is_blocked ? 0 : 1,
				req.params.id,
			]);

			res.json({
				message: user.is_blocked
					? "Пользователь разблокирован"
					: "Пользователь заблокирован",
			});
		} catch (err) {
			console.error("Ошибка блокировки пользователя:", err);
			res.status(500).json({ error: "Ошибка при блокировке пользователя" });
		}
	},
);

// Обновить свой профиль
router.put("/profile", authenticateToken, async (req, res) => {
	try {
		const { full_name, phone } = req.body;
		const updates = [];
		const params = [];

		if (full_name) {
			updates.push("full_name = ?");
			params.push(full_name);
		}
		if (phone) {
			updates.push("phone = ?");
			params.push(phone);
		}

		if (updates.length === 0) {
			return res.status(400).json({ error: "Нет данных для обновления" });
		}

		params.push(req.user.id);
		await dbRun(
			`UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
			params,
		);

		const user = await dbGet("SELECT id, email, full_name, phone, role, enterprise_id FROM users WHERE id = ?", [req.user.id]);
		res.json({ message: "Профиль обновлён", user });
	} catch (err) {
		console.error("Ошибка обновления профиля:", err);
		res.status(500).json({ error: "Ошибка при обновлении профиля" });
	}
});

// Удалить свой аккаунт
router.delete("/profile", authenticateToken, async (req, res) => {
	try {
		await dbRun("DELETE FROM reviews WHERE user_id = ?", [req.user.id]);
		await dbRun("DELETE FROM notifications WHERE user_id = ?", [req.user.id]);
		await dbRun("DELETE FROM souvenir_orders WHERE booking_id IN (SELECT id FROM bookings WHERE user_id = ?)", [req.user.id]);
		await dbRun("DELETE FROM bookings WHERE user_id = ?", [req.user.id]);
		await dbRun("DELETE FROM users WHERE id = ?", [req.user.id]);
		res.json({ message: "Аккаунт удалён" });
	} catch (err) {
		console.error("Ошибка удаления аккаунта:", err);
		res.status(500).json({ error: "Ошибка при удалении аккаунта" });
	}
});

// Сменить роль пользователя (admin)
router.patch(
	"/users/:id/role",
	authenticateToken,
	requireRole("admin"),
	async (req, res) => {
		try {
			const { role } = req.body;
			if (!["b2c", "b2b_employee", "admin", "ministry"].includes(role)) {
				return res.status(400).json({ error: "Некорректная роль" });
			}

			await dbRun("UPDATE users SET role = ? WHERE id = ?", [
				role,
				req.params.id,
			]);

			res.json({ message: "Роль пользователя изменена" });
		} catch (err) {
			console.error("Ошибка изменения роли:", err);
			res.status(500).json({ error: "Ошибка при изменении роли" });
		}
	},
);

export default router;
