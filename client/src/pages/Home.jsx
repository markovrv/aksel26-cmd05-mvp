import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEnterprises, getExcursions } from "../api";
import ExcursionCard from "../components/ExcursionCard";

function Home() {
	const [enterprises, setEnterprises] = useState([]);
	const [excursions, setExcursions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [entData, excData] = await Promise.all([
				getEnterprises(),
				getExcursions(),
			]);
			setEnterprises(entData);
			setExcursions(excData);
		} catch (err) {
			console.error("Ошибка загрузки данных:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			{/* Hero секция — тёмный градиент с городским промышленным силуэтом */}
			<section className="hero">
				<div className="hero-decorative hero-decorative-1"></div>
				<div className="hero-decorative hero-decorative-2"></div>
				<div className="hero-content">
					<div className="hero-badge">
						<svg
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
						</svg>
						Более 1000 посетителей в 2025 году
					</div>
					<h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
						Промышленный туризм<br />
						<span className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">в Кировской области</span>
					</h1>
					<p className="text-[#E9D5FF] text-lg">
						Уникальные экскурсии по действующим предприятиям. Откройте для себя
						мир производства с новой стороны.
					</p>
					<div className="hero-search">
						<div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 max-w-md shadow-btn">
							<svg className="w-5 h-5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.35-4.35" />
							</svg>
							<input
								type="text"
								placeholder="Поиск экскурсий"
								className="flex-1 outline-none text-[#1F2937] placeholder-[#6B7280]"
							/>
						</div>
						<Link to="/catalog" className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-semibold px-6 py-3 rounded-xl shadow-btn hover:opacity-90 transition-all duration-200 text-center">
							Найти
						</Link>
					</div>
					<div className="flex gap-2 mt-4 flex-wrap justify-center">
						<span className="bg-[#6D28D9] text-white text-sm px-4 py-1.5 rounded-full font-medium">Все</span>
						<span className="bg-white/20 text-white text-sm px-4 py-1.5 rounded-full">Заводы</span>
						<span className="bg-white/20 text-white text-sm px-4 py-1.5 rounded-full">Фабрики</span>
						<span className="bg-white/20 text-white text-sm px-4 py-1.5 rounded-full">Лаборатории</span>
					</div>
				</div>
			</section>

			{/* Статистика */}
			<section className="stats-section">
				<div className="stats-grid">
					<div className="stat-item">
						<div className="stat-value">{enterprises.length}+</div>
						<div className="stat-label">Предприятий</div>
					</div>
					<div className="stat-item">
						<div className="stat-value">{excursions.length}+</div>
						<div className="stat-label">Экскурсий</div>
					</div>
					<div className="stat-item">
						<div className="stat-value">1000+</div>
						<div className="stat-label">Посетителей</div>
					</div>
					<div className="stat-item">
						<div className="stat-value">4.8</div>
						<div className="stat-label">Средний рейтинг</div>
					</div>
				</div>
			</section>

			{/* Популярные экскурсии */}
			<section className="catalog-section">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h2 className="text-2xl md:text-3xl font-bold text-[#1F2937]">Популярные экскурсии</h2>
						<p className="text-[#6B7280]">Выберите идеальный тур для себя</p>
					</div>
					<Link to="/catalog" className="text-[#6D28D9] font-medium hover:underline hidden md:inline-flex items-center gap-1">
						Все экскурсии →
					</Link>
				</div>

				{loading ? (
					<div className="excursions-grid">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="bg-white rounded-2xl border border-[#E9D5FF] overflow-hidden">
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
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F3FF] flex items-center justify-center">
							<svg
								className="w-8 h-8 text-[#A855F7]"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-[#1F2937] mb-2">Экскурсии не найдены</h3>
						<p className="text-[#6B7280]">
							Попробуйте изменить параметры поиска
						</p>
					</div>
				) : (
					<div className="excursions-grid">
						{excursions.map((excursion, index) => (
							<ExcursionCard
								key={excursion.id}
								excursion={excursion}
								showBadge={index === 0}
							/>
						))}
					</div>
				)}

				<div className="text-center mt-8 md:hidden">
					<Link to="/catalog" className="bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-semibold px-6 py-3 rounded-xl shadow-btn transition-all duration-200 active:scale-95 inline-block">
						Все экскурсии
					</Link>
				</div>
			</section>

			{/* CTA секция */}
			<section className="py-20 px-4 bg-gradient-animated text-white">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">Готовы к новым открытиям?</h2>
					<p className="text-lg mb-8 opacity-90">
						Присоединяйтесь к тысячам путешественников, которые уже открыли для
						себя мир промышленного туризма.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/catalog" className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-semibold px-8 py-4 rounded-xl shadow-btn hover:opacity-90 transition-all duration-200">
							Выбрать экскурсию
						</Link>
						<Link to="/register" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200">
							Зарегистрироваться
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Home;