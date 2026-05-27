import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getExcursions, getEnterprises } from "../api";
import ExcursionCard from "../components/ExcursionCard";
import FilterPanel from "../components/FilterPanel";

function Catalog() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [excursions, setExcursions] = useState([]);
	const [enterprises, setEnterprises] = useState([]);
	const [cities, setCities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	const offset = parseInt(searchParams.get("offset") || "0");
	const limit = 12;

	useEffect(() => {
		loadEnterprises();
		loadCities();
	}, []);

	useEffect(() => {
		loadExcursions();
	}, [searchParams]);

	const loadEnterprises = async () => {
		try {
			const data = await getEnterprises();
			setEnterprises(data);
		} catch (err) {
			console.error("Ошибка загрузки предприятий:", err);
		}
	};

	const loadCities = async () => {
		try {
			const data = await getEnterprises();
			const uniqueCities = [...new Set(data.map((e) => e.city))];
			setCities(uniqueCities);
		} catch (err) {
			console.error("Ошибка загрузки городов:", err);
		}
	};

	const loadExcursions = async (loadMore = false) => {
		if (loadMore) {
			setLoadingMore(true);
		} else {
			setLoading(true);
		}

		try {
			const params = {};
			if (searchParams.get("city")) params.city = searchParams.get("city");
			if (searchParams.get("date")) params.date = searchParams.get("date");
			if (searchParams.get("enterprise_id"))
				params.enterprise_id = searchParams.get("enterprise_id");

			const data = await getExcursions(params);

			if (loadMore) {
				setExcursions((prev) => [...prev, ...data]);
			} else {
				setExcursions(data);
			}
		} catch (err) {
			console.error("Ошибка загрузки экскурсий:", err);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handleFilterChange = (params) => {
		setSearchParams(params);
	};

	const loadMore = () => {
		const newOffset = offset + limit;
		const newParams = new URLSearchParams(searchParams);
		newParams.set("offset", newOffset.toString());
		setSearchParams(newParams);
	};

	const hasMore = excursions.length >= limit;

	return (
		<div className="min-h-screen py-8 px-4 bg-background">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="heading-1 mb-2">Каталог экскурсий</h1>
					<p className="text-small">
						Найдите идеальную экскурсию для себя и своих близких
					</p>
				</div>

				<div className="catalog-grid">
					{/* Фильтры */}
					<FilterPanel cities={cities} onFilter={handleFilterChange} />

					{/* Результаты */}
					<main>
						{loading ? (
							<div className="excursions-grid">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div key={i} className="card">
										<div className="skeleton h-48 w-full"></div>
										<div className="p-5">
											<div className="skeleton h-6 w-3/4 mb-2"></div>
											<div className="skeleton h-4 w-1/2 mb-4"></div>
											<div className="skeleton h-8 w-full"></div>
										</div>
									</div>
								))}
							</div>
						) : excursions.length === 0 ? (
							<div className="text-center py-16">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
									<svg
										className="w-8 h-8 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
								<h3 className="text-lg font-semibold mb-2">
									Ничего не найдено
								</h3>
								<p className="text-gray-500">
									Попробуйте изменить параметры поиска
								</p>
							</div>
						) : (
							<>
								<div className="mb-6">
									<p className="text-small">
										Найдено {excursions.length} экскурсий
									</p>
								</div>
								<div className="excursions-grid">
									{excursions.map((excursion, index) => (
										<ExcursionCard
											key={excursion.id}
											excursion={excursion}
											showBadge={index < 2}
										/>
									))}
								</div>

								{hasMore && (
									<div className="text-center mt-8">
										<button
											onClick={loadMore}
											disabled={loadingMore}
											className="btn btn-ghost"
										>
											{loadingMore ? "Загрузка..." : "Загрузить ещё"}
										</button>
									</div>
								)}
							</>
						)}
					</main>
				</div>
			</div>
		</div>
	);
}

export default Catalog;
