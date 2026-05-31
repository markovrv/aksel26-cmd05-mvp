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
	const [showPDModal, setShowPDModal] = useState(false);

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
								Я согласен на{" "}
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setShowPDModal(true);
									}}
									className="text-[#6D28D9] underline hover:text-[#7C3AED] font-medium"
								>
									обработку персональных данных
								</button>{" "}
								в соответствии с политикой конфиденциальности *
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
						{showPDModal && (
							<div
								className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
								onClick={() => setShowPDModal(false)}
							>
								<div
									className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
									onClick={(e) => e.stopPropagation()}
								>
									<div className="flex items-center justify-between p-6 border-b border-[#E9D5FF]">
										<h3 className="text-lg font-bold text-[#1F2937]">
											Согласие на обработку персональных данных
										</h3>
										<button
											onClick={() => setShowPDModal(false)}
											className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F3FF] text-[#6B7280]"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
									<div className="p-6 overflow-y-auto text-sm text-[#374151] space-y-4 leading-relaxed">
										<p>
											Настоящим я, являясь пользователем веб-сайта и/или сервисов платформы «ТЭМП» (далее — Платформа), свободно, своей волей и в своем интересе даю согласие на обработку моих персональных данных оператору Платформы (далее — Оператор).
										</p>
										<p>
											<strong>Цели обработки персональных данных:</strong>
										</p>
										<ul className="list-disc pl-5 space-y-1">
											<li>Регистрация и идентификация пользователя на Платформе;</li>
											<li>Оформление и исполнение договоров бронирования экскурсий и заказа сувенирной продукции;</li>
											<li>Связь с пользователем, направление уведомлений о статусе бронирований и заказов;</li>
											<li>Улучшение качества обслуживания и развитие сервисов Платформы;</li>
											<li>Статистические и аналитические исследования;</li>
											<li>Предотвращение мошеннических действий и обеспечение безопасности.</li>
										</ul>
										<p>
											<strong>Перечень персональных данных, на обработку которых дается согласие:</strong>
										</p>
										<ul className="list-disc pl-5 space-y-1">
											<li>Фамилия, имя, отчество;</li>
											<li>Номер контактного телефона;</li>
											<li>Адрес электронной почты;</li>
											<li>История бронирований и заказов;</li>
											<li>Платежная информация (обрабатывается платежным шлюзом, Оператор не хранит данные банковских карт).</li>
										</ul>
										<p>
											<strong>Способы обработки персональных данных:</strong> сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передача (предоставление доступа), обезличивание, блокирование, удаление, уничтожение персональных данных как с использованием средств автоматизации, так и без использования таких средств.
										</p>
										<p>
											<strong>Срок действия согласия:</strong> настоящее согласие действует с момента его предоставления до момента его отзыва. Я ознакомлен(а), что могу отозвать свое согласие путем направления письменного уведомления Оператору.
										</p>
										<p>
											<strong>Права субъекта персональных данных:</strong> Я имею право на получение информации, касающейся обработки моих персональных данных, на уточнение, блокирование и уничтожение моих персональных данных, а также на обжалование действий или бездействия Оператора в уполномоченный орган по защите прав субъектов персональных данных.
										</p>
									</div>
									<div className="p-6 border-t border-[#E9D5FF] flex justify-end">
										<button
											onClick={() => setShowPDModal(false)}
											className="px-6 py-2.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-medium rounded-xl transition-colors"
										>
											Закрыть
										</button>
									</div>
								</div>
							</div>
						)}

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