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
			{/* Hero секция */}
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
					<h1 className="heading-display">
						Промышленный туризм
						<br />
						<span className="gradient-text">в Кировской области</span>
					</h1>
					<p>
						Уникальные экскурсии по действующим предприятиям. Откройте для себя
						мир производства с новой стороны.
					</p>
					<div className="hero-search">
						<input
							type="text"
							className="search-input"
							placeholder="Поиск экскурсий, предприятий..."
						/>
						<Link to="/catalog" className="btn btn-primary">
							<svg
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.35-4.35" />
							</svg>
							Найти
						</Link>
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
						<h2 className="heading-2">Популярные экскурсии</h2>
						<p className="text-small">Выберите идеальный тур для себя</p>
					</div>
					<Link to="/catalog" className="btn btn-ghost hidden md:inline-flex">
						Все экскурсии →
					</Link>
				</div>

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
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold mb-2">Экскурсии не найдены</h3>
						<p className="text-gray-500">
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
					<Link to="/catalog" className="btn btn-primary">
						Все экскурсии
					</Link>
				</div>
			</section>

			{/* CTA секция */}
			<section className="py-20 px-4 bg-gradient-animated text-white">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="heading-1 mb-4">Готовы к новым открытиям?</h2>
					<p className="text-lg mb-8 opacity-90">
						Присоединяйтесь к тысячам путешественников, которые уже открыли для
						себя мир промышленного туризма.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/catalog" className="btn btn-primary">
							Выбрать экскурсию
						</Link>
						<Link to="/register" className="btn btn-secondary">
							Зарегистрироваться
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Home;
