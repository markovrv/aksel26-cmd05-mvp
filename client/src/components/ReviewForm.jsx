import React, { useState } from "react";
import { createReview } from "../api";

function ReviewForm({ bookingId, onSuccess, onCancel, initialRating = 0, initialComment = "", onSubmit } ) {
	const [rating, setRating] = useState(initialRating);
	const [comment, setComment] = useState(initialComment);
	const [hoverRating, setHoverRating] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (rating === 0) {
			setError("Пожалуйста, поставьте оценку");
			return;
		}

		setLoading(true);
		try {
			if (onSubmit) {
				await onSubmit({ rating, comment });
			} else {
				await createReview({ booking_id: bookingId, rating, comment });
			}
			onSuccess?.({ rating, comment });
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white rounded-2xl border border-[#E9D5FF] shadow-card p-6"
		>
			<h4 className="font-semibold text-lg text-[#1F2937] mb-4">{initialRating ? "Редактировать отзыв" : "Оставить отзыв"}</h4>

			{/* Звёздный рейтинг */}
			<div className="mb-4">
				<label className="block text-sm font-medium text-[#1F2937] mb-2">
					Оценка
				</label>
				<div className="flex gap-1">
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							type="button"
							onClick={() => setRating(star)}
							onMouseEnter={() => setHoverRating(star)}
							onMouseLeave={() => setHoverRating(0)}
							className="text-3xl transition-transform hover:scale-110"
						>
							<span
								className={`
                ${(hoverRating || rating) >= star ? "text-[#EC4899]" : "text-[#D1D5DB]"}
              `}
							>
								★
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Комментарий */}
			<div className="mb-4">
				<label className="block text-sm font-medium text-[#1F2937] mb-2">
					Комментарий <span className="text-[#6B7280]">(необязательно)</span>
				</label>
				<textarea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					rows={4}
					placeholder="Поделитесь впечатлениями об экскурсии..."
					className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-[#6D28D9] transition-all duration-150 resize-none"
				/>
			</div>

			{error && (
				<div className="mb-4 p-3 bg-[#FEE2E2] text-[#DC2626] rounded-xl text-sm">
					{error}
				</div>
			)}

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={loading}
					className="flex-1 py-3 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
				>
					{loading ? "Отправка..." : initialRating ? "Сохранить изменения" : "Отправить отзыв"}
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-3 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl hover:bg-[#F5F3FF] transition-colors"
				>
					Отмена
				</button>
			</div>
		</form>
	);
}

export default ReviewForm;