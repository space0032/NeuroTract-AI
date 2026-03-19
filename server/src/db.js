import initSqlJs from 'sql.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'neurotract.db')

let db

export async function getDb() {
  if (!db) {
    const dataDir = path.dirname(DB_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const SQL = await initSqlJs()

    // Load existing DB or create new
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH)
      db = new SQL.Database(fileBuffer)
    } else {
      db = new SQL.Database()
    }

    initTables(db)
    saveDb()
  }
  return db
}

function initTables(database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      openness REAL NOT NULL,
      conscientiousness REAL NOT NULL,
      extraversion REAL NOT NULL,
      agreeableness REAL NOT NULL,
      neuroticism REAL NOT NULL,
      risk_score REAL NOT NULL,
      persona TEXT NOT NULL,
      answers TEXT NOT NULL
    )
  `)
  database.run(`
    CREATE TABLE IF NOT EXISTS detections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id TEXT,
      detected_at TEXT DEFAULT (datetime('now')),
      object_class TEXT NOT NULL,
      confidence REAL NOT NULL,
      plate_text TEXT,
      bbox_x REAL,
      bbox_y REAL,
      bbox_w REAL,
      bbox_h REAL
    )
  `)
  database.run(`
    CREATE TABLE IF NOT EXISTS hazard_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id TEXT NOT NULL,
      timestamp_ms INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      description TEXT,
      detected_objects TEXT
    )
  `)
}

export function saveDb() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(DB_PATH, buffer)
  }
}

export default getDb
