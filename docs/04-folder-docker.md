# 폴더 구조 및 Docker — GoldSilver Now

> 단일 레포(모노레포) 기준. 서비스별 디렉터리 분리.

---

## 1. 프로젝트 루트 구조

```
GoldSilver-Now/
├── .cursor/
│   └── rules/                 # Cursor AI 규칙
│       ├── goldsilver-now-context.mdc
│       ├── backend-crawler-db.mdc
│       ├── api-frontend.mdc
│       └── git-commit.mdc
├── docs/                      # 설계·문서
│   ├── 01-crawler-design.md
│   ├── 02-erd.md
│   ├── 03-wireframe.md
│   └── 04-folder-docker.md
├── crawler/                   # Python 크롤러·스케줄러
│   ├── __init__.py
│   ├── config.py
│   ├── scheduler.py
│   ├── fetcher.py
│   ├── parser.py
│   ├── normalizer.py
│   ├── repository.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── backend/                   # FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── prices.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── redis.py
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                  # Next.js
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── .env.example                # 루트 통합 예시 (선택)
├── .gitignore
└── README.md
```

---

## 2. 디렉터리별 역할

| 경로 | 역할 |
|------|------|
| `crawler/` | 시세 수집, 파싱, 정제, DB 저장. 진입점 `main.py` 또는 스케줄러 |
| `backend/` | FastAPI 앱, `/api/prices/*` 제공, PostgreSQL·Redis 연동 |
| `frontend/` | Next.js 앱, 메인 대시보드·차트 |
| `docs/` | PRD 파생 설계서, ERD, 와이어프레임, 본 문서 |

---

## 3. Docker 구성

### 3.1 서비스 목록

| 서비스 | 이미지/빌드 | 역할 |
|--------|-------------|------|
| db | postgres:15-alpine | PostgreSQL |
| redis | redis:7-alpine | 캐시 |
| api | backend/Dockerfile | FastAPI |
| crawler | crawler 전용 Dockerfile (선택) | 스케줄 크롤링 |
| web | frontend/Dockerfile | Next.js (SSR/정적) |

- **crawler**: 같은 네트워크에서 DB에 접근. 호스트에서 스케줄 실행하거나, 컨테이너 내부에서 APScheduler 실행.

### 3.2 docker-compose.yml (예시)

```yaml
version: "3.9"

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: goldsilver
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: goldsilver_now
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U goldsilver -d goldsilver_now"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://goldsilver:${POSTGRES_PASSWORD:-changeme}@db:5432/goldsilver_now
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8000:8000"
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_healthy }

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:8000
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  pgdata:
```

- **crawler**는 로컬에서 `python crawler/main.py` 또는 별도 `crawler` 서비스로 추가 가능.

### 3.3 backend Dockerfile (예시)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.4 frontend Dockerfile (예시)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

- Next.js `output: 'standalone'` 설정 필요.

### 3.5 crawler Dockerfile (선택)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

- docker-compose에 추가 시 `depends_on: db`, 환경변수로 `DATABASE_URL` 전달.

---

## 4. 환경 변수 (.env.example)

### 루트 또는 crawler

```
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql://goldsilver:changeme@localhost:5432/goldsilver_now
CRAWL_INTERVAL_MINUTES=5
GOLD_SOURCE_URL=
SILVER_SOURCE_URL=
```

### backend

```
DATABASE_URL=postgresql://goldsilver:changeme@db:5432/goldsilver_now
REDIS_URL=redis://redis:6379/0
```

### frontend

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 5. 실행 순서 (로컬 개발)

1. `docker compose up -d db redis` — DB·Redis만 기동
2. backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
3. crawler: `cd crawler && python main.py` (또는 스케줄러 모드)
4. frontend: `cd frontend && npm run dev`
5. 전체 배포: `docker compose up --build`

---

## 6. 배포 (Railway / Fly.io)

- **backend**: Dockerfile 빌드 후 웹 서비스로 배포. DB·Redis는 매니지드 서비스 또는 Docker 볼륨.
- **frontend**: 정적 export 또는 Node 서버로 배포. `NEXT_PUBLIC_API_URL`을 배포 API URL로 설정.
- **crawler**: Worker 형태로 배포하거나, 크론/스케줄러 서비스로 동일 레포에서 실행.

---

*이전: [03-wireframe.md](./03-wireframe.md) | 다음: [05-deploy.md](./05-deploy.md)*
