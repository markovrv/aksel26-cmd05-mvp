import React from "react";

function SlotPicker({ slots, selectedSlot, onSelect, maxParticipants }) {
	if (!slots || slots.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				<svg
					className="w-12 h-12 mx-auto mb-3 text-gray-300"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<p>Нет доступных слотов</p>
			</div>
		);
	}

	// Группируем слоты по датам
	const groupedSlots = slots.reduce((acc, slot) => {
		const date = slot.start_datetime.split(" ")[0];
		if (!acc[date]) acc[date] = [];
		acc[date].push(slot);
		return acc;
	}, {});

	const formatDate = (dateStr) => {
		const date = new Date(dateStr);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (date.toDateString() === today.toDateString()) return "Сегодня";
		if (date.toDateString() === tomorrow.toDateString()) return "Завтра";

		return date.toLocaleDateString("ru-RU", {
			weekday: "short",
			day: "numeric",
			month: "short",
		});
	};

	const formatTime = (datetime) => {
		const time = datetime.split(" ")[1];
		return time.slice(0, 5);
	};

	return (
		<div className="space-y-4">
			{Object.entries(groupedSlots).map(([date, daySlots]) => (
				<div key={date}>
					<h4 className="font-medium text-gray-700 mb-2 text-sm">
						{formatDate(date)}
					</h4>
					<div className="grid grid-cols-2 gap-2">
						{daySlots.map((slot) => {
							const isAvailable = slot.available_slots > 0;
							const isSelected = selectedSlot?.id === slot.id;
							const isDisabled =
								!isAvailable || slot.available_slots < maxParticipants;

							return (
								<button
									key={slot.id}
									onClick={() => isAvailable && !isDisabled && onSelect(slot)}
									disabled={isDisabled}
									className={`
                    p-3 rounded-xl border text-left transition-all
                    ${
											isSelected
												? "border-primary bg-blue-50 ring-2 ring-primary"
												: isAvailable && !isDisabled
													? "border-gray-200 hover:border-primary hover:bg-blue-50 cursor-pointer"
													: "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
										}
                  `}
								>
									<div className="font-medium text-gray-900">
										{formatTime(slot.start_datetime)}
									</div>
									<div className="text-sm text-gray-500">
										{isAvailable ? (
											<>
												{slot.available_slots}{" "}
												{slot.available_slots === 1
													? "место"
													: slot.available_slots < 5
														? "места"
														: "мест"}
											</>
										) : (
											<span className="text-red-500">Нет мест</span>
										)}
									</div>
									<div className="text-sm font-medium text-primary mt-1">
										{slot.price_per_person.toLocaleString()} ₽
									</div>
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}

export default SlotPicker;
