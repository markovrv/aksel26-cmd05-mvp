import React, { useState, useEffect } from "react";
import { getEnterprises, getPendingReviews, moderateReview } from "../api";

function Admin({ showToast }) {
	const [activeTab, setActiveTab] = useState("enterprises");
	const [enterprises, setEnterprises] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			const [entData, reviewData] = await Promise.all([
				getEnterprises(),
				getPendingReviews(),
			]);
			setEnterprises(entData);
			setReviews(reviewData);
		} catch (err) {
			console.error("Ошибка загрузки:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleModerateReview = async (reviewId, approved) => {
		try {
			await moderateReview(reviewId, { approved });
			showToast(approved ? "Отзыв одобрен" : "Отзыв отклонён", "success");
			setReviews((prev) => prev.filter((r) => r.id !== reviewId));
		} catch (err) {
			showToast(err.message || "Ошибка", "error");
		}
	};

	const tabs = [
		{ id: "enterprises", label: "Предприятия" },
		{ id: "reviews", label: "Модерация отзывов", badge: reviews.length },
	];

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Администрирование
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
						{/* Предприятия */}
						{activeTab === "enterprises" && (
							<div className="bg-white rounded-2xl overflow-hidden">
								{enterprises.length === 0 ? (
									<div className="text-center py-16">
										<h3 className="text-lg font-medium text-gray-600">
											Нет предприятий
										</h3>
									</div>
								) : (
									<table className="w-full">
										<thead className="bg-gray-50">
											<tr>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Название
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Город
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Рейтинг
												</th>
												<th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
													Статус
												</th>
											</tr>
										</thead>
										<tbody className="divide-y">
											{enterprises.map((enterprise) => (
												<tr key={enterprise.id}>
													<td className="px-6 py-4 font-medium">
														{enterprise.name}
													</td>
													<td className="px-6 py-4 text-gray-500">
														{enterprise.city}
													</td>
													<td className="px-6 py-4">
														<span className="text-yellow-500">★</span>{" "}
														{enterprise.average_rating?.toFixed(1) || "0.0"}
													</td>
													<td className="px-6 py-4">
														<span
															className={`px-3 py-1 rounded-full text-xs font-medium
                              ${enterprise.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                            `}
														>
															{enterprise.is_active
																? "Активен"
																: "На модерации"}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						)}

						{/* Модерация отзывов */}
						{activeTab === "reviews" && (
							<div className="space-y-4">
								{reviews.length === 0 ? (
									<div className="text-center py-16 bg-white rounded-2xl">
										<h3 className="text-lg font-medium text-gray-600">
											Нет отзывов на модерации
										</h3>
									</div>
								) : (
									reviews.map((review) => (
										<div
											key={review.id}
											className="bg-white rounded-2xl p-6 border border-gray-100"
										>
											<div className="flex items-start justify-between mb-4">
												<div>
													<span className="font-semibold">
														{review.user_name}
													</span>
													<span className="text-gray-500 ml-2 text-sm">
														{review.user_email}
													</span>
												</div>
												<div className="flex text-yellow-400">
													{[1, 2, 3, 4, 5].map((star) => (
														<span key={star}>
															{star <= review.rating ? "★" : "☆"}
														</span>
													))}
												</div>
											</div>
											<p className="text-gray-600 mb-2">{review.comment}</p>
											<p className="text-gray-400 text-sm mb-4">
												Экскурсия: {review.excursion_title} •{" "}
												{review.enterprise_name}
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
					</>
				)}
			</div>
		</div>
	);
}

export default Admin;
