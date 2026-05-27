import React from "react";
import { Link } from "react-router-dom";

function EnterpriseCard({ enterprise }) {
	const photos =
		enterprise.photos?.length > 0
			? enterprise.photos
			: ["https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800"];

	return (
		<Link to={`/enterprise/${enterprise.id}`} className="card card-hover block">
			<div className="h-48 overflow-hidden">
				<img
					src={photos[0]}
					alt={enterprise.name}
					className="w-full h-full object-cover transition-transform duration-300"
					style={{ transform: "none" }}
					onMouseEnter={(e) =>
						(e.currentTarget.style.transform = "scale(1.05)")
					}
					onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
				/>
			</div>
			<div className="p-5">
				<div className="flex items-start justify-between gap-2 mb-2">
					<h3
						className="font-semibold text-lg text-gray-900 line-clamp-1"
						style={{ fontFamily: "'Manrope', sans-serif" }}
					>
						{enterprise.name}
					</h3>
					<div className="flex items-center gap-1 shrink-0">
						<span className="text-yellow-500">★</span>
						<span className="font-medium text-sm">
							{enterprise.average_rating?.toFixed(1) || "0.0"}
						</span>
					</div>
				</div>
				<p className="text-gray-500 text-sm mb-3">
					<svg
						className="inline w-4 h-4 mr-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
					{enterprise.city}, {enterprise.address}
				</p>
				<p className="text-gray-600 text-sm line-clamp-2 mb-4">
					{enterprise.description}
				</p>
				<span
					className="text-primary font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all"
					style={{ fontFamily: "'Manrope', sans-serif" }}
				>
					Подробнее
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</span>
			</div>
		</Link>
	);
}

export default EnterpriseCard;
