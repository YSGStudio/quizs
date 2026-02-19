# 현재 데이터 형식 (DB 스키마)

실제 DB는 없고, **localStorage**(프론트) / **메모리 객체**(백엔드)에 아래 구조로 저장됩니다.

---

## 1. 저장소 구성 (3개)

| 저장소 | localStorage 키 (프론트) | 설명 |
|--------|--------------------------|------|
| 방 목록 | `askanswer_rooms` | 교사가 만든 방 목록 |
| 방별 문제 | `askanswer_roomQuestionsByCode` | 방 코드별 문제(질문) + 답변 |
| 방별 참여도 | `askanswer_participationByRoomCode` | 방 코드별 학생 참여도 점수 |

---

## 2. `rooms` (방 목록)

**타입:** `Array`

**한 요소(방) 형식:**

```json
{
  "id": "1739123456789",
  "name": "방 이름",
  "code": "ABC123"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 ID (예: `Date.now().toString()`) |
| `name` | string | 방 이름 (교사가 입력) |
| `code` | string | 6자리 입장 코드 (영문+숫자) |

---

## 3. `roomQuestionsByCode` (방별 문제)

**타입:** `Object` — 키는 **방 코드(roomCode)**, 값은 **해당 방의 문제 배열**

```json
{
  "ABC123": [
    {
      "id": "1739123456790",
      "content": "문제 내용 텍스트",
      "studentName": "홍길동",
      "completionScore": 0,
      "answerCount": 0,
      "answers": [],
      "completionRatings": []
    }
  ]
}
```

### 문제(question) 한 개

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 문제 고유 ID |
| `content` | string | 문제 내용 |
| `studentName` | string | 출제한 학생 이름 |
| `completionScore` | number | (레거시) 완성도 점수, 표시는 `completionRatings` 합으로 계산 |
| `answerCount` | number | 답변 개수 (보통 `answers.length`) |
| `answers` | Array | 답변 목록 (아래 참고) |
| `completionRatings` | Array | 완성도 별점(1~3) 목록 (아래 참고) |

### `answers[]` — 답변 한 개

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 답변 고유 ID |
| `studentName` | string | 답변한 학생 이름 |
| `content` | string | 답변 내용 |
| `givenScore` | number \| null | 출제자가 부여한 점수 (1~5), 없으면 null |

### `completionRatings[]` — 완성도 평가 한 건

| 필드 | 타입 | 설명 |
|------|------|------|
| `raterName` | string | 평가한 사람(학생) 이름 |
| `score` | number | 1, 2, 3 중 하나 |

---

## 4. `participationByRoomCode` (방별 참여도)

**타입:** `Object` — 키는 **방 코드**, 값은 **학생별 참여도 점수 객체**

```json
{
  "ABC123": {
    "홍길동": 8,
    "김영희": 5
  }
}
```

- **1단계 키:** 방 코드 (roomCode)
- **2단계 키:** 학생 이름 (studentName)
- **값:** 숫자 (답변에 부여받은 점수들의 합)

---

## 5. 요약 (한눈에)

```
rooms                          → [ { id, name, code }, ... ]

roomQuestionsByCode            → { [roomCode]: [ question, ... ] }
  question                     → { id, content, studentName, completionScore, answerCount, answers, completionRatings }
  question.answers[]           → { id, studentName, content, givenScore? }
  question.completionRatings[] → { raterName, score }

participationByRoomCode        → { [roomCode]: { [studentName]: number } }
```

현재는 DB가 아니라 **localStorage(프론트)** / **메모리(백엔드)** 에 위 형식으로만 저장됩니다.
