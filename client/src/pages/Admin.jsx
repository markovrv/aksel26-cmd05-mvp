import React, { useState, useEffect } from "react";
import {
	getAllEnterprises,
	createEnterprise,
	updateEnterprise,
	activateEnterprise,
	getPendingReviews,
	moderateReview,
	getManageExcursions,
	createExcursion,
	updateExcursion,
	toggleExcursion,
	getManageSouvenirs,
	createSouvenir,
	updateSouvenir,
	toggleSouvenir,
	getUsers,
	blockUser,
	changeUserRole,
	getAvailableEmployees,
	getEnterpriseEmployees,
	assignEmployeeToEnterprise,
} from "../api";

function Modal({ title, children, onClose }) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold">{title}</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
				</div>
				{children}
			</div>
		</div>
	);
}

function Admin({ showToast }) {
	const [activeTab, setActiveTab] = useState("enterprises");
	const [loading, setLoading] = useState(true);

	// Enterprises
	const [enterprises, setEnterprises] = useState([]);
	const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
	const [editEnterprise, setEditEnterprise] = useState(null);
	const [enterpriseForm, setEnterpriseForm] = useState({
		name: "", description: "", city: "", address: "", contacts: "",
	});

	// Excursions
	const [excursions, setExcursions] = useState([]);
	const [selectedEntId, setSelectedEntId] = useState("");
	const [showExcursionModal, setShowExcursionModal] = useState(false);
	const [editExcursion, setEditExcursion] = useState(null);
	const [excursionForm, setExcursionForm] = useState({
		enterprise_id: "", title: "", description: "", duration_minutes: 60,
		default_price: "", max_participants: "", min_participants: 1,
		photo_url: "",
	});

	// Souvenirs
	const [souvenirs, setSouvenirs] = useState([]);
	const [selectedSouvEntId, setSelectedSouvEntId] = useState("");
	const [showSouvenirModal, setShowSouvenirModal] = useState(false);
	const [editSouvenir, setEditSouvenir] = useState(null);
	const [souvenirForm, setSouvenirForm] = useState({
		enterprise_id: "", name: "", description: "", base_price: "",
		stock_quantity: "", photo_url: "", allows_personalization: false,
	});

	// Reviews
	const [reviews, setReviews] = useState([]);

	// Users
	const [users, setUsers] = useState([]);

	// Enterprise employees
	const [availableEmployees, setAvailableEmployees] = useState([]);
	const [enterpriseEmployees, setEnterpriseEmployees] = useState([]);

	const loadEnterprises = async () => {
		try {
			const data = await getAllEnterprises();
			setEnterprises(data);
		} catch (err) {
			console.error(err);
		}
	};

	const loadReviews = async () => {
		try {
			const data = await getPendingReviews();
			setReviews(data);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		setLoading(true);
		await Promise.all([loadEnterprises(), loadReviews()]);
		setLoading(false);
	};

	// ====== Enterprises ======
	const handleCreateEnterprise = async () => {
		try {
			await createEnterprise(enterpriseForm);
			showToast("Предприятие создано и отправлено на модерацию", "success");
			setShowEnterpriseModal(false);
			resetEnterpriseForm();
			loadEnterprises();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleUpdateEnterprise = async () => {
		try {
			await updateEnterprise(editEnterprise.id, enterpriseForm);
			showToast("Предприятие обновлено", "success");
			setShowEnterpriseModal(false);
			setEditEnterprise(null);
			resetEnterpriseForm();
			loadEnterprises();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleActivateEnterprise = async (id) => {
		try {
			await activateEnterprise(id);
			showToast("Предприятие активировано", "success");
			loadEnterprises();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const openEditEnterprise = async (ent) => {
		setEditEnterprise(ent);
		setEnterpriseForm({
			name: ent.name,
			description: ent.description,
			city: ent.city,
			address: ent.address,
			contacts: ent.contacts,
		});
		try {
			const [available, assigned] = await Promise.all([
				getAvailableEmployees(ent.id),
				getEnterpriseEmployees(ent.id),
			]);
			setAvailableEmployees(available);
			setEnterpriseEmployees(assigned);
		} catch (err) {
			console.error(err);
		}
		setShowEnterpriseModal(true);
	};

	const handleAssignEmployee = async (userId) => {
		try {
			await assignEmployeeToEnterprise(editEnterprise.id, userId);
			showToast("Сотрудник привязан к предприятию", "success");
			const [available, assigned] = await Promise.all([
				getAvailableEmployees(editEnterprise.id),
				getEnterpriseEmployees(editEnterprise.id),
			]);
			setAvailableEmployees(available);
			setEnterpriseEmployees(assigned);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const resetEnterpriseForm = () => {
		setEnterpriseForm({
			name: "", description: "", city: "", address: "", contacts: "",
		});
	};

	// ====== Excursions ======
	const loadExcursions = async (enterpriseId) => {
		if (!enterpriseId) return;
		try {
			const data = await getManageExcursions(enterpriseId);
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
			loadExcursions(excursionForm.enterprise_id);
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
			loadExcursions(selectedEntId);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleToggleExcursion = async (id) => {
		try {
			await toggleExcursion(id);
			showToast("Статус экскурсии изменён", "success");
			loadExcursions(selectedEntId);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const openCreateExcursion = (entId) => {
		setEditExcursion(null);
		setExcursionForm({ ...excursionForm, enterprise_id: entId });
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
			enterprise_id: "", title: "", description: "", duration_minutes: 60,
			default_price: "", max_participants: "", min_participants: 1,
			photo_url: "",
		});
	};

	// ====== Souvenirs ======
	const loadSouvenirs = async (enterpriseId) => {
		if (!enterpriseId) return;
		try {
			const data = await getManageSouvenirs(enterpriseId);
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
			loadSouvenirs(souvenirForm.enterprise_id);
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
			loadSouvenirs(selectedSouvEntId);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleToggleSouvenir = async (id) => {
		try {
			await toggleSouvenir(id);
			showToast("Статус сувенира изменён", "success");
			loadSouvenirs(selectedSouvEntId);
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const openCreateSouvenir = (entId) => {
		setEditSouvenir(null);
		setSouvenirForm({ ...souvenirForm, enterprise_id: entId });
		setShowSouvenirModal(true);
	};

	const openEditSouvenir = (souv) => {
		setEditSouvenir(souv);
		setSouvenirForm({
			enterprise_id: souv.enterprise_id,
			name: souv.name,
			description: souv.description || "",
			base_price: souv.base_price,
			stock_quantity: souv.stock_quantity,
			photo_url: souv.photo_url || "",
			allows_personalization: !!souv.allows_personalization,
		});
		setShowSouvenirModal(true);
	};

	const resetSouvenirForm = () => {
		setSouvenirForm({
			enterprise_id: "", name: "", description: "", base_price: "",
			stock_quantity: "", photo_url: "", allows_personalization: false,
		});
	};

	// ====== Reviews ======
	const handleModerateReview = async (reviewId, approved) => {
		try {
			await moderateReview(reviewId, { approved });
			showToast(approved ? "Отзыв одобрен" : "Отзыв отклонён", "success");
			setReviews((prev) => prev.filter((r) => r.id !== reviewId));
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	// ====== Users ======
	const loadUsers = async () => {
		try {
			const data = await getUsers();
			setUsers(data);
		} catch (err) {
			console.error(err);
		}
	};

	const handleBlockUser = async (id) => {
		try {
			await blockUser(id);
			showToast("Статус пользователя изменён", "success");
			loadUsers();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const handleChangeRole = async (id, role) => {
		try {
			await changeUserRole(id, role);
			showToast("Роль пользователя изменена", "success");
			loadUsers();
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const tabs = [
		{ id: "enterprises", label: "Предприятия" },
		{ id: "excursions", label: "Экскурсии" },
		{ id: "souvenirs", label: "Сувениры" },
		{ id: "reviews", label: "Модерация отзывов", badge: reviews.length },
		{ id: "users", label: "Пользователи" },
	];

	const formatDate = (dateStr) =>
		new Date(dateStr).toLocaleDateString("ru-RU", {
			day: "numeric", month: "long", year: "numeric",
		});

	const roleLabels = {
		b2c: "Турист", b2b_employee: "Сотрудник", admin: "Админ", ministry: "Министерство",
	};

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Администрирование
				</h1>

				<div className="flex gap-2 mb-8 flex-wrap">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTab(tab.id);
								if (tab.id === "users") loadUsers();
							}}
							className={`px-4 py-2 rounded-xl font-medium transition-colors ${
								activeTab === tab.id
									? "bg-primary text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
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

				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-24 skeleton rounded-2xl"></div>
						))}
					</div>
				) : (
					<>
						{/* ========== ПРЕДПРИЯТИЯ ========== */}
						{activeTab === "enterprises" && (
							<div>
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold">Все предприятия</h2>
									<button
										onClick={
											async () => {
												setEditEnterprise(null);
												resetEnterpriseForm();
												try {
													const available = await getAvailableEmployees(0);
													setAvailableEmployees(available);
													setEnterpriseEmployees([]);
												} catch (err) {
													console.error(err);
												}
												setShowEnterpriseModal(true);
											}
										}
										className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
									>
										+ Создать
									</button>
								</div>
								<div className="bg-white rounded-2xl overflow-hidden">
									{enterprises.length === 0 ? (
										<div className="text-center py-16">
											<h3 className="text-lg font-medium text-gray-600">Нет предприятий</h3>
										</div>
									) : (
										<table className="w-full">
											<thead className="bg-gray-50">
												<tr>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Название</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Город</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Рейтинг</th>
													<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Статус</th>
													<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
												</tr>
											</thead>
											<tbody className="divide-y">
												{enterprises.map((ent) => (
													<tr key={ent.id}>
														<td className="px-6 py-4 font-medium">{ent.name}</td>
														<td className="px-6 py-4 text-gray-500">{ent.city}</td>
														<td className="px-6 py-4">
															<span className="text-yellow-500">★</span>{" "}
															{ent.average_rating?.toFixed(1) || "0.0"}
														</td>
														<td className="px-6 py-4">
															<span className={`px-3 py-1 rounded-full text-xs font-medium ${
																ent.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
															}`}>
																{ent.is_active ? "Активен" : "На модерации"}
															</span>
														</td>
														<td className="px-6 py-4 text-right">
															<div className="flex justify-end gap-2">
																<button
																	onClick={() => openEditEnterprise(ent)}
																	className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
																>
																	Редактировать
																</button>
																{!ent.is_active && (
																	<button
																		onClick={() => handleActivateEnterprise(ent.id)}
																		className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
																	>
																		Активировать
																	</button>
																)}
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

						{/* ========== ЭКСКУРСИИ ========== */}
						{activeTab === "excursions" && (
							<div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-1">Предприятие</label>
									<select
										value={selectedEntId}
										onChange={(e) => {
											setSelectedEntId(e.target.value);
											loadExcursions(e.target.value);
										}}
										className="w-full max-w-md px-4 py-2 border rounded-xl"
									>
										<option value="">Выберите предприятие</option>
										{enterprises.map((ent) => (
											<option key={ent.id} value={ent.id}>{ent.name}</option>
										))}
									</select>
								</div>

								{selectedEntId && (
									<>
										<div className="flex justify-between items-center mb-4">
											<h2 className="text-xl font-semibold">Экскурсии</h2>
											<button
												onClick={() => openCreateExcursion(selectedEntId)}
												className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
											>
												+ Создать
											</button>
										</div>
										<div className="bg-white rounded-2xl overflow-hidden">
											{excursions.length === 0 ? (
												<div className="text-center py-16">
													<h3 className="text-lg font-medium text-gray-600">Нет экскурсий</h3>
												</div>
											) : (
												<table className="w-full">
													<thead className="bg-gray-50">
														<tr>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Название</th>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Длит.</th>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Цена</th>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Макс.</th>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Статус</th>
															<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
														</tr>
													</thead>
													<tbody className="divide-y">
														{excursions.map((exc) => (
															<tr key={exc.id}>
																<td className="px-6 py-4 font-medium">{exc.title}</td>
																<td className="px-6 py-4 text-gray-500">{exc.duration_minutes} мин</td>
																<td className="px-6 py-4">{exc.default_price.toLocaleString()} ₽</td>
																<td className="px-6 py-4">{exc.max_participants} чел</td>
																<td className="px-6 py-4">
																	<span className={`px-3 py-1 rounded-full text-xs font-medium ${
																		exc.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
																	}`}>
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
									</>
								)}
							</div>
						)}

						{/* ========== СУВЕНИРЫ ========== */}
						{activeTab === "souvenirs" && (
							<div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-1">Предприятие</label>
									<select
										value={selectedSouvEntId}
										onChange={(e) => {
											setSelectedSouvEntId(e.target.value);
											loadSouvenirs(e.target.value);
										}}
										className="w-full max-w-md px-4 py-2 border rounded-xl"
									>
										<option value="">Выберите предприятие</option>
										{enterprises.map((ent) => (
											<option key={ent.id} value={ent.id}>{ent.name}</option>
										))}
									</select>
								</div>

								{selectedSouvEntId && (
									<>
										<div className="flex justify-between items-center mb-4">
											<h2 className="text-xl font-semibold">Сувениры</h2>
											<button
												onClick={() => openCreateSouvenir(selectedSouvEntId)}
												className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
											>
												+ Добавить
											</button>
										</div>
										<div className="bg-white rounded-2xl overflow-hidden">
											{souvenirs.length === 0 ? (
												<div className="text-center py-16">
													<h3 className="text-lg font-medium text-gray-600">Нет сувениров</h3>
												</div>
											) : (
												<table className="w-full">
													<thead className="bg-gray-50">
														<tr>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Название</th>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Цена</th>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Остаток</th>
															<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Статус</th>
															<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
														</tr>
													</thead>
													<tbody className="divide-y">
														{souvenirs.map((s) => (
															<tr key={s.id}>
																<td className="px-6 py-4 font-medium">{s.name}</td>
																<td className="px-6 py-4">{s.base_price.toLocaleString()} ₽</td>
																<td className="px-6 py-4">{s.stock_quantity}</td>
																<td className="px-6 py-4">
																	<span className={`px-3 py-1 rounded-full text-xs font-medium ${
																		s.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
																	}`}>
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
									</>
								)}
							</div>
						)}

						{/* ========== ОТЗЫВЫ ========== */}
						{activeTab === "reviews" && (
							<div className="space-y-4">
								{reviews.length === 0 ? (
									<div className="text-center py-16 bg-white rounded-2xl">
										<h3 className="text-lg font-medium text-gray-600">Нет отзывов на модерации</h3>
									</div>
								) : (
									reviews.map((review) => (
										<div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100">
											<div className="flex items-start justify-between mb-4">
												<div>
													<span className="font-semibold">{review.user_name}</span>
													<span className="text-gray-500 ml-2 text-sm">{review.user_email}</span>
												</div>
												<div className="flex text-yellow-400">
													{[1, 2, 3, 4, 5].map((star) => (
														<span key={star}>{star <= review.rating ? "★" : "☆"}</span>
													))}
												</div>
											</div>
											<p className="text-gray-600 mb-2">{review.comment}</p>
											<p className="text-gray-400 text-sm mb-4">
												Экскурсия: {review.excursion_title} • {review.enterprise_name}
											</p>
											<div className="flex gap-3">
												<button
													onClick={() => handleModerateReview(review.id, true)}
													className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
												>
													Одобрить
												</button>
												<button
													onClick={() => handleModerateReview(review.id, false)}
													className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
												>
													Отклонить
												</button>
											</div>
										</div>
									))
								)}
							</div>
						)}

						{/* ========== ПОЛЬЗОВАТЕЛИ ========== */}
						{activeTab === "users" && (
							<div className="bg-white rounded-2xl overflow-hidden">
								{users.length === 0 ? (
									<div className="text-center py-16">
										<h3 className="text-lg font-medium text-gray-600">Нет пользователей</h3>
									</div>
								) : (
									<table className="w-full">
										<thead className="bg-gray-50">
											<tr>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Имя</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Роль</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Статус</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Дата</th>
												<th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
											</tr>
										</thead>
										<tbody className="divide-y">
											{users.map((u) => (
												<tr key={u.id}>
													<td className="px-6 py-4 font-medium">{u.full_name}</td>
													<td className="px-6 py-4 text-gray-500">{u.email}</td>
													<td className="px-6 py-4">
														<select
															value={u.role}
															onChange={(e) => handleChangeRole(u.id, e.target.value)}
															className="text-sm border rounded-lg px-2 py-1"
														>
															{Object.entries(roleLabels).map(([val, label]) => (
																<option key={val} value={val}>{label}</option>
															))}
														</select>
													</td>
													<td className="px-6 py-4">
														<span className={`px-3 py-1 rounded-full text-xs font-medium ${
															u.is_blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
														}`}>
															{u.is_blocked ? "Заблокирован" : "Активен"}
														</span>
													</td>
													<td className="px-6 py-4 text-gray-500 text-sm">{formatDate(u.created_at)}</td>
													<td className="px-6 py-4 text-right">
														<button
															onClick={() => handleBlockUser(u.id)}
															className={`text-sm px-3 py-1 rounded-lg ${
																u.is_blocked
																	? "bg-green-100 text-green-800 hover:bg-green-200"
																	: "bg-red-100 text-red-800 hover:bg-red-200"
															}`}
														>
															{u.is_blocked ? "Разблокировать" : "Заблокировать"}
														</button>
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

				{/* Модалка предприятия */}
				{showEnterpriseModal && (
					<Modal
						title={editEnterprise ? "Редактировать предприятие" : "Создать предприятие"}
						onClose={() => { setShowEnterpriseModal(false); setEditEnterprise(null); resetEnterpriseForm(); }}
					>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
								<input
									value={enterpriseForm.name}
									onChange={(e) => setEnterpriseForm({ ...enterpriseForm, name: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="Название предприятия"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
								<textarea
									value={enterpriseForm.description}
									onChange={(e) => setEnterpriseForm({ ...enterpriseForm, description: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl min-h-[100px]"
									placeholder="Описание предприятия"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
									<input
										value={enterpriseForm.city}
										onChange={(e) => setEnterpriseForm({ ...enterpriseForm, city: e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
										placeholder="Город"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
									<input
										value={enterpriseForm.address}
										onChange={(e) => setEnterpriseForm({ ...enterpriseForm, address: e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
										placeholder="Адрес"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Контакты</label>
								<input
									value={enterpriseForm.contacts}
									onChange={(e) => setEnterpriseForm({ ...enterpriseForm, contacts: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="Телефон, email"
								/>
							</div>

								<div className="border-t border-gray-100 my-4 pt-4">
									<h4 className="font-semibold text-sm text-gray-700 mb-3">Сотрудники предприятия</h4>

									{enterpriseEmployees.length > 0 && (
										<div className="mb-3 space-y-1">
											{enterpriseEmployees.map((emp) => (
												<div key={emp.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-lg">
													<div>
														<span className="text-sm font-medium">{emp.full_name}</span>
														<span className="text-xs text-gray-500 ml-2">{emp.email}</span>
													</div>
												</div>
											))}
										</div>
									)}

									{availableEmployees.length > 0 ? (
										<select
											className="w-full px-4 py-2 border rounded-xl text-sm"
											value=""
											onChange={(e) => {
												const userId = parseInt(e.target.value);
												if (userId) handleAssignEmployee(userId);
												e.target.value = "";
											}}
											>
												<option value="">Привязать сотрудника...</option>
											{availableEmployees.map((emp) => (
												<option key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</option>
											))}
										</select>
										) : (
											<p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
												Нет свободных сотрудников для привязки. Сотрудник предприятия должен
												зарегистрироваться с ролью «Сотрудник предприятия».
											</p>
										)}
								</div>

							<div className="flex gap-3 pt-2">
								<button
									onClick={editEnterprise ? handleUpdateEnterprise : handleCreateEnterprise}
									className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
								>
									{editEnterprise ? "Сохранить" : "Создать"}
								</button>
								<button
									onClick={() => { setShowEnterpriseModal(false); setEditEnterprise(null); resetEnterpriseForm(); }}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
								>
									Отмена
								</button>
							</div>
						</div>
					</Modal>
				)}

				{/* Модалка экскурсии */}
				{showExcursionModal && (
					<Modal
						title={editExcursion ? "Редактировать экскурсию" : "Создать экскурсию"}
						onClose={() => { setShowExcursionModal(false); setEditExcursion(null); resetExcursionForm(); }}
					>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
								<input
									value={excursionForm.title}
									onChange={(e) => setExcursionForm({ ...excursionForm, title: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="Название экскурсии"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
								<textarea
									value={excursionForm.description}
									onChange={(e) => setExcursionForm({ ...excursionForm, description: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl min-h-[80px]"
									placeholder="Описание экскурсии"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Длительность (мин)</label>
									<input
										type="number"
										value={excursionForm.duration_minutes}
										onChange={(e) => setExcursionForm({ ...excursionForm, duration_minutes: +e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
									<input
										type="number"
										value={excursionForm.default_price}
										onChange={(e) => setExcursionForm({ ...excursionForm, default_price: e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Макс. участников</label>
									<input
										type="number"
										value={excursionForm.max_participants}
										onChange={(e) => setExcursionForm({ ...excursionForm, max_participants: e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Мин. участников</label>
									<input
										type="number"
										value={excursionForm.min_participants}
										onChange={(e) => setExcursionForm({ ...excursionForm, min_participants: +e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">URL фото</label>
								<input
									value={excursionForm.photo_url}
									onChange={(e) => setExcursionForm({ ...excursionForm, photo_url: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="https://images.unsplash.com/..."
									/>
							</div>
							<div className="flex gap-3 pt-2">
								<button
									onClick={editExcursion ? handleUpdateExcursion : handleCreateExcursion}
									className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
								>
									{editExcursion ? "Сохранить" : "Создать"}
								</button>
								<button
									onClick={() => { setShowExcursionModal(false); setEditExcursion(null); resetExcursionForm(); }}
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
						title={editSouvenir ? "Редактировать сувенир" : "Добавить сувенир"}
						onClose={() => { setShowSouvenirModal(false); setEditSouvenir(null); resetSouvenirForm(); }}
					>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
								<input
									value={souvenirForm.name}
									onChange={(e) => setSouvenirForm({ ...souvenirForm, name: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="Название сувенира"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
								<textarea
									value={souvenirForm.description}
									onChange={(e) => setSouvenirForm({ ...souvenirForm, description: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl min-h-[60px]"
									placeholder="Описание"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
									<input
										type="number"
										value={souvenirForm.base_price}
										onChange={(e) => setSouvenirForm({ ...souvenirForm, base_price: e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
									<input
										type="number"
										value={souvenirForm.stock_quantity}
										onChange={(e) => setSouvenirForm({ ...souvenirForm, stock_quantity: e.target.value })}
										className="w-full px-4 py-2 border rounded-xl"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">URL фото</label>
								<input
									value={souvenirForm.photo_url}
									onChange={(e) => setSouvenirForm({ ...souvenirForm, photo_url: e.target.value })}
									className="w-full px-4 py-2 border rounded-xl"
									placeholder="https://..."
								/>
							</div>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={souvenirForm.allows_personalization}
									onChange={(e) => setSouvenirForm({ ...souvenirForm, allows_personalization: e.target.checked })}
									className="w-4 h-4"
								/>
								<span className="text-sm text-gray-700">Возможна персонализация</span>
							</label>
							<div className="flex gap-3 pt-2">
								<button
									onClick={editSouvenir ? handleUpdateSouvenir : handleCreateSouvenir}
									className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
								>
									{editSouvenir ? "Сохранить" : "Добавить"}
								</button>
								<button
									onClick={() => { setShowSouvenirModal(false); setEditSouvenir(null); resetSouvenirForm(); }}
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

export default Admin;