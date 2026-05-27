import React from "react";

function BookingStatusBadge({ status, size = "md" }) {
	const statusConfig = {
		pending: {
			label: "Ожидает оплаты",
			className: "bg-[#FEF3C7] text-[#D97706]",
		},
		paid: {
			label: "Оплачено",
			className: "bg-[#EDE9FE] text-[#6D28D9]",
		},
		confirmed: {
			label: "Подтверждено",
			className: "bg-[#EDE9FE] text-[#6D28D9]",
		},
		cancelled: {
			label: "Отменено",
			className: "bg-[#FEE2E2] text-[#DC2626]",
		},
		completed: {
			label: "Завершено",
			className: "bg-[#DCFCE7] text-[#16A34A]",
		},
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span className={`${config.className} text-xs font-semibold px-3 py-1 rounded-full`}>
			{config.label}
		</span>
	);
}

export default BookingStatusBadge;