import React, { useState, useEffect } from "react";
import { getAnalytics, getCities } from "../api";
import AnalyticsChart from "../components/AnalyticsChart";

function Analytics({ showToast }) {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);
	const [cities, setCities] = useState([]);
	const [filters, setFilters] = useState({
		from: "",
		to: "",
		city: "",
	});

	useEffect(() => {
		loadCities();
	}, []);

	useEffect(() => {
		loadAnalytics();
	}, [filters]);

	const loadCities = async () => {
		try {
			const data = await getCities();
			setCities(data);
		} catch (err) {
			console.error("Ошибка загрузки городов:", err);
		}
	};

	const loadAnalytics = async () => {
		setLoading(true);
		try {
			const params = {};
			if (filters.from) params.from = filters.from;
			if (filters.to) params.to = filters.to;
			if (filters.city) params.city = filters.city;

			const analyticsData = await getAnalytics(params);
			setData(analyticsData);
		} catch (err) {
			showToast("Ошибка загрузки аналитики", "error");
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("ru-RU").format(value || 0);
	};

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Аналитика</h1>

				{/* Фильтры */}
				<div className="bg-white rounded-2xl p-6 mb-8">
					<div className="grid md:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								От
							</label>
							<input
								type="date"
								value={filters.from}
								onChange={(e) =>
									setFilters((prev) => ({ ...prev, from: e.target.value }))
								}
								className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								До
							</label>
							<input
								type="date"
								value={filters.to}
								onChange={(e) =>
									setFilters((prev) => ({ ...prev, to: e.target.value }))
								}
								className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Город
							</label>
							<select
								value={filters.city}
								onChange={(e) =>
									setFilters((prev) => ({ ...prev, city: e.target.value }))
								}
								className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
							>
								<option value="">Все города</option>
								{cities.map((city) => (
									<option key={city} value={city}>
										{city}
									</option>
								))}
							</select>
						</div>
						<div className="flex items-end">
							<button
								onClick={() => setFilters({ from: "", to: "", city: "" })}
								className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
							>
								Сбросить
							</button>
						</div>
					</div>
				</div>

				{loading ? (
					<div className="grid md:grid-cols-3 gap-6 mb-8">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-32 skeleton rounded-2xl"></div>
						))}
					</div>
				) : (
					data && (
						<>
							{/* KPI карточки */}
							<div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<p className="text-sm text-gray-500 mb-1">Всего экскурсий</p>
									<p className="text-3xl font-bold text-primary">
										{data.total_excursions || 0}
									</p>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<p className="text-sm text-gray-500 mb-1">
										Всего посетителей
									</p>
									<p className="text-3xl font-bold text-primary">
										{data.total_visitors || 0}
									</p>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<p className="text-sm text-gray-500 mb-1">
										Выручка от экскурсий
									</p>
									<p className="text-3xl font-bold text-accent">
										{formatCurrency(data.excursion_revenue)} ₽
									</p>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<p className="text-sm text-gray-500 mb-1">
										Выручка от сувениров
									</p>
									<p className="text-3xl font-bold text-accent">
										{formatCurrency(data.souvenir_revenue)} ₽
									</p>
								</div>
								<div className="bg-white rounded-2xl p-6 border border-gray-100">
									<p className="text-sm text-gray-500 mb-1">Средний чек</p>
									<p className="text-3xl font-bold text-primary">
										{formatCurrency(data.avg_check)} ₽
									</p>
								</div>
							</div>

							{/* График */}
							<div className="mb-8">
								<AnalyticsChart data={data.monthly || []} loading={false} />
							</div>

							{/* Топ предприятий */}
							<div className="bg-white rounded-2xl p-6">
								<h3 className="font-semibold text-lg mb-4">
									Топ-5 предприятий по выручке
								</h3>
								<table className="w-full">
									<thead>
										<tr className="text-left text-sm text-gray-500 border-b">
											<th className="pb-3">Место</th>
											<th className="pb-3">Предприятие</th>
											<th className="pb-3">Город</th>
											<th className="pb-3 text-right">Бронирований</th>
											<th className="pb-3 text-right">Выручка</th>
										</tr>
									</thead>
									<tbody className="divide-y">
										{data.top_enterprises?.map((ent, index) => (
											<tr key={ent.id}>
												<td className="py-4">
													<span
														className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${index === 0 ? "bg-yellow-100 text-yellow-700" : ""}
                          ${index === 1 ? "bg-gray-100 text-gray-700" : ""}
                          ${index === 2 ? "bg-orange-100 text-orange-700" : ""}
                          ${index > 2 ? "bg-gray-50 text-gray-500" : ""}
                        `}
													>
														{index + 1}
													</span>
												</td>
												<td className="py-4 font-medium">{ent.name}</td>
												<td className="py-4 text-gray-500">{ent.city}</td>
												<td className="py-4 text-right">
													{ent.bookings_count}
												</td>
												<td className="py-4 text-right font-bold text-accent">
													{formatCurrency(ent.revenue)} ₽
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</>
					)
				)}
			</div>
		</div>
	);
}

export default Analytics;
