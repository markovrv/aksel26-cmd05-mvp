import React, { useState } from "react";
import { createReview } from "../api";

function ReviewForm({ bookingId, onSuccess, onCancel }) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
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
			await createReview({ booking_id: bookingId, rating, comment });
			onSuccess?.();
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white rounded-2xl border border-gray-200 p-6"
		>
			<h4 className="font-semibold text-lg mb-4">Оставить отзыв</h4>

			{/* Звёздный рейтинг */}
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 mb-2">
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
                ${(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"}
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
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Комментарий <span className="text-gray-400">(необязательно)</span>
				</label>
				<textarea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					rows={4}
					placeholder="Поделитесь впечатлениями об экскурсии..."
					className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
				/>
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
					{error}
				</div>
			)}

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={loading}
					className="flex-1 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
				>
					{loading ? "Отправка..." : "Отправить отзыв"}
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
				>
					Отмена
				</button>
			</div>
		</form>
	);
}

export default ReviewForm;
