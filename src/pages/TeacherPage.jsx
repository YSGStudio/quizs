import { useState } from 'react'
import { generateRoomCode } from '../utils/code'
import './TeacherPage.css'

function TrashIcon() {
  return (
    <svg
      className="trash-icon"
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function TeacherPage({ rooms, setRooms, onSelectRoom }) {
  const [activeTab, setActiveTab] = useState('list')
  const [newRoomName, setNewRoomName] = useState('')

  const handleCreateRoom = (e) => {
    e.preventDefault()
    const name = newRoomName.trim()
    if (!name) return
    const code = generateRoomCode()
    const newRoom = { id: Date.now().toString(), name, code }
    setRooms((prev) => [...prev, newRoom])
    setNewRoomName('')
    setActiveTab('list')
    onSelectRoom?.(newRoom)
  }

  const handleDeleteRoom = (e, roomId) => {
    e.stopPropagation()
    setRooms((prev) => prev.filter((r) => r.id !== roomId))
  }

  return (
    <div className="teacher-page">
      <div className="teacher-container">
        <h1 className="teacher-title">교사 화면</h1>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'list' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            방 목록
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            방 만들기
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'list' ? (
            <div className="room-list-panel">
              <h2 className="panel-title">만든 방 목록</h2>
              {rooms.length === 0 ? (
                <p className="room-list-empty">아직 만든 방이 없습니다.</p>
              ) : (
                <ul className="room-list">
                  {rooms.map((room) => (
                    <li
                      key={room.id}
                      className="room-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectRoom?.(room)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelectRoom?.(room)
                        }
                      }}
                    >
                      <span className="room-info">
                        <span className="room-name">{room.name}</span>
                        <span className="room-code">{room.code}</span>
                      </span>
                      <button
                        type="button"
                        className="room-delete-btn"
                        onClick={(e) => handleDeleteRoom(e, room.id)}
                        aria-label="방 삭제"
                        title="삭제"
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="create-room-panel">
              <h2 className="panel-title">방 만들기</h2>
              <form className="create-room-form" onSubmit={handleCreateRoom}>
                <div className="form-group">
                  <label htmlFor="roomName">방 이름</label>
                  <input
                    id="roomName"
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="방 이름을 입력하세요"
                    autoComplete="off"
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={!newRoomName.trim()}>
                  방 만들기
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherPage
