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

	// Данные участника
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");

	// Сувениры
	const [souvenirs, setSouvenirs] = useState([]);
	const [cartItems, setCartItems] = useState({}); // { souvenir_id: quantity }
	const [personalization, setPersonalization] = useState({}); // { souvenir_id: text }

	// Оплата
	const [consentPD, setConsentPD] = useState(false);
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

	// Рассчитываем стоимость сувениров
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
			// Если есть сувениры, создаём заказы
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
			setStep(4); // Переходим к оплате
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
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-3xl mx-auto">
				{/* Прогресс */}
				<div className="flex items-center justify-center gap-4 mb-8">
					{[1, 2, 3].map((s) => (
						<React.Fragment key={s}>
							<div
								className={`
                w-8 h-8 rounded-full flex items-center justify-center font-semibold
                ${step >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}
              `}
							>
								{s}
							</div>
							{s < 3 && (
								<div
									className={`w-16 h-1 rounded ${step > s ? "bg-primary" : "bg-gray-200"}`}
								/>
							)}
						</React.Fragment>
					))}
				</div>

				{/* Шаг 1: Данные участника */}
				{step === 1 && (
					<div className="bg-white rounded-2xl p-6">
						<h2 className="text-2xl font-bold mb-6">Данные участника</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									ФИО *
								</label>
								<input
									type="text"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									placeholder="Иванов Иван Иванович"
									className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Телефон *
								</label>
								<input
									type="tel"
									value={phone}
									onChange={(e) => setPhone(formatPhone(e.target.value))}
									placeholder="+7 (999) 123-45-67"
									className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									type="email"
									value={user?.email || ""}
									disabled
									className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50"
								/>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								onClick={handleNextStep}
								className="px-8 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors"
							>
								Далее
							</button>
						</div>
					</div>
				)}

				{/* Шаг 2: Сувениры */}
				{step === 2 && (
					<div className="bg-white rounded-2xl p-6">
						<h2 className="text-2xl font-bold mb-6">Брендированные сувениры</h2>

						{souvenirs.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
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
														className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
														rows={2}
													/>
												</div>
											)}
									</div>
								))}
							</div>
						)}

						{souvenirTotal > 0 && (
							<div className="mt-6 p-4 bg-gray-50 rounded-xl">
								<div className="flex justify-between items-center">
									<span className="font-medium">Стоимость сувениров:</span>
									<span className="font-bold text-lg">
										{souvenirTotal.toLocaleString()} ₽
									</span>
								</div>
							</div>
						)}

						<div className="mt-6 flex gap-4">
							<button
								onClick={() => setStep(1)}
								className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
							>
								Назад
							</button>
							<button
								onClick={handleNextStep}
								className="flex-1 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors"
							>
								Пропустить
							</button>
						</div>
					</div>
				)}

				{/* Шаг 3: Оплата */}
				{step >= 3 && (
					<div className="bg-white rounded-2xl p-6">
						<h2 className="text-2xl font-bold mb-6">Подтверждение и оплата</h2>

						{/* Детали заказа */}
						<div className="bg-gray-50 rounded-xl p-4 mb-6">
							<h4 className="font-medium mb-3">Детали заказа:</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-500">Экскурсия:</span>
									<span>{checkoutData.excursion_title}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Дата:</span>
									<span>
										{new Date(checkoutData.slot_datetime).toLocaleString(
											"ru-RU",
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Участников:</span>
									<span>{checkoutData.participants_count}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Цена за экскурсию:</span>
									<span>{checkoutData.total_price.toLocaleString()} ₽</span>
								</div>
								{souvenirTotal > 0 && (
									<div className="flex justify-between">
										<span className="text-gray-500">Сувениры:</span>
										<span>{souvenirTotal.toLocaleString()} ₽</span>
									</div>
								)}
								<div className="flex justify-between font-bold text-lg pt-2 border-t">
									<span>Итого:</span>
									<span className="text-primary">
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
								className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span className="text-sm text-gray-600">
								Я согласен на обработку персональных данных в соответствии с
								политикой конфиденциальности
							</span>
						</label>

						{/* Эмулятор оплаты — только после создания брони */}
						{bookingId && (
							<PaymentEmulator
								bookingId={bookingId}
								onSuccess={handlePaymentSuccess}
								onError={handlePaymentError}
								onTimeout={handlePaymentTimeout}
							/>
						)}

						{/* Кнопка создания брони — только до создания */}
						{!bookingId && (
							<button
								onClick={handleCreateBooking}
								disabled={loading || !consentPD}
								className="w-full mt-4 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
							>
								{loading
									? "Создание бронирования..."
									: "Создать бронь и оплатить"}
							</button>
						)}

						<div className="mt-4 flex justify-start">
							<button
								onClick={() => setStep(2)}
								className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
