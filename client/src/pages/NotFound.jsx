import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
	return (
		<div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
			<div className="text-center">
				<div className="text-8xl font-bold text-primary mb-4">404</div>
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Страница не найдена
				</h1>
				<p className="text-gray-500 mb-8">
					Извините, запрашиваемая страница не существует или была перемещена.
				</p>
				<Link
					to="/"
					className="inline-block px-8 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors"
				>
					На главную
				</Link>
			</div>
		</div>
	);
}

export default NotFound;
