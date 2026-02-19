/**
 * JSON 파일 데이터를 Railway API로 마이그레이션
 * 사용: node scripts/migrate-to-railway.js <json파일경로> <Railway API URL>
 * 예: node scripts/migrate-to-railway.js ./askanswer-export.json https://xxx.up.railway.app
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const jsonPath = process.argv[2]
const baseUrl = process.argv[3]?.replace(/\/$/, '')

if (!jsonPath || !baseUrl) {
  console.error('Usage: node scripts/migrate-to-railway.js <json파일경로> <Railway API URL>')
  console.error('Example: node scripts/migrate-to-railway.js ./askanswer-export.json https://xxx.up.railway.app')
  process.exit(1)
}

const url = `${baseUrl}/api/data`

let data
try {
  const raw = readFileSync(join(process.cwd(), jsonPath), 'utf8')
  data = JSON.parse(raw)
} catch (e) {
  console.error('JSON 파일 읽기 실패:', e.message)
  process.exit(1)
}

if (!data.rooms || !data.roomQuestionsByCode || !data.participationByRoomCode) {
  console.error('JSON 형식: { rooms, roomQuestionsByCode, participationByRoomCode } 필요')
  process.exit(1)
}

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  }
  const result = await res.json()
  console.log('마이그레이션 완료.')
  console.log('  rooms:', result.rooms?.length ?? 0, '개')
  console.log('  roomQuestionsByCode 키:', Object.keys(result.roomQuestionsByCode || {}).length, '개')
  console.log('  participationByRoomCode 키:', Object.keys(result.participationByRoomCode || {}).length, '개')
} catch (e) {
  console.error('요청 실패:', e.message)
  process.exit(1)
}
