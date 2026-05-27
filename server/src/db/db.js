import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём директорию data если её нет
const dataDir = path.join(__dirname, "../../../data");
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "base.db");
const db = new sqlite3.Database(dbPath);

// Включаем WAL и foreign keys
db.serialize(() => {
	db.run("PRAGMA journal_mode = WAL");
	db.run("PRAGMA foreign_keys = ON");
});

// Promise-обёртки для sqlite3 (callback-based → async)
export function dbRun(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (err) {
			if (err) return reject(err);
			resolve({ changes: this.changes, lastInsertRowid: this.lastID });
		});
	});
}

export function dbGet(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) return reject(err);
			resolve(row);
		});
	});
}

export function dbAll(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) return reject(err);
			resolve(rows);
		});
	});
}

export function dbExec(sql) {
	return new Promise((resolve, reject) => {
		db.exec(sql, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

// Транзакция — ручной BEGIN / COMMIT / ROLLBACK
export async function transaction(fn) {
	await dbRun("BEGIN TRANSACTION");
	try {
		const result = await fn();
		await dbRun("COMMIT");
		return result;
	} catch (err) {
		await dbRun("ROLLBACK");
		throw err;
	}
}

export function getDb() {
	return db;
}

export { db, dbPath };
