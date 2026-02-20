import express from 'express'
import cors from 'cors'
import { initDb, loadStore, saveStore, useDb } from './db.js'

const app = express()
app.use(cors({
  origin: 'https://quizs-production.up.railway.app',
  credentials: true
}))
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '1mb' }))

// DB 사용 시 DB에서 로드, 아니면 메모리
let store = {
  rooms: [],
  roomQuestionsByCode: {},
  participationByRoomCode: {}
}

async function init() {
  if (useDb()) {
    const ok = await initDb()
    if (ok) {
      store = await loadStore()
      console.log('Database connected, store loaded.')
    } else {
      console.log('Database init failed, using memory.')
    }
  } else {
    console.log('No DATABASE_URL, using memory store.')
  }
}

// 전체 데이터 조회
app.get('/api/data', (req, res) => {
  res.json(store)
})

// 전체 데이터 저장 (프론트에서 덮어쓰기)
app.post('/api/data', async (req, res) => {
  const { rooms, roomQuestionsByCode, participationByRoomCode } = req.body || {}
  if (rooms != null) store.rooms = rooms
  if (roomQuestionsByCode != null) store.roomQuestionsByCode = roomQuestionsByCode
  if (participationByRoomCode != null) store.participationByRoomCode = participationByRoomCode
  if (useDb()) await saveStore(store)
  res.json(store)
})

// 헬스체크 (Railway 등에서 사용)
app.get('/health', (req, res) => {
  res.json({ ok: true, db: useDb() })
})

init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
