import React from "react";
import { useLocation, Link } from "react-router-dom";

function PaymentResult({ showToast }) {
	const location = useLocation();
	const { success, bookingId, paymentId, message, isTimeout, enterprise, date, time, count, merchCount } =
		location.state || {};

	if (success) {
		return (
			<div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center p-6">
				<div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-btn mb-6">
					<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h1 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">
					Заказ успешно оформлен!
				</h1>
				<p className="text-[#6B7280] text-center mb-6">
					{enterprise && <>Экскурсия: {enterprise}<br /></>}
					{date && <>{date} в {time}<br /></>}
					{count && <>Участников: {count}<br /></>}
					{merchCount && <>Мерч: {merchCount} позиции<br /></>}
					<span className="font-semibold text-[#1F2937]">№ заказа: {bookingId || paymentId || "N/A"}</span>
				</p>
				<div className="flex flex-col gap-3 w-full max-w-xs">
					<Link to="/account" className="bg-[#6D28D9] text-white font-semibold px-8 py-3.5 rounded-xl shadow-btn hover:bg-[#7C3AED] w-full text-center">
						Перейти к билетам
					</Link>
					<Link to="/" className="text-[#6D28D9] font-medium hover:underline text-center">
						На главную
					</Link>
				</div>
			</div>
		);
	}

	if (isTimeout) {
		return (
			<div className="min-h-screen flex items-center justify-center py-16 px-4 bg-[#F5F3FF]">
				<div className="max-w-md mx-auto text-center">
					<div className="w-24 h-24 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-6">
						<svg className="w-12 h-12 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-[#1F2937] mb-4">Время ожидания истекло</h1>
					<p className="text-[#6B7280] mb-8">Платёжная система не ответила вовремя. Попробуйте повторить оплату.</p>
					<div className="flex flex-col gap-3">
						<Link to="/account" className="py-3 bg-[#6D28D9] text-white rounded-xl font-semibold hover:bg-[#7C3AED] transition-colors">
							В личный кабинет
						</Link>
						<Link to="/catalog" className="py-3 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl font-semibold hover:bg-[#F5F3FF] transition-colors">
							Выбрать другую экскурсию
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center py-16 px-4 bg-[#F5F3FF]">
			<div className="max-w-md mx-auto text-center">
				<div className="w-20 h-20 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-6">
					<svg className="w-10 h-10 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</div>
				<h1 className="text-2xl font-bold text-[#1F2937] mb-2">Оплата не прошла</h1>
				<p className="text-[#6B7280] mb-2">{message || "Произошла ошибка при оплате."}</p>
				<p className="text-[#6B7280] mb-8">Бронь отменена. Вы можете попробовать снова.</p>
				<div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
					<Link to="/catalog" className="bg-[#6D28D9] text-white font-semibold px-8 py-3.5 rounded-xl shadow-btn hover:bg-[#7C3AED] w-full text-center">
						Попробовать снова
					</Link>
					<Link to="/" className="border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl font-semibold hover:bg-[#F5F3FF] transition-colors py-3">
						На главную
					</Link>
				</div>
			</div>
		</div>
	);
}

export default PaymentResult;