import React from "react";
import { Link } from "react-router-dom";

function ExcursionCard({ excursion, showBadge }) {
	const imageUrl =
		excursion.photo_url ||
		(excursion.photos?.length > 0
			? excursion.photos[0]
			: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800");

	return (
		<article className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] overflow-hidden hover:shadow-hover transition-shadow cursor-pointer excursion-card">
			{showBadge && (
				<div className="excursion-badge">
					<span className="bg-[#DBEAFE] text-[#1D4ED8] text-xs font-semibold px-3 py-1 rounded-full">Популярное</span>
				</div>
			)}
			<img
				src={imageUrl}
				alt={excursion.title}
				className="excursion-image"
				loading="lazy"
			/>
			<div className="excursion-content">
				<div className="excursion-meta">
					<span className="excursion-city">
						<svg
							width="14"
							height="14"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						{excursion.city}
					</span>
					{excursion.enterprise_rating && (
						<span className="excursion-rating">
							<svg
								width="14"
								height="14"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
							{excursion.enterprise_rating.toFixed(1)}
						</span>
					)}
				</div>
				<h3 className="excursion-title">{excursion.title}</h3>
				<p className="excursion-enterprise">🏭 {excursion.enterprise_name}</p>

				<div className="excursion-details">
					<span className="excursion-detail">
						<svg
							width="14"
							height="14"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
						{excursion.duration_minutes} мин
					</span>
					<span className="excursion-detail">
						<svg
							width="14"
							height="14"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
						</svg>
						до {excursion.max_participants} чел.
					</span>
				</div>

				<div className="excursion-footer">
					<div>
						<span className="price-value">
							{excursion.default_price.toLocaleString()} ₽
						</span>
						<span className="price-label"> / чел.</span>
					</div>
					<Link
						to={`/excursion/${excursion.id}`}
						className="bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-semibold px-4 py-2 rounded-xl shadow-btn transition-all duration-200 active:scale-95 text-sm"
					>
						Подробнее
					</Link>
				</div>
			</div>
		</article>
	);
}

export default ExcursionCard;