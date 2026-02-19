import { useState } from 'react'
import './StudentPage.css'

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

function StudentPage({
  roomCode,
  studentName,
  questions,
  participationScore = 0,
  onAddQuestion,
  onDeleteQuestion,
  onAddAnswer,
  onScoreAnswer,
  onRateCompletion
}) {
  const [activeTab, setActiveTab] = useState('list')
  const [questionContent, setQuestionContent] = useState('')
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null)
  const [answeringContent, setAnsweringContent] = useState('')
  const [viewingAnswersQuestionId, setViewingAnswersQuestionId] = useState(null)

  const handleSaveQuestion = (e) => {
    e.preventDefault()
    const content = questionContent.trim()
    if (!content) return
    onAddQuestion?.(content)
    setQuestionContent('')
    setActiveTab('list')
  }

  const handleOpenAnswer = (questionId) => {
    setAnsweringQuestionId(questionId)
    setAnsweringContent('')
  }

  const handleSaveAnswer = (e) => {
    e.preventDefault()
    const content = answeringContent.trim()
    if (!content || !answeringQuestionId) return
    onAddAnswer?.(answeringQuestionId, content)
    setAnsweringQuestionId(null)
    setAnsweringContent('')
  }

  const viewingQuestion = viewingAnswersQuestionId
    ? questions.find((q) => q.id === viewingAnswersQuestionId)
    : null
  const answeringQuestion = answeringQuestionId
    ? questions.find((q) => q.id === answeringQuestionId)
    : null

  return (
    <div className="student-page">
      <div className="student-participation-badge">
        <span className="participation-badge-icon" aria-hidden="true">★</span>
        <span className="participation-badge-text">참여도 <strong>{participationScore}</strong>점</span>
      </div>
      <div className="student-container">
        <h1 className="student-title">학생 대시보드</h1>
        <p className="student-info">
          {studentName} · 방 코드 {roomCode}
        </p>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'list' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            문제목록
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            문제 만들기
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'list' ? (
            <div className="question-list-panel">
              <h2 className="panel-title">만든 문제 목록</h2>
              {questions.length === 0 ? (
                <p className="question-list-empty">아직 만든 문제가 없습니다.</p>
              ) : (
                <div className="question-cards">
                  {[...questions]
                    .sort((a, b) => {
                      const aMine = a.studentName === studentName
                      const bMine = b.studentName === studentName
                      if (aMine && !bMine) return -1
                      if (!aMine && bMine) return 1
                      return 0
                    })
                    .map((q) => {
                    const isMyQuestion = q.studentName === studentName
                    const completionRatings = q.completionRatings || []
                    const completionScoreTotal = completionRatings.reduce((s, r) => s + r.score, 0)
                    const hasRated = completionRatings.some((r) => r.raterName === studentName)
                    return (
                      <div
                        key={q.id}
                        className={`question-card${isMyQuestion ? ' question-card--mine' : ''}`}
                      >
                        <div className="question-card-header">
                          <span className="question-card-completion-left">
                            {isMyQuestion ? (
                              <span className="completion-rated-label">출제자</span>
                            ) : hasRated ? (
                              <span className="completion-rated-label">평가함</span>
                            ) : (
                              [1, 2, 3].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  className="completion-star-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onRateCompletion?.(q.id, n)
                                  }}
                                  title={`완성도 ${n}점`}
                                  aria-label={`완성도 ${n}점`}
                                >
                                  ★
                                </button>
                              ))
                            )}
                          </span>
                          <span className="question-card-header-right">
                            <span className="question-card-stats">
                              <span>완성도 {completionScoreTotal}점</span>
                              <span className="question-card-stats-sep">·</span>
                              <span>답변 {(q.answers || []).length}</span>
                            </span>
                            {isMyQuestion && (
                              <button
                                type="button"
                                className="question-card-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteQuestion?.(q.id)
                                }}
                                aria-label="문제 삭제"
                                title="삭제"
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </span>
                        </div>
                        <p className="question-card-content">{q.content}</p>
                        {q.studentName && (
                          <p className="question-card-author">— {q.studentName}</p>
                        )}
                        <button
                          type="button"
                          className="question-card-answer-btn"
                          onClick={() =>
                            isMyQuestion
                              ? setViewingAnswersQuestionId(q.id)
                              : handleOpenAnswer(q.id)
                          }
                        >
                          {isMyQuestion ? '답변보기' : '답변하기'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="create-question-panel">
              <h2 className="panel-title">문제 만들기</h2>
              <form className="create-question-form" onSubmit={handleSaveQuestion}>
                <div className="form-group">
                  <label htmlFor="questionContent">문제 내용</label>
                  <textarea
                    id="questionContent"
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    placeholder="문제 내용을 입력하세요"
                    rows={5}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!questionContent.trim()}
                >
                  저장
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 답변하기 모달: 다른 학생 문제에 답변 입력 */}
      {answeringQuestion && (
        <div className="modal-overlay" onClick={() => setAnsweringQuestionId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">답변하기</h3>
            <p className="modal-question-preview">{answeringQuestion.content}</p>
            <form onSubmit={handleSaveAnswer}>
              <div className="form-group">
                <label htmlFor="answerContent">답변 내용</label>
                <textarea
                  id="answerContent"
                  value={answeringContent}
                  onChange={(e) => setAnsweringContent(e.target.value)}
                  placeholder="답변을 입력하세요"
                  rows={4}
                  autoComplete="off"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setAnsweringQuestionId(null)}>
                  취소
                </button>
                <button type="submit" className="modal-btn-submit" disabled={!answeringContent.trim()}>
                  답변 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 답변보기 모달: 내가 만든 문제에 달린 답변 목록 */}
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
                          <span className="answer-score-given">{a.givenScore}점</span>
                        ) : (
                          <>
                            <span className="answer-score-label">점수: </span>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                className="answer-score-btn"
                                onClick={() =>
                                  onScoreAnswer?.(viewingQuestion.id, a.id, a.studentName, n)
                                }
                              >
                                {n}
                              </button>
                            ))}
                          </>
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

export default StudentPage
