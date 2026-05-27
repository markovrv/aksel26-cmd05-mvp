import React from "react";

function ReviewList({ reviews = [] }) {
	if (reviews.length === 0) {
		return (
			<div className="text-center py-12 text-[#6B7280]">
				<svg
					className="w-16 h-16 mx-auto mb-4 text-[#A855F7]"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
					/>
				</svg>
				<p className="text-lg font-medium text-[#1F2937] mb-1">
					Пока нет отзывов
				</p>
				<p className="text-sm">Будьте первым, кто оставит отзыв!</p>
			</div>
		);
	}

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	// Вычисляем средний рейтинг
	const avgRating =
		reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

	return (
		<div>
			{/* Заголовок со средним рейтингом */}
			<div className="flex items-center gap-4 mb-6">
				<div className="flex items-center gap-2">
					<span className="text-4xl font-bold text-[#6D28D9]">
						{avgRating.toFixed(1)}
					</span>
					<div className="flex text-[#EC4899] text-2xl">
						{[1, 2, 3, 4, 5].map((star) => (
							<span key={star}>
								{star <= Math.round(avgRating) ? "★" : "☆"}
							</span>
						))}
					</div>
				</div>
				<span className="text-[#6B7280]">
					на основе {reviews.length}{" "}
					{reviews.length === 1
						? "отзыва"
						: reviews.length < 5
							? "отзывов"
							: "отзывов"}
				</span>
			</div>

			{/* Список отзывов */}
			<div className="space-y-4">
				{reviews.map((review) => (
					<div
						key={review.id}
						className="bg-white rounded-2xl border border-[#E9D5FF] p-5 shadow-card"
					>
						<div className="flex items-start justify-between mb-3">
							<div>
								<span className="font-medium text-[#1F2937]">
									{review.user_name}
								</span>
								<span className="text-[#6B7280] text-sm ml-2">
									{formatDate(review.created_at)}
								</span>
							</div>
							<div className="flex text-[#EC4899]">
								{[1, 2, 3, 4, 5].map((star) => (
									<span
										key={star}
										className={star <= review.rating ? "" : "text-[#D1D5DB]"}
									>
										★
									</span>
								))}
							</div>
						</div>
						{review.comment && (
							<p className="text-[#1F2937] leading-relaxed opacity-80">{review.comment}</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export default ReviewList;