import jwt from "jsonwebtoken";
import { dbGet } from "../db/db.js";

export async function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Требуется авторизация" });
	}

	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "change_me_in_production",
		);

		// Получаем актуальные данные пользователя из БД
		const user = await dbGet(
			"SELECT id, email, role, full_name, enterprise_id FROM users WHERE id = ?",
			[decoded.id],
		);

		if (!user) {
			return res.status(401).json({ error: "Пользователь не найден" });
		}

		req.user = user;
		next();
	} catch (err) {
		return res.status(403).json({ error: "Недействительный токен" });
	}
}

export async function optionalAuth(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return next();
	}

	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "change_me_in_production",
		);
		const user = await dbGet(
			"SELECT id, email, role, full_name, enterprise_id FROM users WHERE id = ?",
			[decoded.id],
		);

		if (user) {
			req.user = user;
		}
	} catch (err) {
		// Игнорируем ошибку и продолжаем без пользователя
	}

	next();
}
