import React from "react";

function Toast({ message, type = "success", onClose }) {
	const borderColor = type === "success" ? "#22C55E" : type === "error" ? "#DC2626" : "#F59E0B";
	const iconBg = type === "success" ? "#22C55E" : type === "error" ? "#DC2626" : "#F59E0B";
	const icon =
		type === "success" ? (
			<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
			</svg>
		) : type === "error" ? (
			<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
			</svg>
		) : (
			<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
			</svg>
		);

	return (
		<div
			className="fixed top-4 right-4 bg-white border rounded-2xl shadow-hover px-5 py-4 flex items-center gap-3 z-[9999] animate-[slideIn_0.3s_ease]"
			style={{ borderColor }}
		>
			<div
				className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
				style={{ backgroundColor: iconBg }}
			>
				{icon}
			</div>
			<p className="text-[#1F2937] font-medium text-sm flex-1">{message}</p>
			<button onClick={onClose} className="hover:opacity-80 transition-opacity">
				<svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	);
}

export default Toast;