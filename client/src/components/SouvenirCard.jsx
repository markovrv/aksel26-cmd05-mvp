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

	return (
		<div className="bg-white rounded-2xl border border-[#E9D5FF] shadow-card p-4">
			<div className="h-40 overflow-hidden bg-[#F5F3FF] rounded-xl mb-3">
				{souvenir.photo_url ? (
					<img
						src={souvenir.photo_url}
						alt={souvenir.name}
						className="w-full h-full object-contain"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-[#A855F7]">
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
			<div>
				<h4 className="font-semibold text-[#1F2937] text-sm mb-1 line-clamp-1">
					{souvenir.name}
				</h4>
				{souvenir.description && (
					<p className="text-[#6B7280] text-xs mb-2 line-clamp-2">
						{souvenir.description}
					</p>
				)}

				<div className="flex items-center justify-between mb-3">
					<span className="text-lg font-bold text-[#6D28D9]">
						{souvenir.base_price.toLocaleString()} ₽
					</span>
					{hasPersonalization && (
						<span className="text-xs bg-[#E9D5FF] text-[#6D28D9] px-2 py-1 rounded-full">
							🖊️ Персонализация
						</span>
					)}
				</div>

				{showControls && (
					<div className="flex items-center gap-2">
						{quantity > 0 ? (
							<div className="flex items-center gap-3 w-full">
								<button
									onClick={() => onRemove(souvenir.id)}
									className="w-8 h-8 rounded-full border border-[#D1D5DB] text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9] font-bold flex items-center justify-center transition-colors"
								>
									<svg
										className="w-4 h-4"
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
								<span className="text-[#1F2937] font-semibold w-4 text-center flex-1">
									{quantity}
								</span>
								<button
									onClick={() => onAdd(souvenir)}
									className="w-8 h-8 rounded-full bg-[#6D28D9] text-white font-bold flex items-center justify-center hover:bg-[#7C3AED] transition-colors"
								>
									<svg
										className="w-4 h-4"
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
								className="w-full py-2 border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl hover:bg-[#F5F3FF] transition-colors font-medium"
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