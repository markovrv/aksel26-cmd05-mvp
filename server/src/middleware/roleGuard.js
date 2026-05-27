// Фабрика middleware для проверки ролей
export function requireRole(...allowedRoles) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: "Требуется авторизация" });
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ error: "Доступ запрещён для вашей роли" });
		}

		next();
	};
}

// Проверка, что пользователь является владельцем предприятия
export function requireEnterpriseAccess(req, res, next) {
	if (!req.user) {
		return res.status(401).json({ error: "Требуется авторизация" });
	}

	// Админы имеют доступ ко всем предприятиям
	if (req.user.role === "admin") {
		return next();
	}

	// Проверяем, принадлежит ли предприятие пользователю
	const enterpriseId =
		req.params.enterpriseId || req.params.id || req.body.enterprise_id;

	if (req.user.enterprise_id != enterpriseId) {
		return res
			.status(403)
			.json({ error: "Доступ к этому предприятию запрещён" });
	}

	next();
}
