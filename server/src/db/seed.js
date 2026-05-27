import { getDb, dbRun, dbGet, dbAll, dbExec } from "./db.js";
import { initDb } from "./init-db.js";
import bcrypt from "bcryptjs";

async function seed() {
	await initDb();
	const db = getDb();

	// Проверяем, есть ли уже данные
	const existingUsers = await dbGet("SELECT COUNT(*) as count FROM users");
	if (existingUsers.count > 0) {
		console.log("Данные уже существуют, пропускаем seed");
		return;
	}

	console.log("Заполняем базу данных тестовыми данными...");

	// Создаём предприятия
	const enterprises = [
		{
			name: "Кировский машиностроительный завод",
			description:
				"Ведущее предприятие машиностроительной отрасли России. Основан в 1945 году. Производим промышленное оборудование, запчасти для сельхозтехники и специальную технику.",
			city: "Киров",
			address: "ул. Производственная, 1",
			contacts: "+7 (8332) 12-34-56, info@kirov-mash.ru",
			social_links: JSON.stringify(["https://vk.com/kirov_mash"]),
			certificates: JSON.stringify(["https://example.com/cert1.pdf"]),
			photos: JSON.stringify([
				"https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800",
			]),
			is_active: 1,
			average_rating: 4.7,
		},
		{
			name: "Кировская кондитерская фабрика",
			description:
				"Крупнейший производитель кондитерских изделий в регионе. Более 100 лет радуем жителей качественными сладостями. Традиционные рецепты и современные технологии.",
			city: "Киров",
			address: "ул. Сладкая, 15",
			contacts: "+7 (8332) 65-43-21, sweets@kirov-sweet.ru",
			social_links: JSON.stringify(["https://vk.com/kirov_sweet"]),
			certificates: JSON.stringify(["https://example.com/cert2.pdf"]),
			photos: JSON.stringify([
				"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800",
			]),
			is_active: 1,
			average_rating: 4.9,
		},
		{
			name: "Текстильная мануфактура «Вятка»",
			description:
				"Старейшее текстильное предприятие региона. Производим качественные ткани, постельное бельё и домашний текстиль из натуральных материалов.",
			city: "Киров",
			address: "ул. Ткацкая, 8",
			contacts: "+7 (8332) 98-76-54, info@vyatka-textile.ru",
			social_links: JSON.stringify(["https://vk.com/vyatka_textile"]),
			certificates: JSON.stringify(["https://example.com/cert3.pdf"]),
			photos: JSON.stringify([
				"https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
			]),
			is_active: 1,
			average_rating: 4.5,
		},
	];

	for (const e of enterprises) {
		await dbRun(
			`INSERT INTO enterprises (name, description, city, address, contacts, social_links, certificates, photos, is_active, average_rating)
	     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				e.name,
				e.description,
				e.city,
				e.address,
				e.contacts,
				e.social_links,
				e.certificates,
				e.photos,
				e.is_active,
				e.average_rating,
			],
		);
	}

	// Создаём экскурсии
	const excursions = [
		{
			enterprise_id: 1,
			title: "Путь от заготовки до готового изделия",
			description:
				"Увлекательное путешествие по цехам завода. Вы увидите процесс обработки металла, работу роботизированных линий и сборку готовой продукции.",
			duration_minutes: 120,
			default_price: 1500,
			max_participants: 15,
			min_participants: 5,
			photo_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
		},
		{
			enterprise_id: 1,
			title: "История советской индустрии",
			description:
				"Экскурсия по музею завода с рассказом о вкладе предприятия в развитие страны. Уникальные экспонаты и архивные материалы.",
			duration_minutes: 90,
			default_price: 1200,
			max_participants: 20,
			min_participants: 5,
			photo_url: "https://images.unsplash.com/photo-1601369820466-67de86f3bdf6?w=800",
		},
		{
			enterprise_id: 2,
			title: "Сладкое королевство",
			description:
				"Приглашаем в мир сладостей! Вы увидите, как создаются конфеты, печенье и шоколад. Дегустация свежеприготовленных лакомств включена.",
			duration_minutes: 90,
			default_price: 1800,
			max_participants: 12,
			min_participants: 3,
			photo_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800",
		},
		{
			enterprise_id: 2,
			title: "Тайны шоколатье",
			description:
				"Мастер-класс по созданию шоколадных фигурок. Каждый участник создаст свой шоколадный шедевр и заберет его домой.",
			duration_minutes: 150,
			default_price: 2500,
			max_participants: 10,
			min_participants: 5,
			photo_url: "https://images.unsplash.com/photo-1606231031479-5f64baf0b91d?w=800",
		},
		{
			enterprise_id: 3,
			title: "От нити до шедевра",
			description:
				"Знакомство с процессом производства тканей: прядение, ткачество, окрашивание. Вы увидите современное оборудование и старинные станки.",
			duration_minutes: 100,
			default_price: 1000,
			max_participants: 15,
			min_participants: 5,
			photo_url: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
		},
		{
			enterprise_id: 3,
			title: "Интерьерный текстиль",
			description:
				"Экскурсия по цехам пошива домашнего текстиля. Узнаете о выборе материалов, технологиях и трендах дизайна.",
			duration_minutes: 80,
			default_price: 900,
			max_participants: 12,
			min_participants: 4,
			photo_url: "https://images.unsplash.com/photo-1590650046871-92c887180603?w=800",
		},
	];

	for (const e of excursions) {
		await dbRun(
			`INSERT INTO excursions (enterprise_id, title, description, duration_minutes, default_price, max_participants, min_participants, photo_url, is_active)
	     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
			[
				e.enterprise_id,
				e.title,
				e.description,
				e.duration_minutes,
				e.default_price,
				e.max_participants,
				e.min_participants,
				e.photo_url,
			],
		);
	}

	// Создаём слоты (на ближайшие 30 дней)
	const today = new Date();

	for (let excId = 1; excId <= 6; excId++) {
		for (let dayOffset = 1; dayOffset <= 30; dayOffset += 3) {
			const date = new Date(today);
			date.setDate(date.getDate() + dayOffset);

			const morningStart = new Date(date);
			morningStart.setHours(10, 0, 0, 0);
			const morningEnd = new Date(date);
			morningEnd.setHours(12, 0, 0, 0);

			const basePrice = await dbGet(
				"SELECT default_price FROM excursions WHERE id = ?",
				[excId],
			);
			const maxParticipants = await dbGet(
				"SELECT max_participants FROM excursions WHERE id = ?",
				[excId],
			);

			const availableSlots =
				Math.random() > 0.2 ? maxParticipants.max_participants : 0;

			await dbRun(
				`INSERT INTO slots (excursion_id, start_datetime, end_datetime, available_slots, price_per_person, is_cancelled)
	       VALUES (?, ?, ?, ?, ?, 0)`,
				[
					excId,
					morningStart.toISOString().slice(0, 19).replace("T", " "),
					morningEnd.toISOString().slice(0, 19).replace("T", " "),
					availableSlots,
					basePrice.default_price,
				],
			);

			const afternoonStart = new Date(date);
			afternoonStart.setHours(14, 0, 0, 0);
			const afternoonEnd = new Date(date);
			afternoonEnd.setHours(16, 0, 0, 0);

			await dbRun(
				`INSERT INTO slots (excursion_id, start_datetime, end_datetime, available_slots, price_per_person, is_cancelled)
	       VALUES (?, ?, ?, ?, ?, 0)`,
				[
					excId,
					afternoonStart.toISOString().slice(0, 19).replace("T", " "),
					afternoonEnd.toISOString().slice(0, 19).replace("T", " "),
					maxParticipants.max_participants,
					basePrice.default_price * 1.1,
				],
			);
		}
	}

	// Создаём сувениры
	const souvenirs = [
		{
			enterprise_id: 1,
			name: 'Магнит "КМЗ"',
			description: "Металлический магнит с логотипом завода",
			base_price: 150,
			stock_quantity: 100,
			photo_url:
				"https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
			is_available: 1,
			allows_personalization: 0,
		},
		{
			enterprise_id: 1,
			name: "Термос с гравировкой",
			description:
				"Качественный термос 500мл с возможностью нанесения логотипа",
			base_price: 890,
			stock_quantity: 25,
			photo_url:
				"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["name","logo"]',
		},
		{
			enterprise_id: 1,
			name: "Бейсболка рабочая",
			description: "Фирменная бейсболка с логотипом завода",
			base_price: 450,
			stock_quantity: 40,
			photo_url:
				"https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["name"]',
		},
		{
			enterprise_id: 1,
			name: "Набор инструментов",
			description: "Компактный набор инструментов в кейсе с логотипом",
			base_price: 1200,
			stock_quantity: 15,
			photo_url:
				"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["logo"]',
		},
		{
			enterprise_id: 2,
			name: 'Коробка конфет "Вятские"',
			description: "Подарочная коробка с лучшими конфетами фабрики",
			base_price: 650,
			stock_quantity: 50,
			photo_url:
				"https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400",
			is_available: 1,
			allows_personalization: 0,
		},
		{
			enterprise_id: 2,
			name: "Шоколад ручной работы",
			description: "Авторский шоколад с начинками",
			base_price: 380,
			stock_quantity: 30,
			photo_url:
				"https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["name","message"]',
		},
		{
			enterprise_id: 2,
			name: "Подарочный набор",
			description: "Набор сладостей в красивой упаковке",
			base_price: 950,
			stock_quantity: 20,
			photo_url:
				"https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["name"]',
		},
		{
			enterprise_id: 2,
			name: "Кружка с шоколадом",
			description: "Керамическая кружка с шоколадной крошкой внутри",
			base_price: 520,
			stock_quantity: 35,
			photo_url:
				"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400",
			is_available: 1,
			allows_personalization: 0,
		},
		{
			enterprise_id: 3,
			name: "Плед фирменный",
			description: "Мягкий плед с логотипом мануфактуры",
			base_price: 2100,
			stock_quantity: 10,
			photo_url:
				"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["name"]',
		},
		{
			enterprise_id: 3,
			name: "Наволочка вышитая",
			description: "Декоративная наволочка с ручной вышивкой",
			base_price: 780,
			stock_quantity: 25,
			photo_url:
				"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["initials"]',
		},
		{
			enterprise_id: 3,
			name: "Сумка-шоппер",
			description: "Хлопковая сумка с принтом",
			base_price: 340,
			stock_quantity: 60,
			photo_url:
				"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["name","pattern"]',
		},
		{
			enterprise_id: 3,
			name: "Набор полотенец",
			description: "Подарочный набор махровых полотенец",
			base_price: 1200,
			stock_quantity: 20,
			photo_url:
				"https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400",
			is_available: 1,
			allows_personalization: 1,
			personalization_type: '["initials"]',
		},
	];

	for (const s of souvenirs) {
		await dbRun(
			`INSERT INTO souvenirs (enterprise_id, name, description, base_price, stock_quantity, photo_url, is_available, allows_personalization, personalization_type)
	     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				s.enterprise_id,
				s.name,
				s.description,
				s.base_price,
				s.stock_quantity,
				s.photo_url,
				s.is_available,
				s.allows_personalization,
				s.personalization_type,
			],
		);
	}

	// Создаём пользователей
	const passwordHash = bcrypt.hashSync("test123", 10);
	const adminPasswordHash = bcrypt.hashSync("admin123", 10);

	const users = [
		{
			email: "b2c@test.ru",
			password_hash: passwordHash,
			full_name: "Иван Петров",
			phone: "+79123456789",
			role: "b2c",
			enterprise_id: null,
			consent_to_pd: 1,
		},
		{
			email: "b2b@test.ru",
			password_hash: passwordHash,
			full_name: "Алексей Сидоров",
			phone: "+79234567890",
			role: "b2b_employee",
			enterprise_id: 1,
			consent_to_pd: 1,
		},
		{
			email: "admin@test.ru",
			password_hash: adminPasswordHash,
			full_name: "Администратор Системы",
			phone: "+79999999999",
			role: "admin",
			enterprise_id: null,
			consent_to_pd: 1,
		},
		{
			email: "ministry@test.ru",
			password_hash: passwordHash,
			full_name: "Министерство Промышленности",
			phone: "+79876543210",
			role: "ministry",
			enterprise_id: null,
			consent_to_pd: 1,
		},
		{
			email: "b2b2@test.ru",
			password_hash: passwordHash,
			full_name: "Мария Козлова",
			phone: "+79111222333",
			role: "b2b_employee",
			enterprise_id: 2,
			consent_to_pd: 1,
		},
	];

	for (const u of users) {
		await dbRun(
			`INSERT INTO users (email, password_hash, full_name, phone, role, enterprise_id, consent_to_pd)
	     VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				u.email,
				u.password_hash,
				u.full_name,
				u.phone,
				u.role,
				u.enterprise_id,
				u.consent_to_pd,
			],
		);
	}

	// Создаём бронирования для b2c@test.ru (user_id = 1)
	const bookings = [
		{
			user_id: 1,
			slot_id: 1,
			participants_count: 2,
			total_price: 3000,
			status: "completed",
			payment_id: "PAY-001",
		},
		{
			user_id: 1,
			slot_id: 15,
			participants_count: 3,
			total_price: 5400,
			status: "paid",
			payment_id: "PAY-002",
		},
		{
			user_id: 1,
			slot_id: 20,
			participants_count: 1,
			total_price: 1200,
			status: "cancelled",
			payment_id: null,
		},
	];

	for (const b of bookings) {
		await dbRun(
			`INSERT INTO bookings (user_id, slot_id, participants_count, total_price, status, payment_id)
	     VALUES (?, ?, ?, ?, ?, ?)`,
			[b.user_id, b.slot_id, b.participants_count, b.total_price, b.status, b.payment_id],
		);
	}

	// Создаём отзывы
	const reviews = [
		{
			user_id: 1,
			booking_id: 1,
			rating: 5,
			comment:
				"Превосходная экскурсия! Очень познавательно и интересно. Обязательно вернёмся!",
			is_moderated: 1,
		},
		{
			user_id: 1,
			booking_id: 2,
			rating: 4,
			comment:
				"Хорошая организация, но хотелось бы больше времени на дегустацию.",
			is_moderated: 1,
		},
	];

	for (const r of reviews) {
		await dbRun(
			`INSERT INTO reviews (user_id, booking_id, rating, comment, is_moderated)
	     VALUES (?, ?, ?, ?, ?)`,
			[r.user_id, r.booking_id, r.rating, r.comment, r.is_moderated],
		);
	}

	// Создаём уведомления
	const notifications = [
		{
			user_id: 1,
			type: "booking_confirmed",
			message: "Ваша бронь №1 подтверждена!",
			is_read: 1,
		},
		{
			user_id: 1,
			type: "review_ready",
			message: "Экскурсия завершена! Оставьте отзыв о посещении.",
			is_read: 0,
		},
		{
			user_id: 2,
			type: "booking_received",
			message: "Новая заявка на экскурсию!",
			is_read: 0,
		},
	];

	for (const n of notifications) {
		await dbRun(
			`INSERT INTO notifications (user_id, type, message, is_read)
	     VALUES (?, ?, ?, ?)`,
			[n.user_id, n.type, n.message, n.is_read],
		);
	}

	console.log("Данные успешно загружены!");
}

seed().catch((err) => {
	console.error("Ошибка при заполнении данных:", err);
	process.exit(1);
});
