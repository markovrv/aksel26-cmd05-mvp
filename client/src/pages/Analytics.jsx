import React, { useState, useEffect } from "react";
import { getAnalytics, getCities } from "../api";
import AnalyticsChart from "../components/AnalyticsChart";

function Analytics({ showToast }) {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);
	const [cities, setCities] = useState([]);
	const [filters, setFilters] = useState({ from: "", to: "", city: "" });

	useEffect(() => { loadCities(); }, []);
	useEffect(() => { loadAnalytics(); }, [filters]);

	const loadCities = async () => {
		try { const data = await getCities(); setCities(data); }
		catch (err) { console.error("Ошибка загрузки городов:", err); }
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
		} catch (err) { showToast("Ошибка загрузки аналитики", "error"); }
		finally { setLoading(false); }
	};

	const formatCurrency = (value) => new Intl.NumberFormat("ru-RU").format(value || 0);

	return (
		<div className="min-h-screen py-8 px-4 bg-[#F5F3FF]">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-[#1F2937] mb-8">Аналитика</h1>

				{/* Фильтры */}
				<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-6 mb-8">
					<div className="grid md:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">От</label>
							<input type="date" value={filters.from}
								onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9]" />
						</div>
						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">До</label>
							<input type="date" value={filters.to}
								onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9]" />
						</div>
						<div>
							<label className="block text-sm font-medium text-[#1F2937] mb-1">Город</label>
							<select value={filters.city}
								onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
								className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9]">
								<option value="">Все города</option>
								{cities.map((city) => <option key={city} value={city}>{city}</option>)}
							</select>
						</div>
						<div className="flex items-end">
							<button onClick={() => setFilters({ from: "", to: "", city: "" })}
								className="w-full py-3 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl hover:bg-[#F5F3FF] transition-colors">Сбросить</button>
						</div>
					</div>
				</div>

				{loading ? (
					<div className="grid md:grid-cols-3 gap-6 mb-8">
						{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-32 skeleton rounded-2xl"></div>)}
					</div>
				) : data && (
					<>
						{/* KPI карточки */}
						<div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
							<div className="bg-white rounded-2xl p-6 border border-[#E9D5FF] shadow-card">
								<p className="text-sm text-[#6B7280] mb-1">Всего экскурсий</p>
								<p className="text-3xl font-bold text-[#6D28D9]">{data.total_excursions || 0}</p>
							</div>
							<div className="bg-white rounded-2xl p-6 border border-[#E9D5FF] shadow-card">
								<p className="text-sm text-[#6B7280] mb-1">Всего посетителей</p>
								<p className="text-3xl font-bold text-[#6D28D9]">{data.total_visitors || 0}</p>
							</div>
							<div className="bg-white rounded-2xl p-6 border border-[#E9D5FF] shadow-card">
								<p className="text-sm text-[#6B7280] mb-1">Выручка от экскурсий</p>
								<p className="text-3xl font-bold text-[#EC4899]">{formatCurrency(data.excursion_revenue)} ₽</p>
							</div>
							<div className="bg-white rounded-2xl p-6 border border-[#E9D5FF] shadow-card">
								<p className="text-sm text-[#6B7280] mb-1">Выручка от сувениров</p>
								<p className="text-3xl font-bold text-[#EC4899]">{formatCurrency(data.souvenir_revenue)} ₽</p>
							</div>
							<div className="bg-white rounded-2xl p-6 border border-[#E9D5FF] shadow-card">
								<p className="text-sm text-[#6B7280] mb-1">Средний чек</p>
								<p className="text-3xl font-bold text-[#6D28D9]">{formatCurrency(data.avg_check)} ₽</p>
							</div>
						</div>

						{/* График */}
						<div className="mb-8">
							<AnalyticsChart data={data.monthly || []} loading={false} />
						</div>

						{/* Топ предприятий */}
						<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-6">
							<h3 className="font-semibold text-lg text-[#1F2937] mb-4">Топ-5 предприятий по выручке</h3>
							<table className="w-full">
								<thead>
									<tr className="text-left text-sm text-[#6B7280] border-b border-[#E9D5FF]">
										<th className="pb-3">Место</th>
										<th className="pb-3">Предприятие</th>
										<th className="pb-3">Город</th>
										<th className="pb-3 text-right">Бронирований</th>
										<th className="pb-3 text-right">Выручка</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#E9D5FF]">
									{data.top_enterprises?.map((ent, index) => (
										<tr key={ent.id}>
											<td className="py-4">
												<span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
													${index === 0 ? "bg-[#FEF3C7] text-[#D97706]" : ""}
													${index === 1 ? "bg-[#EDE9FE] text-[#6D28D9]" : ""}
													${index === 2 ? "bg-[#FCE7F3] text-[#EC4899]" : ""}
													${index > 2 ? "bg-[#F5F3FF] text-[#6B7280]" : ""}`}>
													{index + 1}
												</span>
											</td>
											<td className="py-4 font-medium text-[#1F2937]">{ent.name}</td>
											<td className="py-4 text-[#6B7280]">{ent.city}</td>
											<td className="py-4 text-right">{ent.bookings_count}</td>
											<td className="py-4 text-right font-bold text-[#EC4899]">{formatCurrency(ent.revenue)} ₽</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default Analytics;