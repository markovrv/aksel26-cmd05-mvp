import React, { useState } from "react";
import { processPayment } from "../api";

function PaymentEmulator({ bookingId, onSuccess, onError, onTimeout }) {
	const [loading, setLoading] = useState(null);
	const [processing, setProcessing] = useState(false);

	const handlePayment = async (scenario) => {
		setLoading(scenario);
		setProcessing(true);

		try {
			const result = await processPayment({ booking_id: bookingId, scenario });

			if (result.success) {
				onSuccess?.(result);
			} else {
				if (scenario === "timeout") {
					onTimeout?.(result);
				} else {
					onError?.(result);
				}
			}
		} catch (err) {
			onError?.({ message: err.message });
		} finally {
			setLoading(null);
			setProcessing(false);
		}
	};

	return (
		<div className="border-dashed border-2 border-orange-300 bg-orange-50 p-6 rounded-xl">
			<div className="flex items-center gap-2 mb-4">
				<svg
					className="w-6 h-6 text-orange-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
				<span className="font-semibold text-orange-800">
					Тестовый режим оплаты
				</span>
			</div>

			<p className="text-sm text-orange-700 mb-4">
				Выберите сценарий для тестирования платёжной системы
			</p>

			<div className="grid gap-3">
				<button
					onClick={() => handlePayment("success")}
					disabled={processing}
					className={`
            w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
            ${
							loading === "success"
								? "bg-green-500 text-white"
								: "bg-green-600 hover:bg-green-700 text-white"
						}
          `}
				>
					{loading === "success" ? (
						<>
							<svg
								className="w-5 h-5 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Обработка...
						</>
					) : (
						<>
							<svg
								className="w-5 h-5"
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
							Оплатить (успех)
						</>
					)}
				</button>

				<button
					onClick={() => handlePayment("fail")}
					disabled={processing}
					className={`
            w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
            ${
							loading === "fail"
								? "bg-red-500 text-white"
								: "bg-red-600 hover:bg-red-700 text-white"
						}
          `}
				>
					{loading === "fail" ? (
						<>
							<svg
								className="w-5 h-5 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Обработка...
						</>
					) : (
						<>
							<svg
								className="w-5 h-5"
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
							Ошибка оплаты
						</>
					)}
				</button>

				<button
					onClick={() => handlePayment("timeout")}
					disabled={processing}
					className={`
            w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
            ${
							loading === "timeout"
								? "bg-yellow-500 text-white"
								: "bg-yellow-500 hover:bg-yellow-600 text-white"
						}
          `}
				>
					{loading === "timeout" ? (
						<>
							<svg
								className="w-5 h-5 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Ожидание (3 сек)...
						</>
					) : (
						<>
							<svg
								className="w-5 h-5"
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
							Таймаут
						</>
					)}
				</button>
			</div>
		</div>
	);
}

export default PaymentEmulator;
