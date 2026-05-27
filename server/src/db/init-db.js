import { getDb, dbExec } from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
	const db = getDb();
	const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
	await dbExec(schema);

	// Миграции для существующих БД
	try {
		await dbExec("ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0");
	} catch (_e) {
		// колонка уже существует — игнорируем
	}

	console.log("База данных инициализирована");
	return db;
}

export { initDb };

// При прямом запуске (node src/db/init-db.js)
initDb().catch((err) => {
	console.error("Ошибка инициализации БД:", err);
	process.exit(1);
});
