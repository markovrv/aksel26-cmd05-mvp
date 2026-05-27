import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import { useAuth } from "../context/AuthContext";

function Register({ showToast }) {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		full_name: "",
		phone: "",
		consent_to_pd: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setError("");
	};

	const formatPhone = (value) => {
		const digits = value.replace(/\D/g, "").slice(0, 11);
		let formatted = "";
		if (digits.length > 0) formatted = "+" + digits[0];
		if (digits.length > 1) formatted += " (" + digits.slice(1, 4);
		if (digits.length > 4) formatted += ") " + digits.slice(4, 7);
		if (digits.length > 7) formatted += "-" + digits.slice(7, 9);
		if (digits.length > 9) formatted += "-" + digits.slice(9, 11);
		return formatted;
	};

	const validateForm = () => {
		if (!formData.email.includes("@") || !formData.email.includes(".")) {
			setError("Некорректный email");
			return false;
		}
		if (formData.password.length < 6) {
			setError("Пароль должен содержать минимум 6 символов");
			return false;
		}
		if (formData.password !== formData.confirmPassword) {
			setError("Пароли не совпадают");
			return false;
		}
		if (formData.full_name.split(" ").length < 2) {
			setError("Введите ФИО (минимум 2 слова)");
			return false;
		}
		const phoneDigits = formData.phone.replace(/\D/g, "");
		if (phoneDigits.length !== 11) {
			setError("Введите корректный номер телефона");
			return false;
		}
		if (!formData.consent_to_pd) {
			setError("Необходимо согласие на обработку персональных данных");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		try {
			await register({
				email: formData.email,
				password: formData.password,
				full_name: formData.full_name,
				phone: formData.phone.replace(/\D/g, ""),
				consent_to_pd: true,
			});

			showToast("Регистрация прошла успешно", "success");

			// Автоматически входим
			await login(formData.email, formData.password);
			navigate("/");
		} catch (err) {
			setError(err.message || "Ошибка регистрации");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#F5F3FF]">
			<div className="max-w-md w-full">
				<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-8">
					<h1 className="text-2xl font-bold text-[#1F2937] text-center mb-2">Регистрация</h1>
					<p className="text-[#6B7280] text-center mb-8">
						Создайте аккаунт для бронирования экскурсий
					</p>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">
								Email *
							</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => handleChange("email", e.target.value)}
								placeholder="example@mail.ru"
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">
								Пароль *
							</label>
							<input
								type="password"
								value={formData.password}
								onChange={(e) => handleChange("password", e.target.value)}
								placeholder="Минимум 6 символов"
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">
								Подтверждение пароля *
							</label>
							<input
								type="password"
								value={formData.confirmPassword}
								onChange={(e) => handleChange("confirmPassword", e.target.value)}
								placeholder="Повторите пароль"
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">
								ФИО *
							</label>
							<input
								type="text"
								value={formData.full_name}
								onChange={(e) => handleChange("full_name", e.target.value)}
								placeholder="Иванов Иван Иванович"
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">
								Телефон *
							</label>
							<input
								type="tel"
								value={formData.phone}
								onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
								placeholder="+7 (999) 123-45-67"
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
							/>
						</div>

						<label className="flex items-start gap-3 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.consent_to_pd}
								onChange={(e) => handleChange("consent_to_pd", e.target.checked)}
								className="mt-1 w-5 h-5 rounded border-[#D1D5DB] text-[#6D28D9] focus:ring-[#A855F7]"
							/>
							<span className="text-sm text-[#6B7280]">
								Я согласен на обработку персональных данных в соответствии с
								политикой конфиденциальности *
							</span>
						</label>

						{error && (
							<div className="p-3 bg-[#FEE2E2] text-[#DC2626] rounded-xl text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-semibold px-6 py-3 rounded-xl shadow-btn transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:shadow-none"
						>
							{loading ? "Регистрация..." : "Зарегистрироваться"}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-[#6B7280]">
							Уже есть аккаунт?{" "}
							<Link
								to="/login"
								className="text-[#6D28D9] font-medium hover:text-[#7C3AED]"
							>
								Войти
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Register;