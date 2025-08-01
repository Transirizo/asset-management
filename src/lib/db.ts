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
    imageUrls TEXT,
    status TEXT,
    storagePlace TEXT,
    owner TEXT
  )
`);

// 迁移现有数据：如果存在 imageUrl 列，则迁移到 imageUrls
try {
  // 检查是否存在 imageUrl 列
  const columns = db.prepare("PRAGMA table_info(assets)").all() as any[];
  const hasImageUrl = columns.some(col => col.name === 'imageUrl');
  const hasImageUrls = columns.some(col => col.name === 'imageUrls');
  
  if (hasImageUrl && !hasImageUrls) {
    // 添加新列
    db.exec('ALTER TABLE assets ADD COLUMN imageUrls TEXT');
    
    // 迁移数据：将单个 imageUrl 转换为数组格式
    const assets = db.prepare('SELECT id, imageUrl FROM assets WHERE imageUrl IS NOT NULL AND imageUrl != ""').all();
    const updateStmt = db.prepare('UPDATE assets SET imageUrls = ? WHERE id = ?');
    
    for (const asset of assets) {
      const imageUrls = JSON.stringify([asset.imageUrl]);
      updateStmt.run(imageUrls, asset.id);
    }
    
    console.log(`Migrated ${assets.length} assets from imageUrl to imageUrls`);
  } else if (!hasImageUrls) {
    // 如果没有任何图片列，添加 imageUrls 列
    db.exec('ALTER TABLE assets ADD COLUMN imageUrls TEXT');
  }
} catch (error) {
  console.error('Migration error:', error);
}