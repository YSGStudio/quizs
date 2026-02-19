import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import TeacherPage from './pages/TeacherPage'
import RoomPage from './pages/RoomPage'
import StudentPage from './pages/StudentPage'
import './App.css'

const STORAGE_KEY_ROOMS = 'askanswer_rooms'
const STORAGE_KEY_QUESTIONS = 'askanswer_roomQuestionsByCode'
const STORAGE_KEY_PARTICIPATION = 'askanswer_participationByRoomCode'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

function loadFromStorage(key, fallback) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

async function fetchStore() {
  const res = await fetch(`${API_URL}/api/data`)
  if (!res.ok) throw new Error('API load failed')
  return res.json()
}

async function saveStoreToApi(store) {
  const res = await fetch(`${API_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store)
  })
  if (!res.ok) throw new Error('API save failed')
}

// 방 코드별 학생들이 만든 문제 목록 (같은 코드 = 같은 방 = 같은 데이터)
// 형식: { [roomCode]: [ { id, content, studentName }, ... ] }
function App() {
  const [screen, setScreen] = useState('login')
  const [apiReady, setApiReady] = useState(!API_URL)
  const [rooms, setRooms] = useState(() => (API_URL ? [] : loadFromStorage(STORAGE_KEY_ROOMS, [])))
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [studentRoomCode, setStudentRoomCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [roomQuestionsByCode, setRoomQuestionsByCode] = useState(() =>
    API_URL ? {} : loadFromStorage(STORAGE_KEY_QUESTIONS, {})
  )
  const [participationByRoomCode, setParticipationByRoomCode] = useState(() =>
    API_URL ? {} : loadFromStorage(STORAGE_KEY_PARTICIPATION, {})
  )

  // API 사용 시: 앱 로드 시 DB에서 데이터 불러오기
  useEffect(() => {
    if (!API_URL) return
    fetchStore()
      .then((data) => {
        setRooms(data.rooms ?? [])
        setRoomQuestionsByCode(data.roomQuestionsByCode ?? {})
        setParticipationByRoomCode(data.participationByRoomCode ?? {})
      })
      .catch((e) => console.error('API load error:', e))
      .finally(() => setApiReady(true))
  }, [])

  // localStorage 저장 (API 없을 때)
  useEffect(() => {
    if (API_URL) return
    saveToStorage(STORAGE_KEY_ROOMS, rooms)
  }, [rooms])

  useEffect(() => {
    if (API_URL) return
    saveToStorage(STORAGE_KEY_QUESTIONS, roomQuestionsByCode)
  }, [roomQuestionsByCode])

  useEffect(() => {
    if (API_URL) return
    saveToStorage(STORAGE_KEY_PARTICIPATION, participationByRoomCode)
  }, [participationByRoomCode])

  // API 사용 시: 데이터 변경될 때마다 DB에 저장
  useEffect(() => {
    if (!API_URL || !apiReady) return
    saveStoreToApi({ rooms, roomQuestionsByCode, participationByRoomCode }).catch((e) =>
      console.error('API save error:', e)
    )
  }, [API_URL, apiReady, rooms, roomQuestionsByCode, participationByRoomCode])

  const handleTeacherSuccess = () => {
    setScreen('teacher')
    setSelectedRoom(null)
  }

  const handleStudentSuccess = (roomCode, name) => {
    setStudentRoomCode(roomCode)
    setStudentName(name)
    setScreen('student')
  }

  const handleSelectRoom = (room) => {
    // API 미사용 시에만 localStorage 병합 (API 사용 시에는 새로고침으로 최신화)
    if (!API_URL) {
      const stored = loadFromStorage(STORAGE_KEY_QUESTIONS, {})
      setRoomQuestionsByCode((prev) => ({ ...prev, ...stored }))
    }
    setSelectedRoom(room)
    setScreen('room')
  }

  const handleBackToTeacher = () => {
    setScreen('teacher')
    setSelectedRoom(null)
  }

  const handleAddQuestionToRoom = (content) => {
    if (!studentRoomCode) return
    const newQuestion = {
      id: Date.now().toString(),
      content,
      studentName,
      completionScore: 0,
      answerCount: 0,
      answers: [],
      completionRatings: []
    }
    setRoomQuestionsByCode((prev) => ({
      ...prev,
      [studentRoomCode]: [...(prev[studentRoomCode] || []), newQuestion]
    }))
  }

  const handleRateCompletion = (roomCode, questionId, raterName, score) => {
    const num = Number(score)
    if (num < 1 || num > 3) return
    setRoomQuestionsByCode((prev) => {
      const list = prev[roomCode] || []
      return {
        ...prev,
        [roomCode]: list.map((q) => {
          if (q.id !== questionId) return q
          const ratings = q.completionRatings || []
          if (ratings.some((r) => r.raterName === raterName)) return q
          return {
            ...q,
            completionRatings: [...ratings, { raterName, score: num }]
          }
        })
      }
    })
  }

  const handleAddAnswer = (roomCode, questionId, content) => {
    if (!content?.trim()) return
    setRoomQuestionsByCode((prev) => {
      const list = prev[roomCode] || []
      return {
        ...prev,
        [roomCode]: list.map((q) => {
          if (q.id !== questionId) return q
          const answers = [...(q.answers || []), { id: Date.now().toString(), studentName, content: content.trim() }]
          return { ...q, answers, answerCount: answers.length }
        })
      }
    })
  }

  const handleDeleteQuestion = (roomCode, questionId) => {
    setRoomQuestionsByCode((prev) => {
      const list = prev[roomCode] || []
      return {
        ...prev,
        [roomCode]: list.filter((q) => q.id !== questionId)
      }
    })
  }

  const handleScoreAnswer = (roomCode, questionId, answerId, studentName, score) => {
    const num = Number(score)
    if (num < 1 || num > 5) return
    setRoomQuestionsByCode((prev) => {
      const list = prev[roomCode] || []
      return {
        ...prev,
        [roomCode]: list.map((q) => {
          if (q.id !== questionId) return q
          const answers = (q.answers || []).map((a) =>
            a.id === answerId && a.givenScore == null ? { ...a, givenScore: num } : a
          )
          return { ...q, answers }
        })
      }
    })
    setParticipationByRoomCode((prev) => ({
      ...prev,
      [roomCode]: {
        ...(prev[roomCode] || {}),
        [studentName]: (prev[roomCode]?.[studentName] ?? 0) + num
      }
    }))
  }

  const questionsForCurrentRoom = studentRoomCode
    ? roomQuestionsByCode[studentRoomCode] || []
    : []

  const handleRefresh = () => {
    if (API_URL) {
      fetchStore()
        .then((data) => {
          setRooms(data.rooms ?? [])
          setRoomQuestionsByCode(data.roomQuestionsByCode ?? {})
          setParticipationByRoomCode(data.participationByRoomCode ?? {})
        })
        .catch((e) => console.error('API load error:', e))
    } else {
      setRooms(loadFromStorage(STORAGE_KEY_ROOMS, []))
      setRoomQuestionsByCode(loadFromStorage(STORAGE_KEY_QUESTIONS, {}))
      setParticipationByRoomCode(loadFromStorage(STORAGE_KEY_PARTICIPATION, {}))
    }
  }

  const showRefresh = screen !== 'login'

  // API 사용 시 초기 로딩
  if (API_URL && !apiReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>로딩 중...</p>
      </div>
    )
  }

  return (
    <>
      {showRefresh && (
        <button
          type="button"
          className="app-refresh-btn"
          onClick={handleRefresh}
          title="새로고침 - 변경된 데이터 불러오기"
          aria-label="새로고침"
        >
          <svg
            className="app-refresh-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      )}
      {screen === 'login' && (
        <LoginPage
          onTeacherSuccess={handleTeacherSuccess}
          onStudentSuccess={handleStudentSuccess}
        />
      )}
      {screen === 'teacher' && (
        <TeacherPage
          rooms={rooms}
          setRooms={setRooms}
          onSelectRoom={handleSelectRoom}
        />
      )}
      {screen === 'room' && selectedRoom && (
        <RoomPage
          room={selectedRoom}
          roomQuestions={
            roomQuestionsByCode[selectedRoom.code] ||
            loadFromStorage(STORAGE_KEY_QUESTIONS, {})[selectedRoom.code] ||
            []
          }
          onBack={handleBackToTeacher}
          onDeleteQuestion={(questionId) =>
            handleDeleteQuestion(selectedRoom.code, questionId)
          }
        />
      )}
      {screen === 'student' && (
        <StudentPage
          roomCode={studentRoomCode}
          studentName={studentName}
          questions={questionsForCurrentRoom}
          participationScore={
            participationByRoomCode[studentRoomCode]?.[studentName] ?? 0
          }
          onAddQuestion={handleAddQuestionToRoom}
          onDeleteQuestion={(questionId) =>
            handleDeleteQuestion(studentRoomCode, questionId)
          }
          onAddAnswer={(questionId, content) =>
            handleAddAnswer(studentRoomCode, questionId, content)
          }
          onScoreAnswer={(questionId, answerId, studentName, score) =>
            handleScoreAnswer(studentRoomCode, questionId, answerId, studentName, score)
          }
          onRateCompletion={(questionId, score) =>
            handleRateCompletion(studentRoomCode, questionId, studentName, score)
          }
        />
      )}
    </>
  )
}

export default App
