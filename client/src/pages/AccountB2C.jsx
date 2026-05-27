import React, { useState, useEffect } from "react";
import {
	getMyBookings,
	cancelBooking,
	getNotifications,
	markNotificationRead,
	getSouvenirOrders,
} from "../api";
import BookingStatusBadge from "../components/BookingStatusBadge";
import ReviewForm from "../components/ReviewForm";

function AccountB2C({ showToast }) {
	const [activeTab, setActiveTab] = useState("bookings");
	const [bookings, setBookings] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [souvenirOrders, setSouvenirOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [reviewBookingId, setReviewBookingId] = useState(null);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			const [bookingsData, notificationsData] = await Promise.all([
				getMyBookings(),
				getNotifications(),
			]);
			setBookings(bookingsData);
			setNotifications(notificationsData);
		} catch (err) {
			console.error("Ошибка загрузки:", err);
		} finally {
			setLoading(false);
		}
	};

	const loadSouvenirOrders = async () => {
		try {
			// Получаем заказы для всех бронирований
			const ordersPromises = bookings
				.filter((b) => ["paid", "confirmed", "completed"].includes(b.status))
				.map((b) => getSouvenirOrders(b.id).catch(() => []));

			const ordersArrays = await Promise.all(ordersPromises);
			const allOrders = ordersArrays.flat();
			setSouvenirOrders(allOrders);
		} catch (err) {
			console.error("Ошибка загрузки заказов сувениров:", err);
		}
	};

	useEffect(() => {
		if (activeTab === "souvenirs") {
			loadSouvenirOrders();
		}
	}, [activeTab]);

	const handleCancelBooking = async (bookingId) => {
		if (!confirm("Вы уверены, что хотите отменить бронирование?")) return;

		try {
			await cancelBooking(bookingId);
			showToast("Бронирование отменено", "success");
			loadData();
		} catch (err) {
			showToast(err.message || "Ошибка отмены", "error");
		}
	};

	const handleMarkRead = async (id) => {
		try {
			await markNotificationRead(id);
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
			);
		} catch (err) {
			console.error("Ошибка:", err);
		}
	};

	const handleReviewSuccess = () => {
		setReviewBookingId(null);
		showToast("Отзыв отправлен на модерацию", "success");
		loadData();
	};

	const tabs = [
		{ id: "bookings", label: "Бронирования" },
		{ id: "souvenirs", label: "Сувениры" },
		{
			id: "notifications",
			label: "Уведомления",
			badge: notifications.filter((n) => !n.is_read).length,
		},
		{ id: "profile", label: "Профиль" },
	];

	const canLeaveReview = (booking) => {
		if (booking.status !== "completed") return false;
		const excursionDate = new Date(booking.start_datetime);
		return excursionDate < new Date();
	};

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-5xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Личный кабинет
				</h1>

				{/* Вкладки */}
				<div className="flex gap-2 mb-8 overflow-x-auto pb-2">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`
                px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors
                ${
									activeTab === tab.id
										? "bg-primary text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}
              `}
						>
							{tab.label}
							{tab.badge > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
									{tab.badge}
								</span>
							)}
						</button>
					))}
				</div>

				{/* Содержимое вкладок */}
				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-24 skeleton rounded-2xl"></div>
						))}
					</div>
				) : (
					<>
						{/* Бронирования */}
						{activeTab === "bookings" && (
							<div>
								{bookings.length === 0 ? (
									<div className="text-center py-16 bg-white rounded-2xl">
										<svg
											className="w-16 h-16 mx-auto mb-4 text-gray-300"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
											/>
										</svg>
										<h3 className="text-lg font-medium text-gray-600 mb-2">
											Нет бронирований
										</h3>
										<p className="text-gray-500">
											Забронируйте экскурсию в каталоге
										</p>
									</div>
								) : (
									<div className="space-y-4">
										{bookings.map((booking) => (
											<div
												key={booking.id}
												className="bg-white rounded-2xl p-5 border border-gray-100"
											>
												{reviewBookingId === booking.id ? (
													<ReviewForm
														bookingId={booking.id}
														onSuccess={handleReviewSuccess}
														onCancel={() => setReviewBookingId(null)}
													/>
												) : (
													<>
														<div className="flex items-start justify-between gap-4 mb-3">
															<div>
																<h4 className="font-semibold text-lg">
																	{booking.excursion_title}
																</h4>
																<p className="text-gray-500 text-sm">
																	📍 {booking.enterprise_name}, {booking.city}
																</p>
																<p className="text-gray-500 text-sm">
																	📅 {formatDate(booking.start_datetime)} • 👥{" "}
																	{booking.participants_count} чел.
																</p>
															</div>
															<BookingStatusBadge status={booking.status} />
														</div>
														<div className="flex items-center justify-between pt-3 border-t">
															<span className="font-bold text-lg">
																{booking.total_price.toLocaleString()} ₽
															</span>
															<div className="flex gap-2">
																{canLeaveReview(booking) && (
																	<button
																		onClick={() =>
																			setReviewBookingId(booking.id)
																		}
																		className="px-4 py-2 text-primary border border-primary rounded-xl hover:bg-blue-50 transition-colors"
																	>
																		Оставить отзыв
																	</button>
																)}
																{["pending", "paid"].includes(
																	booking.status,
																) && (
																	<button
																		onClick={() =>
																			handleCancelBooking(booking.id)
																		}
																		className="px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
																	>
																		Отменить
																	</button>
																)}
															</div>
														</div>
													</>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{/* Сувениры */}
						{activeTab === "souvenirs" && (
							<div>
								{souvenirOrders.length === 0 ? (
									<div className="text-center py-16 bg-white rounded-2xl">
										<h3 className="text-lg font-medium text-gray-600 mb-2">
											Нет заказов сувениров
										</h3>
										<p className="text-gray-500">
											Закажите сувениры при бронировании экскурсии
										</p>
									</div>
								) : (
									<div className="bg-white rounded-2xl overflow-hidden">
										<table className="w-full">
											<thead className="bg-gray-50">
												<tr>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Название
													</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Кол-во
													</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Статус
													</th>
													<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
														Цена
													</th>
												</tr>
											</thead>
											<tbody className="divide-y">
												{souvenirOrders.map((order) => (
													<tr key={order.id}>
														<td className="px-6 py-4">
															<div>
																<span className="font-medium">
																	{order.souvenir_name}
																</span>
																{order.personalization_text && (
																	<p className="text-sm text-gray-500">
																		{order.personalization_text}
																	</p>
																)}
															</div>
														</td>
														<td className="px-6 py-4">{order.quantity}</td>
														<td className="px-6 py-4">
															<span
																className={`px-3 py-1 rounded-full text-xs font-medium
                                ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${order.status === "confirmed" ? "bg-blue-100 text-blue-800" : ""}
                                ${order.status === "ready_for_pickup" ? "bg-green-100 text-green-800" : ""}
                                ${order.status === "fulfilled" ? "bg-gray-100 text-gray-800" : ""}
                              `}
															>
																{order.status}
															</span>
														</td>
														<td className="px-6 py-4 text-right font-medium">
															{order.final_price.toLocaleString()} ₽
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}

						{/* Уведомления */}
						{activeTab === "notifications" && (
							<div>
								{notifications.length === 0 ? (
									<div className="text-center py-16 bg-white rounded-2xl">
										<h3 className="text-lg font-medium text-gray-600 mb-2">
											Нет уведомлений
										</h3>
									</div>
								) : (
									<div className="space-y-3">
										{notifications.map((notification) => (
											<div
												key={notification.id}
												className={`bg-white rounded-xl p-4 flex items-start gap-4 ${
													!notification.is_read
														? "border-l-4 border-primary"
														: ""
												}`}
											>
												<div className="flex-1">
													<p className="font-medium">{notification.message}</p>
													<p className="text-sm text-gray-500">
														{new Date(
															notification.created_at,
														).toLocaleDateString("ru-RU")}
													</p>
												</div>
												{!notification.is_read && (
													<button
														onClick={() => handleMarkRead(notification.id)}
														className="text-sm text-primary hover:underline"
													>
														Прочитано
													</button>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{/* Профиль */}
						{activeTab === "profile" && (
							<div className="bg-white rounded-2xl p-6">
								<h3 className="font-semibold text-lg mb-4">
									Информация о профиле
								</h3>
								<p className="text-gray-500">
									Раздел редактирования профиля в разработке
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default AccountB2C;
