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
			<div className="min-h-screen py-8 px-4">
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
			<div className="min-h-screen py-8 px-4 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Предприятие не найдено
					</h2>
					<Link to="/catalog" className="text-primary hover:underline">
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
		<div className="min-h-screen">
			{/* Галерея */}
			<div className="h-64 md:h-96 bg-gray-200 overflow-hidden">
				<img
					src={photos[0]}
					alt={enterprise.name}
					className="w-full h-full object-cover"
				/>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Информация */}
				<div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
					<div className="flex items-start justify-between gap-4 mb-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{enterprise.name}
							</h1>
							<div className="flex items-center gap-4 text-gray-500">
								<span>📍 {enterprise.city}</span>
								<span>📍 {enterprise.address}</span>
							</div>
						</div>
						<div className="flex items-center gap-1 bg-yellow-50 px-4 py-2 rounded-full">
							<span className="text-yellow-500 text-xl">★</span>
							<span className="font-bold text-lg">
								{enterprise.average_rating?.toFixed(1) || "0.0"}
							</span>
						</div>
					</div>

					<p className="text-gray-600 leading-relaxed mb-6">
						{enterprise.description}
					</p>

					<div className="flex flex-wrap gap-4">
						<div className="bg-gray-50 rounded-xl px-4 py-2">
							<span className="text-sm text-gray-500">Контакты</span>
							<p className="font-medium">{enterprise.contacts}</p>
						</div>
					</div>
				</div>

				{/* Экскурсии */}
				<div>
					<h2 className="text-2xl font-bold text-gray-900 mb-6">
						Экскурсии предприятия
					</h2>

					{excursions.length === 0 ? (
						<div className="text-center py-12 text-gray-500 bg-white rounded-2xl">
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
