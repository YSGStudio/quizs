import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// 프론트와 동일한 데이터 구조 (메모리 저장, 재시작 시 초기화됨)
let store = {
  rooms: [],
  roomQuestionsByCode: {},
  participationByRoomCode: {}
}

// 전체 데이터 조회
app.get('/api/data', (req, res) => {
  res.json(store)
})

// 전체 데이터 저장 (프론트에서 덮어쓰기)
app.post('/api/data', (req, res) => {
  const { rooms, roomQuestionsByCode, participationByRoomCode } = req.body || {}
  if (rooms != null) store.rooms = rooms
  if (roomQuestionsByCode != null) store.roomQuestionsByCode = roomQuestionsByCode
  if (participationByRoomCode != null) store.participationByRoomCode = participationByRoomCode
  res.json(store)
})

// 헬스체크 (Railway 등에서 사용)
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
