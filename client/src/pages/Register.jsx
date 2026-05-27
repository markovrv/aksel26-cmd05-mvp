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
		<div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
			<div className="max-w-md w-full">
				<div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
					<h1 className="text-2xl font-bold text-center mb-2">Регистрация</h1>
					<p className="text-gray-500 text-center mb-8">
						Создайте аккаунт для бронирования экскурсий
					</p>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email *
							</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => handleChange("email", e.target.value)}
								placeholder="example@mail.ru"
								className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Пароль *
							</label>
							<input
								type="password"
								value={formData.password}
								onChange={(e) => handleChange("password", e.target.value)}
								placeholder="Минимум 6 символов"
								className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Подтверждение пароля *
							</label>
							<input
								type="password"
								value={formData.confirmPassword}
								onChange={(e) =>
									handleChange("confirmPassword", e.target.value)
								}
								placeholder="Повторите пароль"
								className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								ФИО *
							</label>
							<input
								type="text"
								value={formData.full_name}
								onChange={(e) => handleChange("full_name", e.target.value)}
								placeholder="Иванов Иван Иванович"
								className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Телефон *
							</label>
							<input
								type="tel"
								value={formData.phone}
								onChange={(e) =>
									handleChange("phone", formatPhone(e.target.value))
								}
								placeholder="+7 (999) 123-45-67"
								className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>

						<label className="flex items-start gap-3 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.consent_to_pd}
								onChange={(e) =>
									handleChange("consent_to_pd", e.target.checked)
								}
								className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span className="text-sm text-gray-600">
								Я согласен на обработку персональных данных в соответствии с
								политикой конфиденциальности *
							</span>
						</label>

						{error && (
							<div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
						>
							{loading ? "Регистрация..." : "Зарегистрироваться"}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-gray-500">
							Уже есть аккаунт?{" "}
							<Link
								to="/login"
								className="text-primary font-medium hover:underline"
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
