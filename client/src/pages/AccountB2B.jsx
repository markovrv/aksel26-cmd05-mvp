import React, { useState, useEffect } from "react";
import {
	getEnterpriseBookings,
	completeBooking,
	getEnterpriseSouvenirOrders,
	confirmSouvenirOrder,
	rejectSouvenirOrder,
} from "../api";
import BookingStatusBadge from "../components/BookingStatusBadge";

function AccountB2B({ showToast }) {
	const [activeTab, setActiveTab] = useState("dashboard");
	const [bookings, setBookings] = useState([]);
	const [souvenirOrders, setSouvenirOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			const [bookingsData, ordersData] = await Promise.all([
				getEnterpriseBookings(),
				getEnterpriseSouvenirOrders(),
			]);
			setBookings(bookingsData);
			setSouvenirOrders(ordersData);
		} catch (err) {
			console.error("Ошибка загрузки:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleCompleteBooking = async (bookingId) => {
		try {
			await completeBooking(bookingId);
			showToast("Экскурсия отмечена как проведённая", "success");
			loadData();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleConfirmOrder = async (orderId) => {
		try {
			await confirmSouvenirOrder(orderId);
			showToast("Заказ подтверждён", "success");
			loadData();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleRejectOrder = async (orderId) => {
		try {
			await rejectSouvenirOrder(orderId);
			showToast("Заказ отклонён", "success");
			loadData();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const tabs = [
		{ id: "dashboard", label: "Сводка" },
		{ id: "bookings", label: "Заявки" },
		{ id: "souvenirs", label: "Заказы мерча" },
	];

	const todayBookings = bookings.filter((b) => {
		const today = new Date().toDateString();
		return new Date(b.start_datetime).toDateString() === today;
	});

	const pendingOrders = souvenirOrders.filter((o) => o.status === "pending");

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Кабинет предприятия
				</h1>

				{/* Вкладки */}
				<div className="flex gap-2 mb-8">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`
                px-4 py-2 rounded-xl font-medium transition-colors
                ${
									activeTab === tab.id
										? "bg-primary text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}
              `}
						>
							{tab.label}
							{tab.id === "souvenirs" && pendingOrders.length > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
									{pendingOrders.length}
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
						{/* Сводка */}
						{activeTab === "dashboard" && (
							<div className="grid md:grid-cols-3 gap-6">
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<h4 className="text-sm text-gray-500 mb-2">
										Экскурсий сегодня
									</h4>
									<div className="text-4xl font-bold text-primary">
										{todayBookings.length}
									</div>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<h4 className="text-sm text-gray-500 mb-2">Всего заявок</h4>
									<div className="text-4xl font-bold text-primary">
										{bookings.length}
									</div>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<h4 className="text-sm text-gray-500 mb-2">
										Ожидают подтверждения
									</h4>
									<div className="text-4xl font-bold text-accent">
										{pendingOrders.length}
									</div>
								</div>

								{todayBookings.length > 0 && (
									<div className="md:col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
										<h4 className="font-semibold mb-4">Экскурсии сегодня</h4>
										<div className="space-y-3">
											{todayBookings.slice(0, 3).map((booking) => (
												<div
													key={booking.id}
													className="flex items-center justify-between py-2 border-b last:border-0"
												>
													<div>
														<span className="font-medium">
															{booking.excursion_title}
														</span>
														<span className="text-gray-500 ml-2">
															{booking.user_name}
														</span>
													</div>
													<BookingStatusBadge status={booking.status} />
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Заявки */}
						{activeTab === "bookings" && (
							<div className="bg-white rounded-2xl overflow-hidden">
								{bookings.length === 0 ? (
									<div className="text-center py-16">
										<h3 className="text-lg font-medium text-gray-600">
											Нет заявок
										</h3>
									</div>
								) : (
									<table className="w-full">
										<thead className="bg-gray-50">
											<tr>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Пользователь
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Экскурсия
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Дата
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Участники
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Статус
												</th>
												<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
													Действия
												</th>
											</tr>
										</thead>
										<tbody className="divide-y">
											{bookings.map((booking) => (
												<tr key={booking.id}>
													<td className="px-6 py-4">
														<div>
															<span className="font-medium">
																{booking.user_name}
															</span>
															<span className="text-gray-500 text-sm block">
																{booking.user_email}
															</span>
														</div>
													</td>
													<td className="px-6 py-4">
														{booking.excursion_title}
													</td>
													<td className="px-6 py-4">
														{formatDate(booking.start_datetime)}
													</td>
													<td className="px-6 py-4">
														{booking.participants_count}
													</td>
													<td className="px-6 py-4">
														<BookingStatusBadge status={booking.status} />
													</td>
													<td className="px-6 py-4 text-right">
														{booking.status === "confirmed" && (
															<button
																onClick={() =>
																	handleCompleteBooking(booking.id)
																}
																className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
															>
																Завершить
															</button>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						)}

						{/* Заказы мерча */}
						{activeTab === "souvenirs" && (
							<div className="bg-white rounded-2xl overflow-hidden">
								{souvenirOrders.length === 0 ? (
									<div className="text-center py-16">
										<h3 className="text-lg font-medium text-gray-600">
											Нет заказов
										</h3>
									</div>
								) : (
									<table className="w-full">
										<thead className="bg-gray-50">
											<tr>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Товар
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Клиент
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Персонализация
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Кол-во
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Статус
												</th>
												<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
													Действия
												</th>
											</tr>
										</thead>
										<tbody className="divide-y">
											{souvenirOrders.map((order) => (
												<tr key={order.id}>
													<td className="px-6 py-4 font-medium">
														{order.souvenir_name}
													</td>
													<td className="px-6 py-4">
														<div>
															<span>{order.user_name}</span>
															<span className="text-gray-500 text-sm block">
																{order.user_email}
															</span>
														</div>
													</td>
													<td className="px-6 py-4 text-sm text-gray-500">
														{order.personalization_text || "-"}
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
													<td className="px-6 py-4 text-right">
														{order.status === "pending" && (
															<div className="flex justify-end gap-2">
																<button
																	onClick={() => handleConfirmOrder(order.id)}
																	className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
																>
																	Подтвердить
																</button>
																<button
																	onClick={() => handleRejectOrder(order.id)}
																	className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
																>
																	Отклонить
																</button>
															</div>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default AccountB2B;
