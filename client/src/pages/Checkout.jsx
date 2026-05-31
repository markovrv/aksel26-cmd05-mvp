import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createBooking, createSouvenirOrders, getSouvenirs } from "../api";
import SouvenirCard from "../components/SouvenirCard";
import PaymentEmulator from "../components/PaymentEmulator";

function Checkout({ showToast }) {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [checkoutData, setCheckoutData] = useState(null);

	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");

	const [souvenirs, setSouvenirs] = useState([]);
	const [cartItems, setCartItems] = useState({});
	const [personalization, setPersonalization] = useState({});

	const [consentPD, setConsentPD] = useState(false);
	const [showPDModal, setShowPDModal] = useState(false);
	const [bookingId, setBookingId] = useState(null);
	const [souvenirTotal, setSouvenirTotal] = useState(0);

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}

		const data = sessionStorage.getItem("checkoutData");
		if (!data) {
			showToast("Данные сессии устарели", "error");
			navigate("/catalog");
			return;
		}

		const parsed = JSON.parse(data);
		setCheckoutData(parsed);
		setFullName(user.full_name || "");
		setPhone(user.phone || "");
		loadSouvenirs(parsed.enterprise_id);
	}, [user, navigate]);

	const loadSouvenirs = async (enterpriseId) => {
		try {
			const data = await getSouvenirs(enterpriseId);
			setSouvenirs(data);
		} catch (err) {
			console.error("Ошибка загрузки сувениров:", err);
		}
	};

	const handleAddSouvenir = (souvenir) => {
		setCartItems((prev) => ({
			...prev,
			[souvenir.id]: (prev[souvenir.id] || 0) + 1,
		}));
	};

	const handleRemoveSouvenir = (souvenirId) => {
		setCartItems((prev) => {
			const newItems = { ...prev };
			if (newItems[souvenirId] > 1) {
				newItems[souvenirId] -= 1;
			} else {
				delete newItems[souvenirId];
				const newPers = { ...personalization };
				delete newPers[souvenirId];
				setPersonalization(newPers);
			}
			return newItems;
		});
	};

	useEffect(() => {
		let total = 0;
		souvenirs.forEach((s) => {
			if (cartItems[s.id]) {
				total += s.base_price * cartItems[s.id];
			}
		});
		setSouvenirTotal(total);
	}, [cartItems, souvenirs]);

	const validateStep1 = () => {
		if (!fullName || fullName.split(" ").length < 2) {
			showToast("Введите ФИО (минимум 2 слова)", "error");
			return false;
		}
		const phoneDigits = phone.replace(/\D/g, "");
		if (phoneDigits.length !== 11) {
			showToast("Введите корректный номер телефона", "error");
			return false;
		}
		return true;
	};

	const handleNextStep = async () => {
		if (step === 1) {
			if (!validateStep1()) return;
			setStep(2);
		} else if (step === 2) {
			setStep(3);
		}
	};

	const handlePaymentSuccess = async (result) => {
		try {
			if (Object.keys(cartItems).length > 0) {
				const orders = Object.entries(cartItems).map(
					([souvenir_id, quantity]) => ({
						souvenir_id: parseInt(souvenir_id),
						quantity,
						personalization_text: personalization[souvenir_id] || null,
					}),
				);

				await createSouvenirOrders({
					booking_id: bookingId,
					orders,
				});
			}

			sessionStorage.removeItem("checkoutData");
			navigate("/payment-result", {
				state: { success: true, bookingId, paymentId: result.payment_id },
			});
		} catch (err) {
			showToast("Ошибка при сохранении заказов", "error");
		}
	};

	const handlePaymentError = (result) => {
		sessionStorage.removeItem("checkoutData");
		navigate("/payment-result", {
			state: { success: false, message: result.message || "Ошибка оплаты" },
		});
	};

	const handlePaymentTimeout = (result) => {
		sessionStorage.removeItem("checkoutData");
		navigate("/payment-result", {
			state: {
				success: false,
				message: "Время ожидания истекло",
				isTimeout: true,
			},
		});
	};

	const handleCreateBooking = async () => {
		if (!consentPD) {
			showToast(
				"Необходимо согласие на обработку персональных данных",
				"error",
			);
			return;
		}

		setLoading(true);

		try {
			const booking = await createBooking({
				slot_id: checkoutData.slot_id,
				participants_count: checkoutData.participants_count,
			});

			setBookingId(booking.booking_id);
			setStep(4);
		} catch (err) {
			showToast(err.message || "Ошибка создания бронирования", "error");
		} finally {
			setLoading(false);
		}
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

	const totalPrice = (checkoutData?.total_price || 0) + souvenirTotal;

	if (!checkoutData) {
		return null;
	}

	return (
		<div className="min-h-screen py-8 px-4 bg-[#F5F3FF]">
			<div className="max-w-3xl mx-auto">
				{/* Прогресс */}
				<div className="flex items-center justify-center gap-4 mb-8">
					{[1, 2, 3].map((s) => (
						<React.Fragment key={s}>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
									step >= s
										? "bg-[#6D28D9] text-white shadow-btn"
										: "bg-[#E9D5FF] text-[#6B7280]"
								}`}
							>
								{s}
							</div>
							{s < 3 && (
								<div
									className={`w-16 h-1 rounded ${
										step > s ? "bg-[#6D28D9]" : "bg-[#E9D5FF]"
									}`}
								/>
							)}
						</React.Fragment>
					))}
				</div>

				{/* Шаг 1: Данные участника */}
				{step === 1 && (
					<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-6">
						<h2 className="text-2xl font-bold text-[#1F2937] mb-6">Данные участника</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-[#1F2937] mb-1">
									ФИО *
								</label>
								<input
									type="text"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
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
									value={phone}
									onChange={(e) => setPhone(formatPhone(e.target.value))}
									placeholder="+7 (999) 123-45-67"
									className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-[#1F2937] mb-1">
									Email
								</label>
								<input
									type="email"
									value={user?.email || ""}
									disabled
									className="w-full border border-[#E9D5FF] rounded-xl px-4 py-3 bg-[#F5F3FF] text-[#6B7280]"
								/>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								onClick={handleNextStep}
								className="bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-semibold px-8 py-3 rounded-xl shadow-btn transition-all duration-200 active:scale-95"
							>
								Далее
							</button>
						</div>
					</div>
				)}

				{/* Шаг 2: Сувениры */}
				{step === 2 && (
					<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-6">
						<h2 className="text-2xl font-bold text-[#1F2937] mb-6">Брендированные сувениры</h2>

						{souvenirs.length === 0 ? (
							<div className="text-center py-8 text-[#6B7280]">
								<p>Сувениры не доступны для этого предприятия</p>
							</div>
						) : (
							<div className="grid md:grid-cols-2 gap-4">
								{souvenirs.map((souvenir) => (
									<div key={souvenir.id}>
										<SouvenirCard
											souvenir={souvenir}
											quantity={cartItems[souvenir.id] || 0}
											onAdd={handleAddSouvenir}
											onRemove={handleRemoveSouvenir}
										/>
										{cartItems[souvenir.id] > 0 &&
											souvenir.allows_personalization && (
												<div className="mt-2">
													<textarea
														placeholder="Пожелание (гравировка, имя)..."
														value={personalization[souvenir.id] || ""}
														onChange={(e) =>
															setPersonalization((prev) => ({
																...prev,
																[souvenir.id]: e.target.value,
															}))
														}
														className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9]"
														rows={2}
													/>
												</div>
											)}
									</div>
								))}
							</div>
						)}

						{souvenirTotal > 0 && (
							<div className="mt-6 p-4 bg-[#F5F3FF] rounded-xl border border-[#E9D5FF]">
								<div className="flex justify-between items-center">
									<span className="font-medium text-[#1F2937]">Стоимость сувениров:</span>
									<span className="font-bold text-lg text-[#6D28D9]">
										{souvenirTotal.toLocaleString()} ₽
									</span>
								</div>
							</div>
						)}

						<div className="mt-6 flex gap-4">
							<button
								onClick={() => setStep(1)}
								className="px-6 py-3 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl hover:bg-[#F5F3FF] transition-colors"
							>
								Назад
							</button>
							<button
								onClick={handleNextStep}
								className="flex-1 py-3 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl font-semibold shadow-btn transition-all duration-200 active:scale-95"
							>
								Далее
							</button>
						</div>
					</div>
				)}

				{/* Шаг 3: Оплата */}
				{step >= 3 && (
					<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-6">
						<h2 className="text-2xl font-bold text-[#1F2937] mb-6">Подтверждение и оплата</h2>

						{/* Детали заказа */}
						<div className="bg-[#F5F3FF] rounded-xl p-4 mb-6 border border-[#E9D5FF]">
							<h4 className="font-medium text-[#1F2937] mb-3">Детали заказа:</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-[#6B7280]">Экскурсия:</span>
									<span className="text-[#1F2937]">{checkoutData.excursion_title}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[#6B7280]">Дата:</span>
									<span className="text-[#1F2937]">
										{new Date(checkoutData.slot_datetime).toLocaleString("ru-RU")}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[#6B7280]">Участников:</span>
									<span className="text-[#1F2937]">{checkoutData.participants_count}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[#6B7280]">Цена за экскурсию:</span>
									<span className="text-[#1F2937]">{checkoutData.total_price.toLocaleString()} ₽</span>
								</div>
								{souvenirTotal > 0 && (
									<div className="flex justify-between">
										<span className="text-[#6B7280]">Сувениры:</span>
										<span className="text-[#1F2937]">{souvenirTotal.toLocaleString()} ₽</span>
									</div>
								)}
								<div className="flex justify-between font-bold text-lg pt-2 border-t border-[#E9D5FF]">
									<span className="text-[#1F2937]">Итого:</span>
									<span className="text-[#6D28D9]">
										{totalPrice.toLocaleString()} ₽
									</span>
								</div>
							</div>
						</div>

						{/* Согласие на ПД */}
						<label className="flex items-start gap-3 mb-6 cursor-pointer">
							<input
								type="checkbox"
								checked={consentPD}
								onChange={(e) => setConsentPD(e.target.checked)}
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
								</button>
							</span>
						</label>

						{/* Модальное окно согласия на обработку ПД */}
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

						{bookingId && (
							<PaymentEmulator
								bookingId={bookingId}
								onSuccess={handlePaymentSuccess}
								onError={handlePaymentError}
								onTimeout={handlePaymentTimeout}
							/>
						)}

						{!bookingId && (
							<button
								onClick={handleCreateBooking}
								disabled={loading || !consentPD}
								className="w-full mt-4 py-3 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl font-semibold shadow-btn transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:shadow-none"
							>
								{loading ? "Создание бронирования..." : "Создать бронь и оплатить"}
							</button>
						)}

						<div className="mt-4 flex justify-start">
							<button
								onClick={() => setStep(2)}
								className="px-6 py-3 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl hover:bg-[#F5F3FF] transition-colors"
							>
								Назад
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Checkout;