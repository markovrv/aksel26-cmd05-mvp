import React from "react";

function Toast({ message, type = "success", onClose }) {
	const borderColor =
		{
			success: "border-l-success",
			error: "border-l-error",
			warning: "border-l-warning",
		}[type] || "";

	const icon =
		{
			success: (
				<svg
					className="w-5 h-5 text-success"
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
			),
			error: (
				<svg
					className="w-5 h-5 text-error"
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
			),
			warning: (
				<svg
					className="w-5 h-5 text-warning"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			),
		}[type] || null;

	return (
		<div className={`toast ${borderColor}`}>
			{icon}
			<span className="flex-1">{message}</span>
			<button onClick={onClose} className="hover:opacity-80 transition-opacity">
				<svg
					className="w-4 h-4 text-gray-400"
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
			</button>
		</div>
	);
}

export default Toast;
