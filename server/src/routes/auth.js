import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbRun, dbGet, dbAll } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

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
			},
		});
	} catch (err) {
		console.error("Ошибка входа:", err);
		res.status(500).json({ error: "Ошибка при входе" });
	}
});

// Получить текущего пользователя
router.get("/me", authenticateToken, (req, res) => {
	res.json({ user: req.user });
});

export default router;
