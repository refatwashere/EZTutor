const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'data', 'app.db');
const isMemory = dbPath === ':memory:';

let dbPromise;

async function getDb() {
  if (!dbPromise) {
    dbPromise = initSqlJs().then((SQL) => {
      let db;
      if (!isMemory && fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
      } else {
        db = new SQL.Database();
      }
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS recents (
          id INTEGER PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      persist(db);
      return db;
    });
  }
  return dbPromise;
}

function persist(db) {
  if (isMemory) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function run(sql, params = []) {
  const db = await getDb();
  db.run(sql, params);
  persist(db);
}

async function all(sql, params = []) {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0];
}

module.exports = {
  run,
  all,
  get,
};
