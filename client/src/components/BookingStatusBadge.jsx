import React from "react";

function BookingStatusBadge({ status, size = "md" }) {
	const statusConfig = {
		pending: {
			label: "Ожидает оплаты",
			className: "badge-warning",
		},
		paid: {
			label: "Оплачено",
			className: "badge-success",
		},
		confirmed: {
			label: "Подтверждено",
			className: "badge-success",
		},
		cancelled: {
			label: "Отменено",
			className: "badge-error",
		},
		completed: {
			label: "Завершено",
			className: "badge-info",
		},
	};

	const config = statusConfig[status] || statusConfig.pending;

	return <span className={`badge ${config.className}`}>{config.label}</span>;
}

export default BookingStatusBadge;
