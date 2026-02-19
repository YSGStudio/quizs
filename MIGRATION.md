# Railway 데이터 마이그레이션

기존 데이터(localStorage 또는 JSON 파일)를 Railway PostgreSQL로 옮기는 방법입니다.

---

## 방법 1: API로 올리기 (권장)

백엔드가 `/api/data` 로 전체 데이터를 받아서 DB에 저장하므로, **JSON을 POST**하면 됩니다.

### 1-1. 브라우저 localStorage에서 내보내기

1. **배포된 사이트**(또는 로컬)에서 데이터가 있는 상태로 접속
2. **개발자 도구** (F12) → **Console** 탭
3. 아래 코드 붙여넣고 실행 → `askanswer-export.json` 이 다운로드됨

```javascript
(function () {
  const rooms = JSON.parse(localStorage.getItem('askanswer_rooms') || '[]')
  const roomQuestionsByCode = JSON.parse(localStorage.getItem('askanswer_roomQuestionsByCode') || '{}')
  const participationByRoomCode = JSON.parse(localStorage.getItem('askanswer_participationByRoomCode') || '{}')
  const data = { rooms, roomQuestionsByCode, participationByRoomCode }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'askanswer-export.json'
  a.click()
  URL.revokeObjectURL(a.href)
  console.log('Exported:', Object.keys(data))
})()
```

### 1-2. Railway API로 데이터 넣기

**curl 사용 (터미널):**

```bash
# YOUR_RAILWAY_URL 을 실제 백엔드 주소로 바꾸세요 (예: https://quizs-api.up.railway.app)
curl -X POST "https://YOUR_RAILWAY_URL/api/data" \
  -H "Content-Type: application/json" \
  -d @askanswer-export.json
```

**PowerShell (Windows):**

```powershell
$body = Get-Content -Path "askanswer-export.json" -Raw
Invoke-RestMethod -Uri "https://YOUR_RAILWAY_URL/api/data" -Method Post -Body $body -ContentType "application/json"
```

성공하면 응답으로 저장된 전체 데이터가 JSON으로 옵니다. 이때 Railway PostgreSQL의 `app_data` 테이블에도 자동으로 반영됩니다.

---

## 방법 2: Node 스크립트로 마이그레이션

JSON 파일과 Railway URL을 인자로 주고 POST 하는 스크립트입니다.

**실행 예:**

```bash
cd backend
node scripts/migrate-to-railway.js ./askanswer-export.json https://YOUR_RAILWAY_URL
```

`backend/scripts/migrate-to-railway.js` 파일이 있으면 위처럼 실행하면 됩니다.

---

## 방법 3: SQL로 직접 넣기 (고급)

Railway PostgreSQL **Query** 탭에서 직접 `app_data` 행을 넣을 수도 있습니다.  
JSON을 이스케이프해서 넣어야 하므로, 보통은 **방법 1(curl)** 이 더 편합니다.

1. 먼저 테이블이 있어야 함 (백엔드가 한 번이라도 기동되면 생성됨):
   ```sql
   CREATE TABLE IF NOT EXISTS app_data (
     key TEXT PRIMARY KEY,
     value JSONB NOT NULL DEFAULT '{}'
   );
   ```
2. 내보낸 JSON을 한 줄로 만든 뒤, 아래에서 `'...'` 자리에 넣기:
   ```sql
   INSERT INTO app_data (key, value) VALUES ('store', '{"rooms":[],"roomQuestionsByCode":{},"participationByRoomCode":{}}'::jsonb)
   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
   ```
   - `'...'` 부분을 실제 내보낸 JSON 문자열로 바꿈 (작은따옴표는 `''` 로 이스케이프)

---

## 요약

| 방법 | 언제 쓰면 좋은지 |
|------|------------------|
| **1. API (curl)** | localStorage에서 내보낸 JSON을 Railway로 올릴 때 (가장 간단) |
| **2. Node 스크립트** | 같은 작업을 스크립트로 자동화하고 싶을 때 |
| **3. SQL** | API 없이 DB만 직접 다루고 싶을 때 |
