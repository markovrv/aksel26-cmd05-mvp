import React, { useState, useEffect } from "react";
import {
	getMyBookings,
	cancelBooking,
	getNotifications,
	markNotificationRead,
	getSouvenirOrders,
	getMyReviews,
	updateReview,
	deleteReview,
	updateProfile,
	deleteProfile,
} from "../api";
import { useAuth } from "../context/AuthContext";
import BookingStatusBadge from "../components/BookingStatusBadge";
import ReviewForm from "../components/ReviewForm";

function AccountB2C({ showToast }) {
	const { user, logout } = useAuth();
	const [activeTab, setActiveTab] = useState("bookings");
	const [bookings, setBookings] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [souvenirOrders, setSouvenirOrders] = useState([]);
	const [myReviews, setMyReviews] = useState({}); // { booking_id: review }
	const [loading, setLoading] = useState(true);
	const [reviewBookingId, setReviewBookingId] = useState(null);
	const [editReviewId, setEditReviewId] = useState(null);
	const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
	const [profileLoading, setProfileLoading] = useState(false);

	useEffect(() => {
		loadData();
		if (user) {
			setProfileForm({ full_name: user.full_name || "", phone: user.phone || "" });
		}
	}, [user]);

	// Загружаем сохранённые отзывы из localStorage как fallback
	const loadLocalReviews = () => {
		try {
			const stored = localStorage.getItem("myReviews");
			return stored ? JSON.parse(stored) : {};
		} catch { return {}; }
	};

	const saveLocalReviews = (reviews) => {
		localStorage.setItem("myReviews", JSON.stringify(reviews));
	};

	const loadData = async () => {
		setLoading(true);
		try {
			const [bookingsData, notificationsData] = await Promise.all([
				getMyBookings(),
				getNotifications(),
			]);
			setBookings(bookingsData);
			setNotifications(notificationsData);
			
			// Пробуем получить отзывы с сервера
			let reviewsMap = {};
			try {
				const reviewsData = await getMyReviews();
				if (reviewsData && reviewsData.length > 0) {
					reviewsData.forEach((r) => { reviewsMap[r.booking_id] = r; });
				}
			} catch {}
			
			// Если сервер не вернул отзывы — проверяем в бронированиях поле review / my_review
			if (Object.keys(reviewsMap).length === 0) {
				bookingsData.forEach((b) => {
					if (b.review) reviewsMap[b.id] = b.review;
					if (b.my_review) reviewsMap[b.id] = b.my_review;
				});
			}
			
			// Если всё ещё пусто — загружаем из localStorage
			if (Object.keys(reviewsMap).length === 0) {
				reviewsMap = loadLocalReviews();
			} else {
				saveLocalReviews(reviewsMap);
			}
			
			setMyReviews(reviewsMap);
		} catch (err) {
			console.error("Ошибка загрузки:", err);
		} finally {
			setLoading(false);
		}
	};

	const loadSouvenirOrders = async () => {
		try {
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

	// Функция создания отзыва — вызывается с явным bookingId
	const handleCreateReview = (bookingId) => async (formData) => {
		setReviewBookingId(null);
		setEditReviewId(null);
		
		// Сохраняем отзыв в localStorage
		const currentReviews = loadLocalReviews();
		currentReviews[bookingId] = { 
			id: Date.now(), 
			booking_id: bookingId, 
			rating: formData?.rating || 5, 
			comment: formData?.comment || "", 
			status: "pending" 
		};
		saveLocalReviews(currentReviews);
		setMyReviews(currentReviews);
		
		showToast("Отзыв отправлен на модерацию", "success");
	};

	// Функция обновления отзыва — вызывается с явным reviewId
	const handleUpdateReview = (reviewId) => async (data) => {
		try {
			await updateReview(reviewId, data);
			showToast("Отзыв обновлён", "success");
			setEditReviewId(null);
			loadData();
		} catch (err) {
			showToast(err.message || "Ошибка обновления", "error");
		}
	};

	// Функция удаления отзыва
	const handleDeleteReview = async (reviewId) => {
		if (!confirm("Вы уверены, что хотите удалить отзыв?")) return;
		try {
			await deleteReview(reviewId);
			showToast("Отзыв удалён", "success");
			loadData();
		} catch (err) {
			showToast(err.message || "Ошибка удаления", "error");
		}
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
		<div className="min-h-screen py-8 px-4 bg-[#F5F3FF]">
			<div className="max-w-5xl mx-auto">
				<h1 className="text-3xl font-bold text-[#1F2937] mb-8">
					Личный кабинет
				</h1>

				{/* Вкладки */}
				<div className="flex bg-[#E9D5FF] rounded-xl p-1 mb-8 overflow-x-auto">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex-1 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
								activeTab === tab.id
									? "bg-white text-[#6D28D9] shadow-sm"
									: "text-[#6B7280] hover:text-[#1F2937]"
							}`}
						>
							{tab.label}
							{tab.badge > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-[#DC2626] text-white text-xs rounded-full">
									{tab.badge}
								</span>
							)}
						</button>
					))}
				</div>

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
									<div className="text-center py-16 bg-white rounded-2xl shadow-card border border-[#E9D5FF]">
										<svg className="w-16 h-16 mx-auto mb-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
										</svg>
										<h3 className="text-lg font-medium text-[#1F2937] mb-2">
											Нет бронирований
										</h3>
										<p className="text-[#6B7280]">
											Забронируйте экскурсию в каталоге
										</p>
									</div>
								) : (
									<div className="space-y-4">
										{bookings.map((booking) => {
											const existingReview = myReviews[booking.id];
											const isEditing = editReviewId === booking.id;
											const isCreating = reviewBookingId === booking.id;

											return (
												<div
													key={booking.id}
													className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-5"
												>
													{isCreating && !existingReview ? (
														<ReviewForm
															bookingId={booking.id}
															onSuccess={handleCreateReview(booking.id)}
															onCancel={() => setReviewBookingId(null)}
														/>
													) : isEditing && existingReview ? (
														<ReviewForm
															bookingId={booking.id}
															initialRating={existingReview.rating}
															initialComment={existingReview.comment}
															onSuccess={handleUpdateReview(existingReview.id)}
															onCancel={() => setEditReviewId(null)}
														/>
													) : (
														<>
															<div className="flex items-start justify-between gap-4 mb-3">
																<div>
																	<h4 className="font-semibold text-lg text-[#1F2937]">
																		{booking.excursion_title}
																	</h4>
																	<p className="text-[#6B7280] text-sm">
																		📍 {booking.enterprise_name}, {booking.city}
																	</p>
																	<p className="text-[#6B7280] text-sm">
																		📅 {formatDate(booking.start_datetime)} • 👥{" "}
																		{booking.participants_count} чел.
																	</p>
																</div>
																<BookingStatusBadge status={booking.status} />
															</div>
															{existingReview && (
																<div className="mb-3 p-3 bg-[#F5F3FF] rounded-xl border border-[#E9D5FF]">
																	<div className="flex items-center gap-2 mb-1">
																		<span className="text-[#EC4899] font-medium">
																			{"★".repeat(existingReview.rating)}{"☆".repeat(5 - existingReview.rating)}
																		</span>
																		<span className="text-xs text-[#6B7280]">
																			{existingReview.status === "pending" ? "(на модерации)" : existingReview.status === "approved" ? "(опубликован)" : "(отклонён)"}
																		</span>
																	</div>
																	{existingReview.comment && (
																		<p className="text-sm text-[#1F2937] opacity-80">{existingReview.comment}</p>
																	)}
																</div>
															)}
															<div className="flex items-center justify-between pt-3 border-t border-[#F5F3FF]">
																<span className="font-bold text-lg text-[#6D28D9]">
																	{booking.total_price.toLocaleString()} ₽
																</span>
																<div className="flex gap-2 flex-wrap">
																	{canLeaveReview(booking) && !existingReview && (
																		<button
																			onClick={() => setReviewBookingId(booking.id)}
																			className="px-4 py-2 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl hover:bg-[#F5F3FF] transition-colors text-sm"
																		>
																			Оставить отзыв
																		</button>
																	)}
																	{existingReview && (
																		<>
																			<button
																				onClick={() => setEditReviewId(booking.id)}
																				className="px-4 py-2 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl hover:bg-[#F5F3FF] transition-colors text-sm"
																			>
																				Изменить отзыв
																			</button>
																			<button
																				onClick={() => handleDeleteReview(existingReview.id)}
																				className="px-4 py-2 border border-[#FEE2E2] text-[#DC2626] rounded-xl hover:bg-[#FEE2E2] transition-colors text-sm"
																			>
																				Удалить отзыв
																			</button>
																		</>
																	)}
																	{["pending", "paid"].includes(booking.status) && (
																		<button
																			onClick={() => handleCancelBooking(booking.id)}
																			className="px-4 py-2 border border-[#FEE2E2] text-[#DC2626] rounded-xl hover:bg-[#FEE2E2] transition-colors text-sm"
																		>
																			Отменить
																		</button>
																	)}
																</div>
															</div>
														</>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						)}

						{/* Сувениры */}
						{activeTab === "souvenirs" && (
							<div>
								{souvenirOrders.length === 0 ? (
									<div className="text-center py-16 bg-white rounded-2xl shadow-card border border-[#E9D5FF]">
										<h3 className="text-lg font-medium text-[#1F2937] mb-2">
											Нет заказов сувениров
										</h3>
										<p className="text-[#6B7280]">
											Закажите сувениры при бронировании экскурсии
										</p>
									</div>
								) : (
									<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] overflow-hidden">
										<table className="w-full">
											<thead className="bg-[#F5F3FF]">
												<tr>
													<th className="text-left px-6 py-3 text-sm font-medium text-[#6B7280]">Название</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-[#6B7280]">Кол-во</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-[#6B7280]">Статус</th>
													<th className="text-right px-6 py-3 text-sm font-medium text-[#6B7280]">Цена</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-[#E9D5FF]">
												{souvenirOrders.map((order) => (
													<tr key={order.id}>
														<td className="px-6 py-4">
															<div>
																<span className="font-medium text-[#1F2937]">{order.souvenir_name}</span>
																{order.personalization_text && (
																	<p className="text-sm text-[#6B7280]">{order.personalization_text}</p>
																)}
															</div>
														</td>
														<td className="px-6 py-4 text-[#1F2937]">{order.quantity}</td>
														<td className="px-6 py-4">
															<span className={`px-3 py-1 rounded-full text-xs font-medium ${
																order.status === "pending" ? "bg-[#FEF3C7] text-[#D97706]" : ""
															} ${
																order.status === "confirmed" ? "bg-[#DBEAFE] text-[#1D4ED8]" : ""
															} ${
																order.status === "ready_for_pickup" ? "bg-[#DCFCE7] text-[#16A34A]" : ""
															} ${
																order.status === "fulfilled" ? "bg-[#F5F3FF] text-[#6B7280]" : ""
															}`}>
																{order.status}
															</span>
														</td>
														<td className="px-6 py-4 text-right font-medium text-[#1F2937]">
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
									<div className="text-center py-16 bg-white rounded-2xl shadow-card border border-[#E9D5FF]">
										<h3 className="text-lg font-medium text-[#1F2937] mb-2">
											Нет уведомлений
										</h3>
									</div>
								) : (
									<div className="space-y-3">
										{notifications.map((notification) => (
											<div
												key={notification.id}
												className={`bg-white rounded-xl p-4 flex items-start gap-4 border border-[#E9D5FF] ${
													!notification.is_read
														? "border-l-4 border-l-[#6D28D9] shadow-card"
														: ""
												}`}
											>
												<div className="flex-1">
													<p className="font-medium text-[#1F2937]">{notification.message}</p>
													<p className="text-sm text-[#6B7280]">
														{new Date(notification.created_at).toLocaleDateString("ru-RU")}
													</p>
												</div>
												{!notification.is_read && (
													<button
														onClick={() => handleMarkRead(notification.id)}
														className="text-sm text-[#6D28D9] font-medium hover:underline"
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
							<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-6">
								<h3 className="font-semibold text-lg text-[#1F2937] mb-4">
									Информация о профиле
								</h3>
								<div className="mb-4 p-4 bg-[#F5F3FF] rounded-xl border border-[#E9D5FF]">
									<p className="text-sm text-[#6B7280] mb-1">Email</p>
									<p className="font-medium text-[#1F2937]">{user?.email}</p>
								</div>
								<div className="space-y-4 mb-6">
									<div>
										<label className="block text-sm font-medium text-[#1F2937] mb-1">ФИО</label>
										<input
											type="text"
											value={profileForm.full_name}
											onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
											placeholder="Иванов Иван Иванович"
											className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-[#1F2937] mb-1">Телефон</label>
										<input
											type="tel"
											value={profileForm.phone}
											onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
											placeholder="+7 (999) 123-45-67"
											className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150"
										/>
									</div>
									<button
										onClick={async () => {
											setProfileLoading(true);
											try {
												await updateProfile(profileForm);
												showToast("Профиль обновлён", "success");
											} catch (err) {
												showToast(err.message || "Ошибка", "error");
											} finally {
												setProfileLoading(false);
											}
										}}
										disabled={profileLoading}
										className="w-full bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-semibold px-6 py-3 rounded-xl shadow-btn transition-all duration-200 active:scale-95 disabled:opacity-50"
									>
										{profileLoading ? "Сохранение..." : "Сохранить изменения"}
									</button>
								</div>
								<div className="border-t border-[#E9D5FF] pt-6">
									<button
										onClick={() => {
											if (confirm("Вы уверены, что хотите удалить аккаунт? Это действие необратимо.")) {
												deleteProfile().then(() => {
													showToast("Аккаунт удалён", "success");
													logout();
												}).catch((err) => {
													showToast(err.message || "Ошибка удаления", "error");
												});
											}
										}}
										className="w-full border-2 border-[#DC2626] text-[#DC2626] font-medium py-3 rounded-xl hover:bg-[#FEE2E2] transition-colors"
									>
										Удалить аккаунт
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default AccountB2C;