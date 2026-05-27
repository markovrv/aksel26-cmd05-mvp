import React, { useState, useEffect } from "react";
import {
	getEnterprise,
	getEnterpriseBookings,
	completeBooking,
	getEnterpriseSouvenirOrders,
	confirmSouvenirOrder,
	rejectSouvenirOrder,
	updateEnterprise,
	getManageExcursions,
	createExcursion,
	updateExcursion,
	toggleExcursion,
	getSlots,
	createSlot,
	updateSlot,
	cancelSlot,
	getManageSouvenirs,
	createSouvenir,
	updateSouvenir,
	toggleSouvenir,
} from "../api";
import BookingStatusBadge from "../components/BookingStatusBadge";
import { useAuth } from "../context/AuthContext";

function Modal({ title, children, onClose }) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
					>
						&times;
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}

function AccountB2B({ showToast }) {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("dashboard");
	const [loading, setLoading] = useState(true);

	// Enterprise
	const [enterprise, setEnterprise] = useState(null);
	const [enterpriseForm, setEnterpriseForm] = useState({
		name: "",
		description: "",
		city: "",
		address: "",
		contacts: "",
	});
	const [editEnterpriseMode, setEditEnterpriseMode] = useState(false);

	// Excursions
	const [excursions, setExcursions] = useState([]);
	const [showExcursionModal, setShowExcursionModal] = useState(false);
	const [editExcursion, setEditExcursion] = useState(null);
	const [excursionForm, setExcursionForm] = useState({
		enterprise_id: "",
		title: "",
		description: "",
		duration_minutes: 60,
		default_price: "",
		max_participants: "",
		min_participants: 1,
		photo_url: "",
	});

	// Slots
	const [slots, setSlots] = useState([]);
	const [selectedExcId, setSelectedExcId] = useState("");
	const [showSlotModal, setShowSlotModal] = useState(false);
	const [editSlot, setEditSlot] = useState(null);
	const [slotForm, setSlotForm] = useState({
		excursion_id: "",
		start_datetime: "",
		end_datetime: "",
		available_slots: "",
		price_per_person: "",
	});

	// Souvenirs
	const [souvenirs, setSouvenirs] = useState([]);
	const [showSouvenirModal, setShowSouvenirModal] = useState(false);
	const [editSouvenir, setEditSouvenir] = useState(null);
	const [souvenirForm, setSouvenirForm] = useState({
		enterprise_id: "",
		name: "",
		description: "",
		base_price: "",
		stock_quantity: "",
		photo_url: "",
		allows_personalization: false,
	});

	// Bookings
	const [bookings, setBookings] = useState([]);
	const [souvenirOrders, setSouvenirOrders] = useState([]);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			if (user?.enterprise_id) {
				const [entData, bookingsData, ordersData] = await Promise.all([
					getEnterprise(user.enterprise_id),
					getEnterpriseBookings(),
					getEnterpriseSouvenirOrders(),
				]);
				setEnterprise(entData);
				setEnterpriseForm({
					name: entData.name,
					description: entData.description,
					city: entData.city,
					address: entData.address,
					contacts: entData.contacts,
				});
				setBookings(bookingsData);
				setSouvenirOrders(ordersData);
			}
		} catch (err) {
			console.error("Ошибка загрузки:", err);
		} finally {
			setLoading(false);
		}
	};

	// ====== Enterprise ======
	const loadEnterprise = async () => {
		if (!user?.enterprise_id) return;
		try {
			const entData = await getEnterprise(user.enterprise_id);
			setEnterprise(entData);
			setEnterpriseForm({
				name: entData.name,
				description: entData.description,
				city: entData.city,
				address: entData.address,
				contacts: entData.contacts,
			});
		} catch (err) {
			console.error(err);
		}
	};

	const handleUpdateEnterprise = async () => {
		try {
			await updateEnterprise(user.enterprise_id, enterpriseForm);
			showToast("Предприятие обновлено", "success");
			setEditEnterpriseMode(false);
			const entData = await getEnterprise(user.enterprise_id);
			setEnterprise(entData);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	// ====== Excursions ======
	const loadExcursions = async () => {
		if (!user?.enterprise_id) return;
		try {
			const data = await getManageExcursions(user.enterprise_id);
			setExcursions(data);
		} catch (err) {
			console.error(err);
		}
	};

	const handleCreateExcursion = async () => {
		try {
			await createExcursion(excursionForm);
			showToast("Экскурсия создана", "success");
			setShowExcursionModal(false);
			resetExcursionForm();
			loadExcursions();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleUpdateExcursion = async () => {
		try {
			await updateExcursion(editExcursion.id, excursionForm);
			showToast("Экскурсия обновлена", "success");
			setShowExcursionModal(false);
			setEditExcursion(null);
			resetExcursionForm();
			loadExcursions();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleToggleExcursion = async (id) => {
		try {
			await toggleExcursion(id);
			showToast("Статус экскурсии изменён", "success");
			loadExcursions();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const openCreateExcursion = () => {
		setEditExcursion(null);
		setExcursionForm({
			...excursionForm,
			enterprise_id: user.enterprise_id,
		});
		setShowExcursionModal(true);
	};

	const openEditExcursion = (exc) => {
		setEditExcursion(exc);
		setExcursionForm({
			enterprise_id: exc.enterprise_id,
			title: exc.title,
			description: exc.description,
			duration_minutes: exc.duration_minutes,
			default_price: exc.default_price,
			max_participants: exc.max_participants,
			min_participants: exc.min_participants,
			photo_url: exc.photo_url || "",
		});
		setShowExcursionModal(true);
	};

	const resetExcursionForm = () => {
		setExcursionForm({
			enterprise_id: user.enterprise_id || "",
			title: "",
			description: "",
			duration_minutes: 60,
			default_price: "",
			max_participants: "",
			min_participants: 1,
			photo_url: "",
		});
	};

	// ====== Slots ======
	const loadSlots = async (excursionId) => {
		if (!excursionId) {
			setSlots([]);
			return;
		}
		try {
			const data = await getSlots(excursionId);
			setSlots(data);
		} catch (err) {
			console.error(err);
		}
	};

	const handleCreateSlot = async () => {
		try {
			await createSlot(slotForm);
			showToast("Слот создан", "success");
			setShowSlotModal(false);
			resetSlotForm();
			loadSlots(selectedExcId);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleUpdateSlot = async () => {
		try {
			await updateSlot(editSlot.id, slotForm);
			showToast("Слот обновлён", "success");
			setShowSlotModal(false);
			setEditSlot(null);
			resetSlotForm();
			loadSlots(selectedExcId);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleCancelSlot = async (id) => {
		if (!confirm("Вы уверены, что хотите отменить этот слот?")) return;
		try {
			await cancelSlot(id);
			showToast("Слот отменён", "success");
			loadSlots(selectedExcId);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const openCreateSlot = (excId) => {
		setEditSlot(null);
		setSlotForm({ ...slotForm, excursion_id: excId });
		setShowSlotModal(true);
	};

	const openEditSlot = (slot) => {
		setEditSlot(slot);
		setSlotForm({
			excursion_id: slot.excursion_id,
			start_datetime: slot.start_datetime.slice(0, 16),
			end_datetime: slot.end_datetime.slice(0, 16),
			available_slots: slot.available_slots,
			price_per_person: slot.price_per_person,
		});
		setShowSlotModal(true);
	};

	const resetSlotForm = () => {
		setSlotForm({
			excursion_id: selectedExcId || "",
			start_datetime: "",
			end_datetime: "",
			available_slots: "",
			price_per_person: "",
		});
	};

	// ====== Souvenirs ======
	const loadSouvenirs = async () => {
		if (!user?.enterprise_id) return;
		try {
			const data = await getManageSouvenirs(user.enterprise_id);
			setSouvenirs(data);
		} catch (err) {
			console.error(err);
		}
	};

	const handleCreateSouvenir = async () => {
		try {
			await createSouvenir(souvenirForm);
			showToast("Сувенир добавлен", "success");
			setShowSouvenirModal(false);
			resetSouvenirForm();
			loadSouvenirs();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleUpdateSouvenir = async () => {
		try {
			await updateSouvenir(editSouvenir.id, souvenirForm);
			showToast("Сувенир обновлён", "success");
			setShowSouvenirModal(false);
			setEditSouvenir(null);
			resetSouvenirForm();
			loadSouvenirs();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleToggleSouvenir = async (id) => {
		try {
			await toggleSouvenir(id);
			showToast("Статус сувенира изменён", "success");
			loadSouvenirs();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const openCreateSouvenir = () => {
		setEditSouvenir(null);
		setSouvenirForm({ ...souvenirForm, enterprise_id: user.enterprise_id });
		setShowSouvenirModal(true);
	};

	const openEditSouvenir = (s) => {
		setEditSouvenir(s);
		setSouvenirForm({
			enterprise_id: s.enterprise_id,
			name: s.name,
			description: s.description || "",
			base_price: s.base_price,
			stock_quantity: s.stock_quantity,
			photo_url: s.photo_url || "",
			allows_personalization: !!s.allows_personalization,
		});
		setShowSouvenirModal(true);
	};

	const resetSouvenirForm = () => {
		setSouvenirForm({
			enterprise_id: user.enterprise_id || "",
			name: "",
			description: "",
			base_price: "",
			stock_quantity: "",
			photo_url: "",
			allows_personalization: false,
		});
	};

	// ====== Bookings ======
	const handleCompleteBooking = async (bookingId) => {
		try {
			await completeBooking(bookingId);
			showToast("Экскурсия отмечена как проведённая", "success");
			const [bookingsData, ordersData] = await Promise.all([
				getEnterpriseBookings(),
				getEnterpriseSouvenirOrders(),
			]);
			setBookings(bookingsData);
			setSouvenirOrders(ordersData);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleConfirmOrder = async (orderId) => {
		try {
			await confirmSouvenirOrder(orderId);
			showToast("Заказ подтверждён", "success");
			setSouvenirOrders((prev) =>
				prev.map((o) =>
					o.id === orderId ? { ...o, status: "confirmed" } : o,
				),
			);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleRejectOrder = async (orderId) => {
		try {
			await rejectSouvenirOrder(orderId);
			showToast("Заказ отклонён", "success");
			setSouvenirOrders((prev) =>
				prev.map((o) =>
					o.id === orderId ? { ...o, status: "rejected" } : o,
				),
			);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const tabs = [
		{ id: "dashboard", label: "Сводка" },
		{ id: "enterprise", label: "Моё предприятие" },
		{ id: "excursions", label: "Экскурсии" },
		{ id: "slots", label: "Слоты" },
		{ id: "souvenirs", label: "Сувениры" },
		{ id: "bookings", label: "Заявки" },
		{ id: "orders", label: "Заказы мерча" },
	];

	const todayBookings = bookings.filter((b) => {
		const today = new Date().toDateString();
		return new Date(b.start_datetime).toDateString() === today;
	});

	const pendingOrders = souvenirOrders.filter((o) => o.status === "pending");

	const formatDate = (dateStr) =>
		new Date(dateStr).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			hour: "2-digit",
			minute: "2-digit",
		});

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Кабинет предприятия{enterprise ? ` — ${enterprise.name}` : ""}
				</h1>

				<div className="flex gap-2 mb-8 overflow-x-auto pb-2">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTab(tab.id);
								if (tab.id === "excursions" && excursions.length === 0)
									loadExcursions();
								if (tab.id === "souvenirs" && souvenirs.length === 0)
									loadSouvenirs();
								if (tab.id === "enterprise" && !enterprise)
									loadEnterprise();
							}}
							className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
								activeTab === tab.id
									? "bg-primary text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							{tab.label}
							{tab.id === "orders" && pendingOrders.length > 0 && (
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
						{/* ====== СВОДКА ====== */}
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

						{/* ====== МОЁ ПРЕДПРИЯТИЕ ====== */}
						{activeTab === "enterprise" && enterprise && (
							<div className="bg-white rounded-2xl p-6 border border-gray-100">
								<div className="flex justify-between items-center mb-6">
									<h3 className="text-xl font-semibold">
										Информация о предприятии
									</h3>
									{!editEnterpriseMode && (
										<button
											onClick={() => {
												setEnterpriseForm({
													name: enterprise.name,
													description: enterprise.description,
													city: enterprise.city,
													address: enterprise.address,
													contacts: enterprise.contacts,
												});
												setEditEnterpriseMode(true);
											}}
											className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
										>
											Редактировать
										</button>
									)}
								</div>

								{editEnterpriseMode ? (
									<div className="space-y-4 max-w-2xl">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Название
											</label>
											<input
												value={enterpriseForm.name}
												onChange={(e) =>
													setEnterpriseForm({
														...enterpriseForm,
														name: e.target.value,
													})
												}
												className="w-full px-4 py-2 border rounded-xl"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Описание
											</label>
											<textarea
												value={enterpriseForm.description}
												onChange={(e) =>
													setEnterpriseForm({
														...enterpriseForm,
														description: e.target.value,
													})
												}
												className="w-full px-4 py-2 border rounded-xl min-h-[100px]"
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Город
												</label>
												<input
													value={enterpriseForm.city}
													onChange={(e) =>
														setEnterpriseForm({
															...enterpriseForm,
															city: e.target.value,
														})
													}
													className="w-full px-4 py-2 border rounded-xl"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Адрес
												</label>
												<input
													value={enterpriseForm.address}
													onChange={(e) =>
														setEnterpriseForm({
															...enterpriseForm,
															address: e.target.value,
														})
													}
													className="w-full px-4 py-2 border rounded-xl"
												/>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Контакты
											</label>
											<input
												value={enterpriseForm.contacts}
												onChange={(e) =>
													setEnterpriseForm({
														...enterpriseForm,
														contacts: e.target.value,
													})
												}
												className="w-full px-4 py-2 border rounded-xl"
											/>
										</div>
										<div className="flex gap-3 pt-2">
											<button
												onClick={handleUpdateEnterprise}
												className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
											>
												Сохранить
											</button>
											<button
												onClick={() => setEditEnterpriseMode(false)}
												className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
											>
												Отмена
											</button>
										</div>
									</div>
								) : (
									<div className="space-y-4 max-w-2xl">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<span className="text-sm text-gray-500">Город</span>
												<p className="font-medium">{enterprise.city}</p>
											</div>
											<div>
												<span className="text-sm text-gray-500">Адрес</span>
												<p className="font-medium">{enterprise.address}</p>
											</div>
											<div>
												<span className="text-sm text-gray-500">Контакты</span>
												<p className="font-medium">{enterprise.contacts}</p>
											</div>
											<div>
												<span className="text-sm text-gray-500">Рейтинг</span>
												<p className="font-medium">
													<span className="text-yellow-500">★</span>{" "}
													{enterprise.average_rating?.toFixed(1) || "0.0"}
												</p>
											</div>
										</div>
										<div>
											<span className="text-sm text-gray-500">Описание</span>
											<p className="text-gray-700 mt-1">
												{enterprise.description}
											</p>
										</div>
									</div>
								)}
							</div>
						)}

						{/* ====== ЭКСКУРСИИ ====== */}
						{activeTab === "excursions" && (
							<div>
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold">Мои экскурсии</h2>
									<button
										onClick={() => {
											loadExcursions();
											openCreateExcursion();
										}}
										className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
									>
										+ Создать
									</button>
								</div>
								<div className="bg-white rounded-2xl overflow-hidden">
									{excursions.length === 0 ? (
										<div className="text-center py-16">
											<h3 className="text-lg font-medium text-gray-600">
												Нет экскурсий
											</h3>
											<button
												onClick={() => {
													loadExcursions();
													openCreateExcursion();
												}}
												className="mt-4 px-4 py-2 bg-primary text-white rounded-xl"
											>
												Создать первую экскурсию
											</button>
										</div>
									) : (
										<table className="w-full">
											<thead className="bg-gray-50">
												<tr>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Название
													</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Длит.
													</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Цена
													</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Макс.
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
												{excursions.map((exc) => (
													<tr key={exc.id}>
														<td className="px-6 py-4 font-medium">
															{exc.title}
														</td>
														<td className="px-6 py-4 text-gray-500">
															{exc.duration_minutes} мин
														</td>
														<td className="px-6 py-4">
															{exc.default_price.toLocaleString()} ₽
														</td>
														<td className="px-6 py-4">
															{exc.max_participants} чел
														</td>
														<td className="px-6 py-4">
															<span
																className={`px-3 py-1 rounded-full text-xs font-medium ${
																	exc.is_active
																		? "bg-green-100 text-green-800"
																		: "bg-red-100 text-red-800"
																}`}
															>
																{exc.is_active ? "Активна" : "Скрыта"}
															</span>
														</td>
														<td className="px-6 py-4 text-right">
															<div className="flex justify-end gap-2">
																<button
																	onClick={() => openEditExcursion(exc)}
																	className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
																>
																	Редактировать
																</button>
																<button
																	onClick={() => handleToggleExcursion(exc.id)}
																	className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
																>
																	{exc.is_active ? "Скрыть" : "Показать"}
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</div>
						)}

						{/* ====== СЛОТЫ ====== */}
						{activeTab === "slots" && (
							<div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Экскурсия
									</label>
									<div className="flex gap-3">
										<select
											value={selectedExcId}
											onChange={(e) => {
												setSelectedExcId(e.target.value);
												loadSlots(e.target.value);
											}}
											className="flex-1 max-w-md px-4 py-2 border rounded-xl"
										>
											<option value="">Выберите экскурсию</option>
											{excursions.map((exc) => (
												<option key={exc.id} value={exc.id}>
													{exc.title}
												</option>
											))}
										</select>
										{selectedExcId && (
											<button
												onClick={() => openCreateSlot(selectedExcId)}
												className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
											>
												+ Создать слот
											</button>
										)}
									</div>
									{excursions.length === 0 && (
										<p className="text-sm text-gray-500 mt-2">
											Сначала создайте экскурсию
										</p>
									)}
								</div>

								{selectedExcId && (
									<div className="bg-white rounded-2xl overflow-hidden">
										{slots.length === 0 ? (
											<div className="text-center py-16">
												<h3 className="text-lg font-medium text-gray-600">
													Нет слотов
												</h3>
											</div>
										) : (
											<table className="w-full">
												<thead className="bg-gray-50">
													<tr>
														<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
															Начало
														</th>
														<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
															Конец
														</th>
														<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
															Цена
														</th>
														<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
															Мест
														</th>
														<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
															Действия
														</th>
													</tr>
												</thead>
												<tbody className="divide-y">
													{slots.map((slot) => (
														<tr key={slot.id}>
															<td className="px-6 py-4">
																{formatDate(slot.start_datetime)}
															</td>
															<td className="px-6 py-4 text-gray-500">
																{new Date(
																	slot.end_datetime,
																).toLocaleTimeString("ru-RU", {
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</td>
															<td className="px-6 py-4">
																{slot.price_per_person.toLocaleString()} ₽
															</td>
															<td className="px-6 py-4">
																{slot.available_slots}
															</td>
															<td className="px-6 py-4 text-right">
																<div className="flex justify-end gap-2">
																	<button
																		onClick={() => openEditSlot(slot)}
																		className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
																	>
																		Редактировать
																	</button>
																	<button
																		onClick={() => handleCancelSlot(slot.id)}
																		className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
																	>
																		Отменить
																	</button>
																</div>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
									</div>
								)}
							</div>
						)}

						{/* ====== СУВЕНИРЫ ====== */}
						{activeTab === "souvenirs" && (
							<div>
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold">Мои сувениры</h2>
									<button
										onClick={() => {
											loadSouvenirs();
											openCreateSouvenir();
										}}
										className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
									>
										+ Добавить
									</button>
								</div>
								<div className="bg-white rounded-2xl overflow-hidden">
									{souvenirs.length === 0 ? (
										<div className="text-center py-16">
											<h3 className="text-lg font-medium text-gray-600">
												Нет сувениров
											</h3>
											<button
												onClick={() => {
													loadSouvenirs();
													openCreateSouvenir();
												}}
												className="mt-4 px-4 py-2 bg-primary text-white rounded-xl"
											>
												Добавить первый сувенир
											</button>
										</div>
									) : (
										<table className="w-full">
											<thead className="bg-gray-50">
												<tr>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Название
													</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Цена
													</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
														Остаток
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
												{souvenirs.map((s) => (
													<tr key={s.id}>
														<td className="px-6 py-4 font-medium">{s.name}</td>
														<td className="px-6 py-4">
															{s.base_price.toLocaleString()} ₽
														</td>
														<td className="px-6 py-4">{s.stock_quantity}</td>
														<td className="px-6 py-4">
															<span
																className={`px-3 py-1 rounded-full text-xs font-medium ${
																	s.is_available
																		? "bg-green-100 text-green-800"
																		: "bg-red-100 text-red-800"
																}`}
															>
																{s.is_available ? "Доступен" : "Скрыт"}
															</span>
														</td>
														<td className="px-6 py-4 text-right">
															<div className="flex justify-end gap-2">
																<button
																	onClick={() => openEditSouvenir(s)}
																	className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
																>
																	Редактировать
																</button>
																<button
																	onClick={() => handleToggleSouvenir(s.id)}
																	className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
																>
																	{s.is_available ? "Скрыть" : "Показать"}
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</div>
						)}

						{/* ====== ЗАЯВКИ ====== */}
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

						{/* ====== ЗАКАЗЫ МЕРЧА ====== */}
						{activeTab === "orders" && (
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
                              ${order.status === "rejected" ? "bg-red-100 text-red-800" : ""}
                            `}
														>
															{order.status === "pending" && "Ожидает"}
															{order.status === "confirmed" && "Подтверждён"}
															{order.status === "ready_for_pickup" &&
																"Готов к выдаче"}
															{order.status === "fulfilled" && "Выполнен"}
															{order.status === "rejected" && "Отклонён"}
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

				{/* Модалка экскурсии */}
				{showExcursionModal && (
					<Modal
						title={
							editExcursion
								? "Редактировать экскурсию"
								: "Создать экскурсию"
						}
						onClose={() => {
							setShowExcursionModal(false);
							setEditExcursion(null);
							resetExcursionForm();
						}}
					>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Название
								</label>
								<input
									value={excursionForm.title}
									onChange={(e) =>
										setExcursionForm({
											...excursionForm,
											title: e.target.value,
										})
									}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="Название экскурсии"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Описание
								</label>
								<textarea
									value={excursionForm.description}
									onChange={(e) =>
										setExcursionForm({
											...excursionForm,
											description: e.target.value,
										})
									}
									className="w-full px-4 py-2 border rounded-xl min-h-[80px]"
									placeholder="Описание экскурсии"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Длительность (мин)
									</label>
									<input
										type="number"
										value={excursionForm.duration_minutes}
										onChange={(e) =>
											setExcursionForm({
												...excursionForm,
												duration_minutes: +e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Цена (₽)
									</label>
									<input
										type="number"
										value={excursionForm.default_price}
										onChange={(e) =>
											setExcursionForm({
												...excursionForm,
												default_price: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Макс. участников
									</label>
									<input
										type="number"
										value={excursionForm.max_participants}
										onChange={(e) =>
											setExcursionForm({
												...excursionForm,
												max_participants: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Мин. участников
									</label>
									<input
										type="number"
										value={excursionForm.min_participants}
										onChange={(e) =>
											setExcursionForm({
												...excursionForm,
												min_participants: +e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									URL фото
								</label>
								<input
									value={excursionForm.photo_url}
									onChange={(e) =>
										setExcursionForm({
											...excursionForm,
											photo_url: e.target.value,
										})
									}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="https://images.unsplash.com/..."
								/>
							</div>
							<div className="flex gap-3 pt-2">
								<button
									onClick={
										editExcursion
											? handleUpdateExcursion
											: handleCreateExcursion
									}
									className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
								>
									{editExcursion ? "Сохранить" : "Создать"}
								</button>
								<button
									onClick={() => {
										setShowExcursionModal(false);
										setEditExcursion(null);
										resetExcursionForm();
									}}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
								>
									Отмена
								</button>
							</div>
						</div>
					</Modal>
				)}

				{/* Модалка слота */}
				{showSlotModal && (
					<Modal
						title={
							editSlot ? "Редактировать слот" : "Создать слот"
						}
						onClose={() => {
							setShowSlotModal(false);
							setEditSlot(null);
							resetSlotForm();
						}}
					>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Начало
									</label>
									<input
										type="datetime-local"
										value={slotForm.start_datetime}
										onChange={(e) =>
											setSlotForm({
												...slotForm,
												start_datetime: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Конец
									</label>
									<input
										type="datetime-local"
										value={slotForm.end_datetime}
										onChange={(e) =>
											setSlotForm({
												...slotForm,
												end_datetime: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Цена за человека (₽)
									</label>
									<input
										type="number"
										value={slotForm.price_per_person}
										onChange={(e) =>
											setSlotForm({
												...slotForm,
												price_per_person: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Доступно мест
									</label>
									<input
										type="number"
										value={slotForm.available_slots}
										onChange={(e) =>
											setSlotForm({
												...slotForm,
												available_slots: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									URL фото
								</label>
								<input
									value={excursionForm.photo_url}
									onChange={(e) =>
										setExcursionForm({
											...excursionForm,
											photo_url: e.target.value,
										})
									}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="https://images.unsplash.com/..."
								/>
							</div>
							<div className="flex gap-3 pt-2">
								<button
									onClick={
										editSlot ? handleUpdateSlot : handleCreateSlot
									}
									className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
								>
									{editSlot ? "Сохранить" : "Создать"}
								</button>
								<button
									onClick={() => {
										setShowSlotModal(false);
										setEditSlot(null);
										resetSlotForm();
									}}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
								>
									Отмена
								</button>
							</div>
						</div>
					</Modal>
				)}

				{/* Модалка сувенира */}
				{showSouvenirModal && (
					<Modal
						title={
							editSouvenir
								? "Редактировать сувенир"
								: "Добавить сувенир"
						}
						onClose={() => {
							setShowSouvenirModal(false);
							setEditSouvenir(null);
							resetSouvenirForm();
						}}
					>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Название
								</label>
								<input
									value={souvenirForm.name}
									onChange={(e) =>
										setSouvenirForm({
											...souvenirForm,
											name: e.target.value,
										})
									}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="Название сувенира"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Описание
								</label>
								<textarea
									value={souvenirForm.description}
									onChange={(e) =>
										setSouvenirForm({
											...souvenirForm,
											description: e.target.value,
										})
									}
									className="w-full px-4 py-2 border rounded-xl min-h-[60px]"
									placeholder="Описание"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Цена (₽)
									</label>
									<input
										type="number"
										value={souvenirForm.base_price}
										onChange={(e) =>
											setSouvenirForm({
												...souvenirForm,
												base_price: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Количество
									</label>
									<input
										type="number"
										value={souvenirForm.stock_quantity}
										onChange={(e) =>
											setSouvenirForm({
												...souvenirForm,
												stock_quantity: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									URL фото
								</label>
								<input
									value={souvenirForm.photo_url}
									onChange={(e) =>
										setSouvenirForm({
											...souvenirForm,
											photo_url: e.target.value,
										})
									}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="https://..."
								/>
							</div>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={souvenirForm.allows_personalization}
									onChange={(e) =>
										setSouvenirForm({
											...souvenirForm,
											allows_personalization: e.target.checked,
										})
									}
									className="w-4 h-4"
								/>
								<span className="text-sm text-gray-700">
									Возможна персонализация
								</span>
							</label>
							<div className="flex gap-3 pt-2">
								<button
									onClick={
										editSouvenir
											? handleUpdateSouvenir
											: handleCreateSouvenir
									}
									className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
								>
									{editSouvenir ? "Сохранить" : "Добавить"}
								</button>
								<button
									onClick={() => {
										setShowSouvenirModal(false);
										setEditSouvenir(null);
										resetSouvenirForm();
									}}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
								>
									Отмена
								</button>
							</div>
						</div>
					</Modal>
				)}
			</div>
		</div>
	);
}

export default AccountB2B;
