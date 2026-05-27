import React from "react";

function AnalyticsChart({ data = [], loading }) {
	if (loading) {
		return (
			<div className="h-64 flex items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-500">Загрузка графика...</p>
				</div>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="h-64 flex items-center justify-center text-gray-500">
				<div className="text-center">
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
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					<p>Нет данных для отображения</p>
				</div>
			</div>
		);
	}

	const maxValue = Math.max(...data.map((d) => d.visitors), 1);
	const maxHeight = 200;

	const formatMonth = (monthStr) => {
		const [year, month] = monthStr.split("-");
		const date = new Date(year, parseInt(month) - 1);
		return date.toLocaleDateString("ru-RU", { month: "short" });
	};

	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-6">
			<h4 className="font-semibold text-lg mb-4">Посещаемость по месяцам</h4>
			<div className="flex items-end justify-between gap-2 h-64">
				{data.map((item, index) => {
					const height = (item.visitors / maxValue) * maxHeight;
					return (
						<div
							key={index}
							className="flex-1 flex flex-col items-center gap-2"
						>
							<div
								className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary-hover relative group"
								style={{ height: `${Math.max(height, 4)}px` }}
							>
								<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
									{item.visitors} посетителей
								</div>
							</div>
							<span className="text-xs text-gray-500">
								{formatMonth(item.month)}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default AnalyticsChart;
