// Базовый URL API
const API_BASE = "/api";

// Обработка ответов
async function handleResponse(response) {
	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.error || "Произошла ошибка");
	}
	return data;
}

// Получение заголовков
function getHeaders() {
	return {
		"Content-Type": "application/json",
	};
}

// ============ АУТЕНТИФИКАЦИЯ ============

export async function register(userData) {
	const res = await fetch(`${API_BASE}/auth/register`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(userData),
	});
	return handleResponse(res);
}

export async function login(email, password) {
	const res = await fetch(`${API_BASE}/auth/login`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({ email, password }),
	});
	return handleResponse(res);
}

export async function getMe() {
	const res = await fetch(`${API_BASE}/auth/me`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ ПРЕДПРИЯТИЯ ============

export async function getMainStats() {
	const res = await fetch(`${API_BASE}/enterprises/stats/main`);
	return handleResponse(res);
}

export async function getEnterprises(params = {}) {
	const query = new URLSearchParams(params).toString();
	const res = await fetch(`${API_BASE}/enterprises${query ? `?${query}` : ""}`);
	return handleResponse(res);
}

export async function getEnterprise(id) {
	const res = await fetch(`${API_BASE}/enterprises/${id}`);
	return handleResponse(res);
}

export async function getAllEnterprises() {
	const res = await fetch(`${API_BASE}/enterprises/admin/all`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function createEnterprise(data) {
	const res = await fetch(`${API_BASE}/enterprises`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function updateEnterprise(id, data) {
	const res = await fetch(`${API_BASE}/enterprises/${id}`, {
		method: "PUT",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function getAvailableEmployees(enterpriseId) {
	const res = await fetch(
		`${API_BASE}/enterprises/${enterpriseId}/available-employees`,
		{
			headers: {
				...getHeaders(),
				Authorization: `Bearer ${window.__authToken}`,
			},
		},
	);
	return handleResponse(res);
}

export async function getEnterpriseEmployees(enterpriseId) {
	const res = await fetch(
		`${API_BASE}/enterprises/${enterpriseId}/employees`,
		{
			headers: {
				...getHeaders(),
				Authorization: `Bearer ${window.__authToken}`,
			},
		},
	);
	return handleResponse(res);
}

export async function assignEmployeeToEnterprise(enterpriseId, userId) {
	const res = await fetch(
		`${API_BASE}/enterprises/${enterpriseId}/assign-employee`,
		{
			method: "PATCH",
			headers: {
				...getHeaders(),
				Authorization: `Bearer ${window.__authToken}`,
			},
			body: JSON.stringify({ user_id: userId }),
		},
	);
	return handleResponse(res);
}

export async function activateEnterprise(id) {
	const res = await fetch(`${API_BASE}/enterprises/${id}/activate`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ ЭКСКУРСИИ ============

export async function getExcursionDates() {
	const res = await fetch(`${API_BASE}/excursions/dates`);
	return handleResponse(res);
}

export async function getExcursions(params = {}) {
	const query = new URLSearchParams(params).toString();
	const res = await fetch(`${API_BASE}/excursions${query ? `?${query}` : ""}`);
	return handleResponse(res);
}

export async function getExcursion(id) {
	const res = await fetch(`${API_BASE}/excursions/${id}`);
	return handleResponse(res);
}

export async function getManageExcursions(enterpriseId) {
	const res = await fetch(`${API_BASE}/excursions/manage/${enterpriseId}`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function createExcursion(data) {
	const res = await fetch(`${API_BASE}/excursions`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function updateExcursion(id, data) {
	const res = await fetch(`${API_BASE}/excursions/${id}`, {
		method: "PUT",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function toggleExcursion(id) {
	const res = await fetch(`${API_BASE}/excursions/${id}/toggle`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ СЛОТЫ ============

export async function getSlots(excursionId) {
	const res = await fetch(`${API_BASE}/slots/${excursionId}`);
	return handleResponse(res);
}

export async function createSlot(slotData) {
	const res = await fetch(`${API_BASE}/slots`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(slotData),
	});
	return handleResponse(res);
}

export async function updateSlot(id, data) {
	const res = await fetch(`${API_BASE}/slots/${id}`, {
		method: "PUT",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function cancelSlot(id) {
	const res = await fetch(`${API_BASE}/slots/${id}`, {
		method: "DELETE",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ БРОНИРОВАНИЯ ============

export async function createBooking(bookingData) {
	const res = await fetch(`${API_BASE}/bookings`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(bookingData),
	});
	return handleResponse(res);
}

export async function getMyBookings() {
	const res = await fetch(`${API_BASE}/bookings/my`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function getBooking(id) {
	const res = await fetch(`${API_BASE}/bookings/${id}`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function cancelBooking(id) {
	const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function completeBooking(id) {
	const res = await fetch(`${API_BASE}/bookings/${id}/complete`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function getEnterpriseBookings() {
	const res = await fetch(`${API_BASE}/bookings/enterprise/list`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ СУВЕНИРЫ ============

export async function getSouvenirs(enterpriseId) {
	const res = await fetch(`${API_BASE}/souvenirs/${enterpriseId}`);
	return handleResponse(res);
}

export async function getManageSouvenirs(enterpriseId) {
	const res = await fetch(`${API_BASE}/souvenirs/manage/${enterpriseId}`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function createSouvenir(souvenirData) {
	const res = await fetch(`${API_BASE}/souvenirs`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(souvenirData),
	});
	return handleResponse(res);
}

export async function updateSouvenir(id, data) {
	const res = await fetch(`${API_BASE}/souvenirs/${id}`, {
		method: "PUT",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function toggleSouvenir(id) {
	const res = await fetch(`${API_BASE}/souvenirs/${id}/toggle`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ ЗАКАЗЫ СУВЕНИРОВ ============

export async function createSouvenirOrders(ordersData) {
	const res = await fetch(`${API_BASE}/souvenir-orders`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(ordersData),
	});
	return handleResponse(res);
}

export async function getSouvenirOrders(bookingId) {
	const res = await fetch(`${API_BASE}/souvenir-orders/${bookingId}`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function getEnterpriseSouvenirOrders() {
	const res = await fetch(`${API_BASE}/souvenir-orders/enterprise/list`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function confirmSouvenirOrder(id) {
	const res = await fetch(`${API_BASE}/souvenir-orders/${id}/confirm`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function rejectSouvenirOrder(id) {
	const res = await fetch(`${API_BASE}/souvenir-orders/${id}/reject`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ ОТЗЫВЫ ============

export async function createReview(reviewData) {
	const res = await fetch(`${API_BASE}/reviews`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(reviewData),
	});
	return handleResponse(res);
}

export async function getEnterpriseReviews(enterpriseId) {
	const res = await fetch(`${API_BASE}/reviews/${enterpriseId}`);
	return handleResponse(res);
}

export async function getPendingReviews() {
	const res = await fetch(`${API_BASE}/reviews`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function moderateReview(id, data) {
	const res = await fetch(`${API_BASE}/reviews/${id}/moderate`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function getMyReviews() {
	const res = await fetch(`${API_BASE}/reviews/my`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function updateReview(id, data) {
	const res = await fetch(`${API_BASE}/reviews/${id}`, {
		method: "PUT",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function deleteReview(id) {
	const res = await fetch(`${API_BASE}/reviews/${id}`, {
		method: "DELETE",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ ПРОФИЛЬ ============

export async function updateProfile(data) {
	const res = await fetch(`${API_BASE}/auth/profile`, {
		method: "PUT",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(data),
	});
	return handleResponse(res);
}

export async function deleteProfile() {
	const res = await fetch(`${API_BASE}/auth/profile`, {
		method: "DELETE",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ============

export async function getUsers() {
	const res = await fetch(`${API_BASE}/auth/users`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function blockUser(id) {
	const res = await fetch(`${API_BASE}/auth/users/${id}/block`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function changeUserRole(id, role) {
	const res = await fetch(`${API_BASE}/auth/users/${id}/role`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify({ role }),
	});
	return handleResponse(res);
}

// ============ ОПЛАТА ============

export async function processPayment(paymentData) {
	const res = await fetch(`${API_BASE}/payment/process`, {
		method: "POST",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
		body: JSON.stringify(paymentData),
	});
	return handleResponse(res);
}

// ============ УВЕДОМЛЕНИЯ ============

export async function getNotifications() {
	const res = await fetch(`${API_BASE}/notifications/my`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function getUnreadCount() {
	const res = await fetch(`${API_BASE}/notifications/unread/count`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

export async function markNotificationRead(id) {
	const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
		method: "PATCH",
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}

// ============ АНАЛИТИКА ============

export async function getAnalytics(params = {}) {
	const query = new URLSearchParams(params).toString();
	const res = await fetch(
		`${API_BASE}/analytics/summary${query ? `?${query}` : ""}`,
		{
			headers: {
				...getHeaders(),
				Authorization: `Bearer ${window.__authToken}`,
			},
		},
	);
	return handleResponse(res);
}

export async function getCities() {
	const res = await fetch(`${API_BASE}/analytics/cities`, {
		headers: { ...getHeaders(), Authorization: `Bearer ${window.__authToken}` },
	});
	return handleResponse(res);
}
