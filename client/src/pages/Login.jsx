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
		<div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#F5F3FF]">
			<div className="max-w-md w-full">
				<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-8">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-[#1F2937] mb-2">
							Вход в систему
						</h1>
						<p className="text-[#6B7280]">
							Войдите в свой аккаунт для бронирования экскурсий
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label className="block text-sm font-medium text-[#1F2937] mb-2">Email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="example@mail.ru"
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
							/>
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium text-[#1F2937] mb-2">Пароль</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Введите пароль"
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
							/>
						</div>

						{error && (
							<div className="mb-4 p-3 bg-[#FEE2E2] text-[#DC2626] rounded-xl text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-semibold px-6 py-3 rounded-xl shadow-btn transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:shadow-none"
						>
							{loading ? "Вход..." : "Войти"}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-[#6B7280]">
							Нет аккаунта?{" "}
							<Link
								to="/register"
								className="font-semibold text-[#6D28D9] hover:text-[#7C3AED]"
							>
								Зарегистрироваться
							</Link>
						</p>
					</div>

					{/* Тестовые аккаунты */}
					<div className="mt-8 p-4 rounded-xl bg-[#F5F3FF] border border-[#E9D5FF]">
						<p className="text-sm font-semibold text-[#1F2937] mb-2">
							Тестовые аккаунты:
						</p>
						<div className="text-xs text-[#6B7280] space-y-1">
							<p><strong>B2C:</strong> b2c@test.ru / test123</p>
							<p><strong>B2B:</strong> b2b@test.ru / test123</p>
							<p><strong>Admin:</strong> admin@test.ru / admin123</p>
							<p><strong>Ministry:</strong> ministry@test.ru / test123</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;