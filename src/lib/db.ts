// /lib/db.ts
import Database from "better-sqlite3";

// 使用 better-sqlite3 库
export const db = new Database("assets.db");

// 初始化数据库表结构
// 在应用启动时执行一次即可
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purchaseDate TEXT,
    location TEXT,
    price REAL,
    invoiceType TEXT,
    taxRate REAL,
    modelSpec TEXT,
    category TEXT,
    lastCheckDate TEXT,
    imageUrl TEXT,
    status TEXT,
    storagePlace TEXT,
    owner TEXT
  )
`);