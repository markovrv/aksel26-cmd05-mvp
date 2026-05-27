import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login({ showToast }) {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const from = location.state?.from?.pathname || "/";

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!email || !password) {
			setError("Заполните все поля");
			return;
		}

		setLoading(true);
		try {
			await login(email, password);
			showToast("Вход выполнен успешно", "success");
			navigate(from, { replace: true });
		} catch (err) {
			setError(err.message || "Ошибка входа");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
			<div className="max-w-md w-full">
				<div className="card" style={{ padding: "2rem" }}>
					<div className="text-center mb-8">
						<h1
							className="text-2xl font-bold mb-2"
							style={{ fontFamily: "'Manrope', sans-serif" }}
						>
							Вход в систему
						</h1>
						<p className="text-gray-500">
							Войдите в свой аккаунт для бронирования экскурсий
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2">Email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="example@mail.ru"
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base transition-all"
								style={{ borderRadius: "14px" }}
							/>
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium mb-2">Пароль</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Введите пароль"
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base transition-all"
								style={{ borderRadius: "14px" }}
							/>
						</div>

						{error && (
							<div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary w-full"
						>
							{loading ? "Вход..." : "Войти"}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-gray-500">
							Нет аккаунта?{" "}
							<Link
								to="/register"
								className="font-semibold"
								style={{ color: "var(--color-primary)" }}
							>
								Зарегистрироваться
							</Link>
						</p>
					</div>

					{/* Тестовые аккаунты */}
					<div
						className="mt-8 p-4 rounded-xl"
						style={{ background: "var(--color-bg)" }}
					>
						<p
							className="text-sm font-semibold mb-2"
							style={{ fontFamily: "'Manrope', sans-serif" }}
						>
							Тестовые аккаунты:
						</p>
						<div className="text-xs text-gray-500 space-y-1">
							<p>
								<strong>B2C:</strong> b2c@test.ru / test123
							</p>
							<p>
								<strong>B2B:</strong> b2b@test.ru / test123
							</p>
							<p>
								<strong>Admin:</strong> admin@test.ru / admin123
							</p>
							<p>
								<strong>Ministry:</strong> ministry@test.ru / test123
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
