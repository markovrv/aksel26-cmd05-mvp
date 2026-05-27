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
		<div className="bg-[#F5F3FF] border-2 border-dashed border-[#A855F7] rounded-2xl p-5 text-center">
			<p className="text-xs text-[#6B7280] mb-4 uppercase tracking-wide font-medium">
				Тестовый режим оплаты
			</p>
			<div className="flex flex-col gap-3">
				<button
					onClick={() => handlePayment("success")}
					disabled={processing}
					className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-semibold py-3.5 rounded-xl shadow-btn hover:opacity-90 transition-all disabled:opacity-50"
				>
					{loading === "success" ? "Обработка..." : "Оплатить"}
				</button>
				<button
					onClick={() => handlePayment("fail")}
					disabled={processing}
					className="bg-white border border-[#D1D5DB] text-[#6B7280] font-medium py-3 rounded-xl hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors text-sm disabled:opacity-50"
				>
					{loading === "fail" ? "Обработка..." : "Симулировать ошибку оплаты"}
				</button>
				<button
					onClick={() => handlePayment("timeout")}
					disabled={processing}
					className="text-[#6B7280] text-sm underline hover:text-[#F59E0B] transition-colors disabled:opacity-50"
				>
					{loading === "timeout" ? "Ожидание..." : "Симулировать таймаут"}
				</button>
			</div>
		</div>
	);
}

export default PaymentEmulator;