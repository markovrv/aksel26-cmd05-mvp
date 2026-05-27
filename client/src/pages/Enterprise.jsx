import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEnterprise, getExcursions } from "../api";
import ExcursionCard from "../components/ExcursionCard";

function Enterprise() {
	const { id } = useParams();
	const [enterprise, setEnterprise] = useState(null);
	const [excursions, setExcursions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, [id]);

	const loadData = async () => {
		try {
			const entData = await getEnterprise(id);
			setEnterprise(entData);

			const excData = await getExcursions({ enterprise_id: id });
			setExcursions(excData);
		} catch (err) {
			console.error("Ошибка загрузки:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen py-8 px-4 bg-[#F5F3FF]">
				<div className="max-w-7xl mx-auto">
					<div className="h-64 skeleton rounded-2xl mb-8"></div>
					<div className="h-8 skeleton w-1/2 mb-4"></div>
					<div className="h-4 skeleton w-3/4 mb-8"></div>
					<div className="grid md:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-64 skeleton rounded-2xl"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!enterprise) {
		return (
			<div className="min-h-screen flex items-center justify-center py-8 px-4 bg-[#F5F3FF]">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-[#1F2937] mb-2">
						Предприятие не найдено
					</h2>
					<Link to="/catalog" className="text-[#6D28D9] hover:underline">
						Вернуться в каталог
					</Link>
				</div>
			</div>
		);
	}

	const photos =
		enterprise.photos?.length > 0
			? enterprise.photos
			: ["https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800"];

	return (
		<div className="min-h-screen bg-[#F5F3FF]">
			{/* Галерея */}
			<div className="h-64 md:h-96 bg-[#E9D5FF] overflow-hidden">
				<img
					src={photos[0]}
					alt={enterprise.name}
					className="w-full h-full object-cover"
				/>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Информация */}
				<div className="bg-white rounded-2xl shadow-card border border-[#E9D5FF] p-6 mb-8">
					<div className="flex items-start justify-between gap-4 mb-4">
						<div>
							<h1 className="text-3xl font-bold text-[#1F2937] mb-2">
								{enterprise.name}
							</h1>
							<div className="flex items-center gap-4 text-[#6B7280]">
								<span>📍 {enterprise.city}</span>
								<span>📍 {enterprise.address}</span>
							</div>
						</div>
						<div className="flex items-center gap-1 bg-[#F5F3FF] px-4 py-2 rounded-full border border-[#E9D5FF]">
							<span className="text-[#EC4899] text-xl">★</span>
							<span className="font-bold text-lg text-[#1F2937]">
								{enterprise.average_rating?.toFixed(1) || "0.0"}
							</span>
						</div>
					</div>

					<p className="text-[#1F2937] opacity-80 leading-relaxed mb-6">
						{enterprise.description}
					</p>

					<div className="flex flex-wrap gap-4">
						<div className="bg-[#F5F3FF] rounded-xl px-4 py-2 border border-[#E9D5FF]">
							<span className="text-sm text-[#6B7280]">Контакты</span>
							<p className="font-medium text-[#1F2937]">{enterprise.contacts}</p>
						</div>
					</div>
				</div>

				{/* Экскурсии */}
				<div>
					<h2 className="text-2xl font-bold text-[#1F2937] mb-6">
						Экскурсии предприятия
					</h2>

					{excursions.length === 0 ? (
						<div className="text-center py-12 text-[#6B7280] bg-white rounded-2xl border border-[#E9D5FF] shadow-card">
							<p>На данный момент экскурсии не проводятся</p>
						</div>
					) : (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{excursions.map((excursion) => (
								<ExcursionCard key={excursion.id} excursion={excursion} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Enterprise;