import { useState } from 'react'
import './LoginPage.css'

function LoginPage({ onTeacherSuccess, onStudentSuccess }) {
  // 화면 상태: null(첫페이지) | 'student' | 'teacher' | 'teacherSignup'
  const [loginType, setLoginType] = useState(null)

  // 학생 로그인: 6자리 코드, 이름
  const [studentCode, setStudentCode] = useState('')
  const [studentName, setStudentName] = useState('')

  // 교사 로그인: 이메일, 비밀번호
  const [teacherEmail, setTeacherEmail] = useState('')
  const [teacherPassword, setTeacherPassword] = useState('')

  // 교사회원가입: 이메일, 비밀번호
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const handleRoleSelect = (type) => {
    setLoginType(type)
    setStudentCode('')
    setStudentName('')
    setTeacherEmail('')
    setTeacherPassword('')
    setSignupEmail('')
    setSignupPassword('')
  }

  const handleBack = () => {
    setLoginType(null)
    setStudentCode('')
    setStudentName('')
    setTeacherEmail('')
    setTeacherPassword('')
    setSignupEmail('')
    setSignupPassword('')
  }

  const handleStudentSubmit = (e) => {
    e.preventDefault()
    const code = studentCode.trim().toUpperCase()
    const name = studentName.trim()
    if (code && name) onStudentSuccess?.(code, name)
  }

  const handleTeacherSubmit = (e) => {
    e.preventDefault()
    // TODO: 실제 교사 로그인 처리
    onTeacherSuccess?.()
  }

  const handleSignupSubmit = (e) => {
    e.preventDefault()
    // TODO: 실제 교사회원가입 처리
    onTeacherSuccess?.()
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* 첫 페이지: 학생/교사 로그인 선택 + 교사회원가입 버튼 */}
        {loginType === null ? (
          <>
            <h1 className="login-title">로그인</h1>
            <p className="login-subtitle">접속할 유형을 선택하세요</p>
            <div className="role-buttons">
              <button
                type="button"
                className="role-btn role-btn-student"
                onClick={() => handleRoleSelect('student')}
              >
                학생 로그인
              </button>
              <button
                type="button"
                className="role-btn role-btn-teacher"
                onClick={() => handleRoleSelect('teacher')}
              >
                교사 로그인
              </button>
            </div>
            <div className="signup-section">
              <button
                type="button"
                className="role-btn role-btn-signup"
                onClick={() => handleRoleSelect('teacherSignup')}
              >
                교사회원가입
              </button>
            </div>
          </>
        ) : loginType === 'student' ? (
          <>
            <button type="button" className="back-btn" onClick={handleBack}>
              ← 뒤로
            </button>
            <h1 className="login-title">학생 로그인</h1>
            <form className="login-form" onSubmit={handleStudentSubmit}>
              <div className="form-group">
                <label htmlFor="studentCode">6자리 코드</label>
                <input
                  id="studentCode"
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.slice(0, 6))}
                  placeholder="6자리 코드를 입력하세요"
                  maxLength={6}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="studentName">이름</label>
                <input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                />
              </div>
              <button type="submit" className="submit-btn">
                로그인
              </button>
            </form>
          </>
        ) : loginType === 'teacher' ? (
          <>
            <button type="button" className="back-btn" onClick={handleBack}>
              ← 뒤로
            </button>
            <h1 className="login-title">교사 로그인</h1>
            <form className="login-form" onSubmit={handleTeacherSubmit}>
              <div className="form-group">
                <label htmlFor="teacherEmail">이메일</label>
                <input
                  id="teacherEmail"
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="teacherPassword">비밀번호</label>
                <input
                  id="teacherPassword"
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="submit-btn">
                로그인
              </button>
            </form>
          </>
        ) : (
          /* 교사회원가입 */
          <>
            <button type="button" className="back-btn" onClick={handleBack}>
              ← 뒤로
            </button>
            <h1 className="login-title">교사회원가입</h1>
            <form className="login-form" onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label htmlFor="signupEmail">이메일</label>
                <input
                  id="signupEmail"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupPassword">비밀번호</label>
                <input
                  id="signupPassword"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="submit-btn">
                가입하기
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginPage
