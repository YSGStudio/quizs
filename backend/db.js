/**
 * PostgreSQL 저장소 (DATABASE_URL 있을 때만 사용, 없으면 null 반환)
 * 테이블: app_data (key TEXT PRIMARY KEY, value JSONB)
 * 키: 'store' → 값: { rooms, roomQuestionsByCode, participationByRoomCode }
 */
import pg from 'pg'

const { Pool } = pg

let pool = null

function getPool() {
  if (!process.env.DATABASE_URL) return null
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  return pool
}

export async function initDb() {
  const p = getPool()
  if (!p) return false
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL DEFAULT '{}'
      )
    `)
    return true
  } catch (e) {
    console.error('DB init error:', e.message)
    return false
  }
}

const STORE_KEY = 'store'

const defaultStore = {
  rooms: [],
  roomQuestionsByCode: {},
  participationByRoomCode: {}
}

export async function loadStore() {
  const p = getPool()
  if (!p) return defaultStore
  try {
    const r = await p.query('SELECT value FROM app_data WHERE key = $1', [STORE_KEY])
    if (r.rows.length === 0) return defaultStore
    return r.rows[0].value
  } catch (e) {
    console.error('DB load error:', e.message)
    return defaultStore
  }
}

export async function saveStore(store) {
  const p = getPool()
  if (!p) return
  try {
    await p.query(
      `INSERT INTO app_data (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2`,
      [STORE_KEY, JSON.stringify(store)]
    )
  } catch (e) {
    console.error('DB save error:', e.message)
  }
}

export function useDb() {
  return !!process.env.DATABASE_URL
}
