import React from "react";

function SouvenirCard({
	souvenir,
	onAdd,
	onRemove,
	quantity = 0,
	showControls = true,
}) {
	const hasPersonalization =
		souvenir.allows_personalization === 1 ||
		souvenir.allows_personalization === true;
	const personalizationTypes = souvenir.personalization_type || [];

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-[rgba(30,58,95,0.08)] overflow-hidden">
			<div className="h-40 overflow-hidden bg-gray-100">
				{souvenir.photo_url ? (
					<img
						src={souvenir.photo_url}
						alt={souvenir.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-gray-400">
						<svg
							className="w-12 h-12"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
							/>
						</svg>
					</div>
				)}
			</div>
			<div className="p-4">
				<h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
					{souvenir.name}
				</h4>
				{souvenir.description && (
					<p className="text-gray-500 text-xs mb-2 line-clamp-2">
						{souvenir.description}
					</p>
				)}

				<div className="flex items-center justify-between mb-3">
					<span className="text-lg font-bold text-primary">
						{souvenir.base_price.toLocaleString()} ₽
					</span>
					{hasPersonalization && (
						<span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
							🖊️ Персонализация
						</span>
					)}
				</div>

				{showControls && (
					<div className="flex items-center gap-2">
						{quantity > 0 ? (
							<div className="flex items-center gap-2 w-full">
								<button
									onClick={() => onRemove(souvenir.id)}
									className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
								>
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
											d="M20 12H4"
										/>
									</svg>
								</button>
								<span className="flex-1 text-center font-medium">
									{quantity}
								</span>
								<button
									onClick={() => onAdd(souvenir)}
									className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
								>
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
											d="M12 4v16m8-8H4"
										/>
									</svg>
								</button>
							</div>
						) : (
							<button
								onClick={() => onAdd(souvenir)}
								className="w-full py-2 border border-primary text-primary rounded-xl hover:bg-blue-50 transition-colors font-medium"
							>
								Добавить
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default SouvenirCard;
