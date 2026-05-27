import React from "react";
import { useLocation, Link } from "react-router-dom";

function PaymentResult({ showToast }) {
	const location = useLocation();
	const { success, bookingId, paymentId, message, isTimeout } =
		location.state || {};

	if (success) {
		return (
			<div className="min-h-screen py-16 px-4 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center">
					<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-12 h-12 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Экскурсия забронирована!
					</h1>
					<p className="text-gray-600 mb-6">
						Номер операции:{" "}
						<span className="font-mono font-medium">{paymentId || "N/A"}</span>
					</p>
					<p className="text-gray-500 mb-8">
						Подтверждение отправлено на вашу электронную почту.
					</p>

					<div className="flex flex-col gap-3">
						<Link
							to="/account"
							className="py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors"
						>
							В личный кабинет
						</Link>
						<Link
							to="/"
							className="py-3 border border-primary text-primary rounded-xl font-semibold hover:bg-blue-50 transition-colors"
						>
							На главную
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (isTimeout) {
		return (
			<div className="min-h-screen py-16 px-4 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center">
					<div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-12 h-12 text-yellow-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>

					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Время ожидания истекло
					</h1>
					<p className="text-gray-600 mb-8">
						Платёжная система не ответила вовремя. Попробуйте повторить оплату.
					</p>

					<div className="flex flex-col gap-3">
						<Link
							to="/account"
							className="py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors"
						>
							В личный кабинет
						</Link>
						<Link
							to="/catalog"
							className="py-3 border border-primary text-primary rounded-xl font-semibold hover:bg-blue-50 transition-colors"
						>
							Выбрать другую экскурсию
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Ошибка
	return (
		<div className="min-h-screen py-16 px-4 flex items-center justify-center">
			<div className="max-w-md mx-auto text-center">
				<div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg
						className="w-12 h-12 text-red-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>

				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Оплата не прошла
				</h1>
				<p className="text-gray-600 mb-2">
					{message || "Произошла ошибка при оплате."}
				</p>
				<p className="text-gray-500 mb-8">
					Бронь отменена. Вы можете попробовать снова.
				</p>

				<div className="flex flex-col gap-3">
					<Link
						to="/catalog"
						className="py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors"
					>
						Попробовать снова
					</Link>
					<Link
						to="/"
						className="py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
					>
						На главную
					</Link>
				</div>
			</div>
		</div>
	);
}

export default PaymentResult;
