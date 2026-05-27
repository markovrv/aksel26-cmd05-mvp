import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getExcursion } from "../api";
import { useAuth } from "../context/AuthContext";
import SlotPicker from "../components/SlotPicker";
import SouvenirCard from "../components/SouvenirCard";
import ReviewList from "../components/ReviewList";

function Excursion({ showToast }) {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();

	const [excursion, setExcursion] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedSlot, setSelectedSlot] = useState(null);
	const [participantsCount, setParticipantsCount] = useState(1);
	const [currentPrice, setCurrentPrice] = useState(0);

	useEffect(() => {
		loadExcursion();
	}, [id]);

	useEffect(() => {
		if (selectedSlot) {
			setCurrentPrice(selectedSlot.price_per_person * participantsCount);
		}
	}, [selectedSlot, participantsCount]);

	const loadExcursion = async () => {
		try {
			const data = await getExcursion(id);
			setExcursion(data);
		} catch (err) {
			showToast("Ошибка загрузки экскурсии", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleProceedToCheckout = () => {
		if (!user) {
			showToast("Для бронирования необходимо авторизоваться", "warning");
			navigate("/login");
			return;
		}

		if (!selectedSlot) {
			showToast("Выберите дату и время", "warning");
			return;
		}

		// Сохраняем данные для checkout
		const checkoutData = {
			excursion_id: id,
			slot_id: selectedSlot.id,
			participants_count: participantsCount,
			total_price: currentPrice,
			enterprise_id: excursion.enterprise_id,
			excursion_title: excursion.title,
			slot_datetime: selectedSlot.start_datetime,
			price_per_person: selectedSlot.price_per_person,
		};

		sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
		navigate("/checkout");
	};

	const handleParticipantsChange = (delta) => {
		const newCount = participantsCount + delta;
		const maxSlots = selectedSlot?.available_slots || 99;

		if (newCount >= 1 && newCount <= maxSlots) {
			setParticipantsCount(newCount);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen py-8 px-4">
				<div className="max-w-7xl mx-auto">
					<div className="grid lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<div className="h-64 skeleton rounded-2xl mb-6"></div>
							<div className="h-8 skeleton w-3/4 mb-4"></div>
							<div className="h-4 skeleton mb-2"></div>
							<div className="h-4 skeleton w-1/2"></div>
						</div>
						<div className="h-96 skeleton rounded-2xl"></div>
					</div>
				</div>
			</div>
		);
	}

	if (!excursion) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Экскурсия не найдена
					</h2>
					<Link to="/catalog" className="text-primary hover:underline">
						Вернуться в каталог
					</Link>
				</div>
			</div>
		);
	}

	const photos =
		excursion.enterprise_photos?.length > 0
			? excursion.enterprise_photos
			: ["https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800"];

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Левая колонка */}
					<div className="lg:col-span-2">
						{/* Галерея */}
						<div className="bg-white rounded-2xl overflow-hidden mb-6">
							<div className="h-64 md:h-80">
								<img
									src={photos[0]}
									alt={excursion.title}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>

						{/* Информация */}
						<div className="bg-white rounded-2xl p-6 mb-6">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{excursion.title}
							</h1>

							<div className="flex flex-wrap gap-4 text-gray-500 mb-4">
								<Link
									to={`/enterprise/${excursion.enterprise_id}`}
									className="hover:text-primary"
								>
									🏭 {excursion.enterprise_name}
								</Link>
								<span>📍 {excursion.city}</span>
								<span>⏱ {excursion.duration_minutes} минут</span>
								<span>👥 до {excursion.max_participants} человек</span>
							</div>

							<h3 className="font-semibold text-lg mb-2">Описание</h3>
							<p className="text-gray-600 leading-relaxed mb-4">
								{excursion.description}
							</p>

							<h3 className="font-semibold text-lg mb-2">О предприятии</h3>
							<p className="text-gray-600 leading-relaxed mb-4">
								{excursion.enterprise_description}
							</p>
							<p className="text-gray-500 text-sm">📍 {excursion.address}</p>
						</div>

						{/* Сувениры */}
						{excursion.souvenirs?.length > 0 && (
							<div className="bg-white rounded-2xl p-6 mb-6">
								<h3 className="font-semibold text-lg mb-4">
									Сувениры предприятия
								</h3>
								<div className="flex gap-4 overflow-x-auto pb-2">
									{excursion.souvenirs.map((souvenir) => (
										<div key={souvenir.id} className="shrink-0 w-48">
											<SouvenirCard souvenir={souvenir} showControls={false} />
										</div>
									))}
								</div>
							</div>
						)}

						{/* Отзывы */}
						<div className="bg-white rounded-2xl p-6">
							<h3 className="font-semibold text-lg mb-4">Отзывы</h3>
							<ReviewList reviews={excursion.reviews || []} />
						</div>
					</div>

					{/* Правая колонка - бронирование */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-2xl p-6 sticky top-24">
							<h3 className="font-semibold text-lg mb-4">
								Выберите дату и время
							</h3>

							<SlotPicker
								slots={excursion.slots || []}
								selectedSlot={selectedSlot}
								onSelect={setSelectedSlot}
								maxParticipants={participantsCount}
							/>

							{selectedSlot && (
								<>
									<div className="border-t border-gray-100 my-4 pt-4">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Количество участников
										</label>
										<div className="flex items-center gap-4">
											<button
												onClick={() => handleParticipantsChange(-1)}
												disabled={participantsCount <= 1}
												className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M20 12H4"
													/>
												</svg>
											</button>
											<span className="text-xl font-semibold w-8 text-center">
												{participantsCount}
											</span>
											<button
												onClick={() => handleParticipantsChange(1)}
												disabled={
													participantsCount >= selectedSlot.available_slots
												}
												className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 4v16m8-8H4"
													/>
												</svg>
											</button>
										</div>
										<p className="text-sm text-gray-500 mt-2">
											Максимум: {selectedSlot.available_slots}{" "}
											{selectedSlot.available_slots === 1 ? "место" : "мест"}
										</p>
									</div>

									<div className="border-t border-gray-100 py-4 mb-4">
										<div className="flex justify-between items-center mb-2">
											<span className="text-gray-500">Цена за человека:</span>
											<span className="font-medium">
												{selectedSlot.price_per_person.toLocaleString()} ₽
											</span>
										</div>
										<div className="flex justify-between items-center text-xl font-bold">
											<span>Итого:</span>
											<span className="text-primary">
												{currentPrice.toLocaleString()} ₽
											</span>
										</div>
									</div>
								</>
							)}

							<button
								onClick={handleProceedToCheckout}
								disabled={!selectedSlot}
								className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{selectedSlot ? "Перейти к оформлению" : "Выберите слот"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Excursion;
