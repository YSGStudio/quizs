# 배포 가이드 (Vercel + Railway)

- **프론트엔드**: Vercel
- **백엔드**: Railway

---

## 1. 프론트엔드 배포 (Vercel)

### 1-1. Environment Variables (Variables)

**현재 버전**: API를 쓰지 않고 localStorage만 사용하므로 **Variables에 아무것도 넣지 않아도 됩니다.** 비워 두고 배포하면 됩니다.

| 변수명 | 값 | 필수 | 설명 |
|--------|-----|------|------|
| *(없음)* | — | — | 지금은 설정할 변수 없음 |

**나중에 Railway 백엔드와 연동할 때** 아래만 추가하면 됩니다.

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `VITE_API_URL` | `https://여기 Railway 도메인.up.railway.app` | 백엔드 API 주소 (예: `https://quizs-api-production.up.railway.app`) |

- Vercel **Settings** → **Environment Variables**에서 추가
- **Production / Preview / Development** 중 필요한 환경에 체크 후 저장
- 변수 추가·수정 후에는 **재배포**(Redeploy)해야 반영됨
- `VITE_` 접두어가 있어야 Vite 빌드 시 프론트 코드에서 `import.meta.env.VITE_API_URL`로 사용 가능

---

### 1-2. 방법 A: Vercel CLI

```bash
npm i -g vercel
vercel
```

프로젝트 루트에서 실행하면 Vite 프로젝트를 자동 인식합니다.

### 1-3. 방법 B: Vercel 웹사이트

1. [vercel.com](https://vercel.com) 로그인
2. **Add New** → **Project**
3. GitHub/GitLab/Bitbucket 연동 후 이 저장소 선택
4. **Root Directory**: 그대로 (프로젝트 루트)
5. **Framework Preset**: Vite
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. **Deploy** 클릭

현재는 데이터가 브라우저 localStorage에만 저장되므로, 배포된 사이트에서도 기기별로 데이터가 유지됩니다.

---

## 2. 백엔드 배포 (Railway) — 설정 상세

### 2-1. 프로젝트 생성 및 저장소 연결

1. [railway.app](https://railway.app) 로그인
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. GitHub 권한 허용 후 **YSGStudio/quizs** 저장소 선택
5. 저장소 연결이 완료되면 서비스(Service)가 하나 생성됨

---

### 2-2. Root Directory 설정 (필수)

이 프로젝트는 **프론트(루트)** 와 **백엔드(backend)** 가 한 저장소에 있으므로, Railway가 **backend 폴더만** 빌드하도록 지정해야 합니다.

1. Railway 대시보드에서 해당 **서비스(Service)** 클릭
2. **Settings** 탭 이동
3. **Source** 섹션에서 **Root Directory** 찾기
4. **Configure** 또는 **Edit** 클릭
5. **Root Directory** 입력란에 `backend` 입력 후 저장

> Root Directory를 `backend`로 두면 Railway는 `backend/package.json`을 기준으로 `npm install` 후 `npm start`를 실행합니다.

---

### 2-3. Build & Start 설정

- **Build Command**  
  - 기본값 사용 시: Nixpacks가 `package.json`을 보고 `npm install` 실행  
  - 따로 지정하려면: **Settings** → **Build** → **Build Command**에 `npm install` (필요 시에만 변경)

- **Start Command**  
  - **Settings** → **Deploy** → **Start Command**  
  - `npm start` (기본값, `backend/package.json`의 `"start": "node server.js"` 실행)  
  - 변경하지 않으면 됨

- **Watch Paths** (선택)  
  - GitHub 푸시 시 이 경로가 바뀌었을 때만 재배포하려면  
  - **Settings** → **Source** → **Watch Paths**에 `backend/**` 입력  
  - 지정하지 않으면 저장소 전체 변경 시마다 배포됨

---

### 2-4. 환경 변수 (Variables)

1. 해당 서비스에서 **Variables** 탭 클릭
2. **PORT**  
   - Railway가 자동으로 넣어 주는 변수이므로 **직접 추가하지 않아도 됨**  
   - `server.js`는 `process.env.PORT || 3001`을 사용하므로 Railway가 준 PORT를 씀
3. 나중에 프론트 URL을 허용하려면 (CORS 등):
   - `FRONTEND_URL` = `https://your-vercel-app.vercel.app`  
   - 백엔드에서 이 값을 읽어 CORS에 사용하도록 코드 수정 가능

---

### 2-5. 공개 URL (도메인) 생성

1. 해당 서비스에서 **Settings** 탭 이동
2. **Networking** 섹션 찾기
3. **Generate Domain** (또는 **Generate Service Domain**) 버튼 클릭
4. **"Enter the port your app is listening on"** 이 나오면:
   - **`3000`** 입력 (Railway가 기본으로 주입하는 `PORT` 값)
   - 우리 앱은 `process.env.PORT || 3001`을 사용하므로, Railway 환경에서는 보통 `3000`으로 동작함
   - 연결이 안 되면 **`3001`**도 시도
5. `xxx.up.railway.app` 형태의 URL이 생성됨 (예: `quizs-api-production.up.railway.app`)
6. 이 URL을 복사해 두기 — API 호출 시 `https://생성된주소` 로 사용

---

### 2-6. 배포 확인

- **Deployments** 탭에서 최신 배포 상태가 **Success** 인지 확인
- **Logs** 탭에서 `Server running on port xxxx` 로그가 나오면 정상 기동

**API 동작 확인 (브라우저 또는 curl):**

- `https://생성한도메인.up.railway.app/health`  
  → `{ "ok": true }` 응답
- `https://생성한도메인.up.railway.app/api/data`  
  → `{ "rooms": [], "roomQuestionsByCode": {}, "participationByRoomCode": {} }` 응답

---

### 2-7. Railway CLI로 배포 (선택)

```bash
npm i -g @railway/cli
railway login
cd backend
railway init   # 프로젝트/서비스 연결
railway up     # 현재 폴더(backend) 기준으로 배포
railway open   # 대시보드에서 도메인·로그 확인
```

CLI 사용 시에도 Railway 대시보드에서 해당 서비스의 **Root Directory**가 `backend`로 설정되어 있어야 합니다. (CLI는 현재 디렉터리 기준으로 업로드하므로 `backend`에서 실행하면 됨)

---

### 2-8. 참고 사항

- **무료 한도**: Railway 무료 플랜은 월 사용량 제한이 있으므로, [Railway 요금제](https://railway.app/pricing)를 확인하세요.

---

### 2-9. Database(PostgreSQL) 등록 — 데이터 영구 저장

다른 사람들이 접속해서 **같은 데이터를 주고받으려면** Railway에 PostgreSQL을 추가해야 합니다. 백엔드 코드는 이미 DB 연동을 지원합니다. `DATABASE_URL`이 있으면 DB에 저장하고, 없으면 메모리만 사용합니다.

#### Railway에서 PostgreSQL 추가

1. Railway 대시보드에서 **같은 프로젝트**로 이동 (백엔드 서비스가 있는 프로젝트)
2. **New** 버튼 클릭 → **Database** 선택 → **Add PostgreSQL**
3. PostgreSQL 서비스가 생성됨
4. **백엔드 서비스** 클릭 → **Variables** 탭
5. **Variable Reference** 또는 **Connect** 로 PostgreSQL의 `DATABASE_URL`을 백엔드에 연결  
   - PostgreSQL 서비스 → **Variables** 탭에서 `DATABASE_URL` 확인  
   - 백엔드 서비스 → **Variables** → **New Variable** → **Add Reference** 선택  
   - PostgreSQL 서비스 선택 → `DATABASE_URL` 변수 선택 후 추가  
   - (또는 PostgreSQL 쪽에서 "Connect" → "Add to project"로 백엔드 서비스에 변수 주입)
6. 백엔드 서비스 **재배포**(Redeploy) 한 번 실행

재배포 후 로그에 `Database connected, store loaded.` 가 보이면 DB 연동이 된 것입니다. 이제 방/문제/답변/참여도가 PostgreSQL에 저장되며, 재시작 후에도 유지됩니다.

- **기존 데이터(localStorage 등)를 Railway DB로 옮기기**: [MIGRATION.md](./MIGRATION.md) 참고.

#### DB 없을 때

- `DATABASE_URL`이 없으면 이전처럼 **메모리만** 사용합니다. 재시작 시 데이터는 초기화됩니다.

#### 헬스체크

- `GET /health` 응답에 `db: true` / `db: false` 가 포함됩니다. DB 사용 여부 확인용입니다.

---

## 3. 프론트에서 백엔드(DB) 연동

프론트엔드는 **`VITE_API_URL`** 이 있으면 Railway API를 통해 DB에서 데이터를 불러오고, 변경 시 DB에 저장합니다. 없으면 기존처럼 localStorage만 사용합니다.

### 설정 방법

1. Vercel 프로젝트 **Settings** → **Environment Variables**
2. **Name**: `VITE_API_URL`  
   **Value**: `https://여기Railway백엔드주소.up.railway.app` (끝에 슬래시 없이)
3. **Production / Preview / Development** 중 필요한 환경 체크 후 저장
4. **Redeploy** 실행 (변수 추가·수정 후 반드시 재배포해야 반영됨)

이후 배포된 사이트에서는 모든 사용자가 **같은 DB 데이터**를 보게 되며, 방/문제/답변/참여도가 Railway PostgreSQL에 저장됩니다.
