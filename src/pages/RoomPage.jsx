import { useState } from 'react'
import './RoomPage.css'

function TrashIcon() {
  return (
    <svg
      className="question-card-trash-icon"
      width="18"
      height="18"
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

function RoomPage({ room, roomQuestions, onBack, onDeleteQuestion }) {
  const list = roomQuestions || []
  const [viewingAnswersQuestionId, setViewingAnswersQuestionId] = useState(null)

  const viewingQuestion = viewingAnswersQuestionId
    ? list.find((q) => q.id === viewingAnswersQuestionId)
    : null

  return (
    <div className="room-page">
      <div className="room-page-container">
        <button type="button" className="room-back-btn" onClick={onBack}>
          ← 방 목록으로
        </button>
        <h1 className="room-page-title">{room.name}</h1>
        <p className="room-page-code">입장 코드: {room.code}</p>

        <section className="student-questions-section">
          <h2 className="section-title">학생들이 만든 문제 목록</h2>
          {list.length === 0 ? (
            <p className="questions-empty">아직 학생이 만든 문제가 없습니다.</p>
          ) : (
            <div className="question-cards">
              {list.map((q) => {
                const completionScoreTotal = (q.completionRatings || []).reduce((s, r) => s + r.score, 0) || (q.completionScore ?? 0)
                return (
                <div key={q.id} className="question-card">
                  <div className="question-card-header">
                    <span className="question-card-stats">
                      <span>완성도 {completionScoreTotal}점</span>
                      <span className="question-card-stats-sep">·</span>
                      <span>답변 {(q.answers || []).length}</span>
                    </span>
                    {onDeleteQuestion && (
                      <button
                        type="button"
                        className="question-card-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteQuestion(q.id)
                        }}
                        aria-label="문제 삭제"
                        title="삭제"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                  <p className="question-card-content">{q.content}</p>
                  {q.studentName && (
                    <p className="question-card-author">— {q.studentName}</p>
                  )}
                  <button
                    type="button"
                    className="question-card-answer-btn"
                    onClick={() => setViewingAnswersQuestionId(q.id)}
                  >
                    답변보기
                  </button>
                </div>
              );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 답변 목록 모달 */}
      {viewingQuestion && (
        <div className="modal-overlay" onClick={() => setViewingAnswersQuestionId(null)}>
          <div className="modal-box modal-answers-list" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">답변 목록</h3>
            <p className="modal-question-preview">{viewingQuestion.content}</p>
            <div className="answers-list">
              {(viewingQuestion.answers || []).length === 0 ? (
                <p className="answers-list-empty">아직 답변이 없습니다.</p>
              ) : (
                <ul>
                  {(viewingQuestion.answers || []).map((a) => (
                    <li key={a.id} className="answer-item">
                      <span className="answer-author">{a.studentName}</span>
                      <p className="answer-content">{a.content}</p>
                      <div className="answer-score-row">
                        {a.givenScore != null ? (
                          <span className="answer-score-given">출제자 부여 점수: {a.givenScore}점</span>
                        ) : (
                          <span className="answer-score-unset">미평가</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="modal-btn-cancel" onClick={() => setViewingAnswersQuestionId(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomPage
