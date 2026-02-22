# 배포 가이드 (Railway / Fly.io) — GoldSilver Now

> Week 3: Docker 세팅 후 클라우드 배포 절차 요약.

---

## 1. 배포 구조 요약

| 서비스 | 역할 | 배포 옵션 |
|--------|------|------------|
| PostgreSQL | DB | Railway Postgres / Fly Postgres / Neon 등 |
| Redis | 캐시 | Railway Redis / Upstash 등 (선택) |
| API (FastAPI) | 백엔드 | Railway 또는 Fly.io (Dockerfile) |
| Web (Next.js) | 프론트 | Railway 또는 Fly.io (Dockerfile) |
| Crawler | 주기 수집 | Railway Cron / Fly Machines / 별도 Worker |

- **MVP**: API + Web + DB 필수. Redis·Crawler는 선택(로컬 크롤러만 돌려도 됨).

---

## 2. Railway 배포 (권장: 단순함)

### 2.1 준비

- [Railway](https://railway.app) 계정, GitHub 연동
- 레포: `GoldSilver-Now` 푸시된 상태

### 2.2 DB 생성

1. Railway 대시보드 → **New Project**
2. **Add Service** → **Database** → **PostgreSQL**
3. 생성된 서비스 클릭 → **Variables** 탭에서 `DATABASE_URL`(또는 `PGHOST`, `PGUSER` 등) 확인
4. Railway가 제공하는 `DATABASE_URL` 복사 (다른 서비스에서 사용)

### 2.3 API 배포

1. **Add Service** → **GitHub Repo** → 저장소 선택
2. **Settings**에서:
   - **Root Directory**: `backend`
   - **Build Command**: (비움 또는 `pip install -r requirements.txt` — Railway가 Dockerfile 있으면 Docker 빌드)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Variables**에 추가:
   - `DATABASE_URL` = (2.2에서 복사한 값)
   - `REDIS_URL` = (Redis 쓸 경우; Railway Redis 서비스 추가 후 연결 URL)
4. **Deploy** 후 생성된 도메인 확인 (예: `xxx.up.railway.app`)

### 2.4 Web(Next.js) 배포

1. **Add Service** → 같은 레포 선택
2. **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (또는 `node server.js` — Next.js standalone이면 `server.js`)
3. **Variables**:
   - `NEXT_PUBLIC_API_URL` = (2.3에서 나온 API 도메인, 예: `https://xxx.up.railway.app`)
4. **Deploy** 후 웹 도메인 확인

### 2.5 Crawler (선택)

- **방법 A**: 로컬/개인 PC에서 `python -m crawler.main --schedule` 실행, `DATABASE_URL`만 Railway DB로 설정
- **방법 B**: Railway에서 **Cron** 또는 별도 **Worker** 서비스로 같은 레포의 `crawler` 디렉터리 실행 (스케줄 설정은 Railway 문서 참고)

### 2.6 마이그레이션

- API가 Railway에서 처음 기동되기 **전**에 DB 스키마 적용 필요
- 로컬에서 Railway DB URL로 연결해 실행:
  ```bash
  cd backend
  DATABASE_URL="postgresql://..." alembic upgrade head
  ```
- 또는 Railway API 서비스에 **Deploy 시 실행**되는 스크립트 추가 (예: `alembic upgrade head && uvicorn ...`)

---

## 3. Fly.io 배포

### 3.1 준비

- [Fly.io](https://fly.io) 계정, `flyctl` 설치
- 레포 클론 후 터미널에서 프로젝트 루트

### 3.2 Postgres·Redis (Fly에서)

```bash
# Postgres 앱 생성
fly postgres create --name goldsilver-db --region nrt

# 연결 문자열 확인 후 앱에 연결
fly postgres attach goldsilver-db -a goldsilver-api

# Redis (선택)
fly redis create --name goldsilver-redis --region nrt
```

### 3.3 API 배포

1. `backend/` 안에 `Dockerfile` 있음
2. API 앱 생성 및 배포:
   ```bash
   cd backend
   fly launch --name goldsilver-api --no-deploy
   fly secrets set DATABASE_URL="postgresql://..." REDIS_URL="redis://..."
   fly deploy
   ```
3. `fly status`, `fly open`으로 확인. 도메인 예: `goldsilver-api.fly.dev`

### 3.4 Web 배포

1. `frontend/` 안에 `Dockerfile` 있음
2. **중요**: 빌드 시 `NEXT_PUBLIC_API_URL`이 필요하므로 `fly.toml` 또는 secrets에서 빌드 인자로 전달
3. Fly에서는 빌드 시점 env를 주려면 `fly.toml`의 `[build]` 또는 Dockerfile에서 ARG로 받기
4. 예시:
   ```bash
   cd frontend
   fly launch --name goldsilver-web --no-deploy
   fly secrets set NEXT_PUBLIC_API_URL=https://goldsilver-api.fly.dev
   # Dockerfile에서 ENV NEXT_PUBLIC_API_URL을 런타임에 넣으려면, Next는 빌드 시점에 인라인하므로 빌드 시 전달 필요. 보통 Docker 빌드 시 --build-arg NEXT_PUBLIC_API_URL=... 사용
   fly deploy --build-arg NEXT_PUBLIC_API_URL=https://goldsilver-api.fly.dev
   ```
5. Next.js는 `NEXT_PUBLIC_*`가 빌드 시 인라인되므로, Fly에서 재빌드 시 해당 값을 반드시 넘겨야 함 (Dockerfile에 `ARG NEXT_PUBLIC_API_URL` + `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` 추가 후 `docker build --build-arg` 또는 fly의 build-arg 사용)

### 3.5 Crawler (선택)

- Fly Machines로 주기 실행: `fly machine run` + cron 외부 서비스 또는 Fly의 스케줄 기능 검토
- 또는 로컬에서 Railway/Fly DB URL로 크롤러만 실행

### 3.6 마이그레이션

- 로컬에서 Fly Postgres 연결 문자열로:
  ```bash
  cd backend
  DATABASE_URL="postgres://..." alembic upgrade head
  ```

---

## 4. 공통 체크리스트

- [ ] DB 생성 후 `alembic upgrade head`로 스키마 적용
- [ ] API 환경변수: `DATABASE_URL`, (선택) `REDIS_URL`
- [ ] Web 환경변수: `NEXT_PUBLIC_API_URL` = 배포된 API URL (https 권장)
- [ ] API CORS: 배포 웹 도메인 허용 (현재 FastAPI는 `allow_origins=["*"]` — 프로덕션에서는 특정 도메인으로 제한 권장)
- [ ] 크롤러: 배포 DB URL로 로컬 실행 또는 Worker/Cron으로 배포

---

## 5. Docker Compose로 로컬 프로덕션 테스트

```bash
docker compose up --build
```

- API: http://localhost:8000  
- Web: http://localhost:3000  
- 브라우저에서 Web은 API를 `http://localhost:8000`으로 호출 (같은 호스트이므로). 배포 시에는 `NEXT_PUBLIC_API_URL`을 배포 API URL로 설정해야 함.

---

*이전: [04-folder-docker.md](./04-folder-docker.md)*
