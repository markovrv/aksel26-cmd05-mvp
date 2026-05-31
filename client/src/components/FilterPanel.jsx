import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getExcursionDates } from "../api";

function FilterPanel({ cities = [], enterprises = [], onFilter }) {
	const [searchParams, setSearchParams] = useSearchParams();
	const [isOpen, setIsOpen] = useState(false);
	const [availableDates, setAvailableDates] = useState([]);
	const [calendarMonth, setCalendarMonth] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [showCalendar, setShowCalendar] = useState(false);
	const [searchLocal, setSearchLocal] = useState(searchParams.get("search") || "");

	const city = searchParams.get("city") || "";
	const date = searchParams.get("date") || "";
	const enterprise_id = searchParams.get("enterprise_id") || "";
	const search = searchParams.get("search") || "";

	// Синхронизация из URL → локальное состояние при изменении URL
	useEffect(() => {
		setSearchLocal(searchParams.get("search") || "");
	}, [searchParams]);

	useEffect(() => {
		loadAvailableDates();
	}, []);

	const loadAvailableDates = async () => {
		try {
			const data = await getExcursionDates();
			setAvailableDates(data);
		} catch (err) {
			console.error("Ошибка загрузки дат экскурсий:", err);
		}
	};

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

	const handleSearchSubmit = () => {
		handleChange("search", searchLocal);
	};

	const handleSearchKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSearchSubmit();
		}
	};

	const handleReset = () => {
		setSearchLocal("");
		setSearchParams({});
		onFilter?.({});
	};

	const hasFilters = city || date || enterprise_id || search;

	// Календарь
	const formatDateKey = (year, month, day) => {
		return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	};

	const isDateAvailable = (year, month, day) => {
		const key = formatDateKey(year, month, day);
		return availableDates.includes(key);
	};

	const isDateSelected = (year, month, day) => {
		const key = formatDateKey(year, month, day);
		return date === key;
	};

	const isPastDate = (year, month, day) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const check = new Date(year, month, day);
		return check < today;
	};

	const handleDateClick = (year, month, day) => {
		const key = formatDateKey(year, month, day);
		if (date === key) {
			handleChange("date", "");
		} else {
			handleChange("date", key);
		}
		setShowCalendar(false);
	};

	const prevMonth = () => {
		setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
	};

	const nextMonth = () => {
		setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
	};

	const renderCalendar = () => {
		const year = calendarMonth.getFullYear();
		const month = calendarMonth.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const firstDayOfWeek = new Date(year, month, 1).getDay();
		const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

		const monthNames = [
			"Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
			"Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
		];

		const days = [];
		for (let i = 0; i < startOffset; i++) {
			days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
		}
		for (let d = 1; d <= daysInMonth; d++) {
			const available = isDateAvailable(year, month, d);
			const selected = isDateSelected(year, month, d);
			const past = isPastDate(year, month, d);
			const clickable = available && !past;

			days.push(
				<button
					key={d}
					type="button"
					disabled={!clickable}
					onClick={() => clickable && handleDateClick(year, month, d)}
					className={`h-9 w-9 rounded-full text-sm font-medium flex items-center justify-center transition-all duration-150 ${
						selected
							? "bg-[#6D28D9] text-white shadow-sm"
							: available && !past
								? "bg-[#F5F3FF] text-[#6D28D9] hover:bg-[#E9D5FF] font-semibold"
								: "text-[#9CA3AF] cursor-not-allowed"
					}`}
				>
					{d}
				</button>,
			);
		}

		return (
			<div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-4 z-30 w-72">
				{/* Навигация по месяцам */}
				<div className="flex items-center justify-between mb-3">
					<button
						type="button"
						onClick={prevMonth}
						className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F3FF] text-[#6B7280]"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
					<span className="font-semibold text-[#1F2937] text-sm">
						{monthNames[month]} {year}
					</span>
					<button
						type="button"
						onClick={nextMonth}
						className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F3FF] text-[#6B7280]"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				</div>

				<div className="grid grid-cols-7 gap-1 mb-1">
					{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((name) => (
						<div key={name} className="h-9 w-9 flex items-center justify-center text-xs text-[#6B7280] font-medium">
							{name}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-1">{days}</div>

				<div className="mt-3 pt-3 border-t border-[#E9D5FF] flex items-center gap-4 text-xs text-[#6B7280]">
					<div className="flex items-center gap-1.5">
						<div className="w-3 h-3 rounded-full bg-[#F5F3FF] border border-[#E9D5FF]" />
						<span>Есть экскурсии</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="w-3 h-3 rounded-full bg-[#6D28D9]" />
						<span>Выбрано</span>
					</div>
				</div>
			</div>
		);
	};

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
					<label className="filter-label">Поиск</label>
					<div className="relative">
						<input
							type="text"
							placeholder="Поиск экскурсий..."
							value={searchLocal}
							onChange={(e) => setSearchLocal(e.target.value)}
							onKeyDown={handleSearchKeyDown}
							className="filter-select pr-10"
						/>
						<button
							type="button"
							onClick={handleSearchSubmit}
							className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F3FF] text-[#6B7280]"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.35-4.35" />
							</svg>
						</button>
					</div>
				</div>

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

				<div className="filter-group relative">
					<label className="filter-label">Дата экскурсии</label>
					<button
						type="button"
						onClick={() => setShowCalendar(!showCalendar)}
						className="filter-select text-left flex items-center gap-2"
					>
						<svg className="w-4 h-4 text-[#6B7280] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
						<span className={date ? "text-[#1F2937]" : "text-[#6B7280]"}>
							{date
								? new Date(date + "T00:00:00").toLocaleDateString("ru-RU", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})
								: "Выберите дату"}
						</span>
					</button>

					{showCalendar && renderCalendar()}
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