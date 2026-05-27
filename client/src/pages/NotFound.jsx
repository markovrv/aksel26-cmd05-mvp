import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center py-16 px-4 bg-[#F5F3FF]">
			<div className="text-center">
				<div className="text-8xl font-bold text-[#6D28D9] mb-4">404</div>
				<h1 className="text-2xl font-bold text-[#1F2937] mb-2">
					Страница не найдена
				</h1>
				<p className="text-[#6B7280] mb-8">
					Извините, запрашиваемая страница не существует или была перемещена.
				</p>
				<Link
					to="/"
					className="inline-block bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-semibold px-8 py-3.5 rounded-xl shadow-btn transition-all duration-200 active:scale-95"
				>
					На главную
				</Link>
			</div>
		</div>
	);
}

export default NotFound;