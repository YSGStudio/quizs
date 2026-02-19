# 배포 가이드 (Vercel + Railway)

- **프론트엔드**: Vercel
- **백엔드**: Railway

---

## 1. 프론트엔드 배포 (Vercel)

### 방법 A: Vercel CLI

```bash
npm i -g vercel
vercel
```

프로젝트 루트에서 실행하면 Vite 프로젝트를 자동 인식합니다.

### 방법 B: Vercel 웹사이트

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

## 2. 백엔드 배포 (Railway)

### 사전 준비

```bash
cd backend
npm install
```

### Railway에서 배포

1. [railway.app](https://railway.app) 로그인
2. **New Project** → **Deploy from GitHub repo** (또는 **Empty Project** 후 CLI 사용)
3. 저장소 연결 후 설정:
   - **Root Directory**: `backend` 로 지정 (또는 모노레포에서 backend만 선택)
   - **Build Command**: `npm install` (기본)
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**` (루트가 repo면)

4. **Variables**에서 필요 시 `PORT`는 Railway가 자동 설정합니다.
5. **Settings** → **Networking** → **Generate Domain** 으로 공개 URL 생성 (예: `https://xxx.up.railway.app`)

### Railway CLI로 배포

```bash
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
railway open  # 대시보드에서 도메인 확인
```

### API 확인

- `GET https://your-app.up.railway.app/health` → `{ "ok": true }`
- `GET https://your-app.up.railway.app/api/data` → `{ rooms, roomQuestionsByCode, participationByRoomCode }`

백엔드는 현재 메모리 저장만 하므로, 서버 재시작 시 데이터가 초기화됩니다. 영구 저장이 필요하면 DB(PostgreSQL 등)를 Railway에 추가해 연결하면 됩니다.

---

## 3. (선택) 프론트에서 백엔드 연동

백엔드 URL을 쓰려면 프론트 빌드 시 API 주소를 넣어야 합니다.

1. Vercel 프로젝트 **Settings** → **Environment Variables**
2. `VITE_API_URL` = `https://your-railway-app.up.railway.app` 추가
3. 프론트엔드 코드에서 `import.meta.env.VITE_API_URL`이 있으면 해당 URL로 API 호출하도록 구현 후, 재배포

현재 앱은 API 연동 없이 localStorage만 사용하므로, 위 단계는 나중에 API를 붙일 때 적용하면 됩니다.
