import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db/init-db.js";
import authRoutes from "./routes/auth.js";
import enterprisesRoutes from "./routes/enterprises.js";
import excursionsRoutes from "./routes/excursions.js";
import slotsRoutes from "./routes/slots.js";
import bookingsRoutes from "./routes/bookings.js";
import souvenirsRoutes from "./routes/souvenirs.js";
import souvenirOrdersRoutes from "./routes/souvenir_orders.js";
import reviewsRoutes from "./routes/reviews.js";
import paymentRoutes from "./routes/payment.js";
import notificationsRoutes from "./routes/notifications.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const publicPath = path.join(process.cwd(), "public");

// Раздача статических файлов
app.use(express.static(publicPath));

// API маршруты
app.use("/api/auth", authRoutes);
app.use("/api/enterprises", enterprisesRoutes);
app.use("/api/excursions", excursionsRoutes);
app.use("/api/slots", slotsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/souvenirs", souvenirsRoutes);
app.use("/api/souvenir-orders", souvenirOrdersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/analytics", analyticsRoutes);

// SPA fallback - отдаём index.html для всех не-API маршрутов
app.get("*", (_req, res) => {
	res.sendFile(path.join(publicPath, "index.html"));
});

// Обработка ошибок
app.use((err, _req, res, _next) => {
	console.error("Ошибка сервера:", err);
	res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// Инициализация БД и запуск
initDb()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Сервер запущен на порту ${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Ошибка инициализации базы данных:", err);
		process.exit(1);
	});
