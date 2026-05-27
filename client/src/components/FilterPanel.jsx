import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

function FilterPanel({ cities = [], enterprises = [], onFilter }) {
	const [searchParams, setSearchParams] = useSearchParams();
	const [isOpen, setIsOpen] = useState(false);

	const city = searchParams.get("city") || "";
	const date = searchParams.get("date") || "";
	const enterprise_id = searchParams.get("enterprise_id") || "";

	const handleChange = (key, value) => {
		const newParams = new URLSearchParams(searchParams);
		if (value) {
			newParams.set(key, value);
		} else {
			newParams.delete(key);
		}
		newParams.delete("offset");
		setSearchParams(newParams);
		onFilter?.(newParams);
	};

	const handleReset = () => {
		setSearchParams({});
		onFilter?.({});
	};

	const hasFilters = city || date || enterprise_id;

	return (
		<>
			{/* Mobile toggle button */}
			<button
				className="filter-toggle md:hidden"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span>🔍 Фильтры</span>
				<svg
					className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					viewBox="0 0 24 24"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{/* Filter panel */}
			<aside className={`filter-panel ${isOpen ? "open" : ""}`}>
				<h3 className="font-bold text-lg text-[#1F2937] mb-5">
					Фильтры
				</h3>

				<div className="filter-group">
					<label className="filter-label">Город</label>
					<select
						value={city}
						onChange={(e) => handleChange("city", e.target.value)}
						className="filter-select"
					>
						<option value="">Все города</option>
						{cities.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Дата</label>
					<input
						type="date"
						value={date}
						onChange={(e) => handleChange("date", e.target.value)}
						className="filter-select"
					/>
				</div>

				<div className="filter-group">
					<label className="filter-label">Предприятие</label>
					<select
						value={enterprise_id}
						onChange={(e) => handleChange("enterprise_id", e.target.value)}
						className="filter-select"
					>
						<option value="">Все предприятия</option>
						{enterprises.map((ent) => (
							<option key={ent.id} value={ent.id}>
								{ent.name}
							</option>
						))}
					</select>
				</div>

				{hasFilters && (
					<button onClick={handleReset} className="filter-reset">
						Сбросить фильтры
					</button>
				)}
			</aside>
		</>
	);
}

export default FilterPanel;