# 데이터가 프론트에 안 나올 때 점검 (크롤러 → DB → API → 프론트)

> 하나부터 열까지 순서대로 확인하세요.

---

## 1. 크롤러

- [ ] **실행 여부**: `python -m crawler.main` 또는 `python main.py` (crawler 폴더) 실행했는지.
- [ ] **로그**: 터미널에 `Saved 2 price records` (또는 1) 가 뜨는지. 에러면 `Save prices failed` 등 확인.
- [ ] **DB 연결**: `crawler/.env`의 `DATABASE_URL`이 **API/백엔드와 같은 DB**인지.  
  - 로컬 DB: `postgresql://goldsilver:비밀번호@localhost:5432/goldsilver_now`  
  - Docker DB 쓰면 호스트에서 크롤러 돌릴 때 `localhost:5432`로 접속하는지(포트 매핑 확인).
- [ ] **metal_id**: 크롤러는 `metal_id` 1(금), 2(은)만 INSERT. `metals` 테이블에 id 1, 2가 있어야 FK 통과.

---

## 2. DB

- [ ] **마이그레이션**: `cd backend && alembic upgrade head` 한 번이라도 실행했는지.
- [ ] **metals**: `SELECT * FROM metals;` → **2행**(gold, silver) 있어야 함. 없으면 시세 조회 시 조인 결과 없음.  
  - 수동 시드: `INSERT INTO metals (name, symbol) VALUES ('gold', 'XAU'), ('silver', 'XAG');`
- [ ] **prices**: `SELECT * FROM prices ORDER BY created_at DESC LIMIT 5;` 로 최근 데이터 들어왔는지.
- [ ] **같은 DB**: API와 크롤러가 **동일한 DB 인스턴스**를 보는지(다른 포트/다른 DB면 데이터 안 맞음).

---

## 3. 백엔드 API

- [ ] **실행 포트**: `uvicorn app.main:app --port 8080` 등으로 **실제 떠 있는 포트** 확인.
- [ ] **환경변수**: `backend/.env`의 `DATABASE_URL`이 위와 같은 DB인지.
- [ ] **직접 호출**: 브라우저 또는 터미널에서  
  `curl http://localhost:8080/api/prices/today`  
  → `{"gold": {...}, "silver": {...}}` 형태로 나오는지.  
  - `gold`/`silver`가 `null`이면 DB에 데이터 없거나 metals 조인 실패.
- [ ] **Redis**: Redis 쓰면 빈 응답은 더 이상 캐시하지 않도록 되어 있음. 예전에 캐시됐다면 1분 대기 또는 Redis에서 `api:prices:today` 키 삭제.

---

## 4. 프론트엔드

- [ ] **API URL**: `frontend/.env` 또는 `.env.local`에  
  `NEXT_PUBLIC_API_URL=http://localhost:8080`  
  (백엔드가 8080에서 떠 있으면 8080, 8000이면 8000).
- [ ] **재시작**: `NEXT_PUBLIC_*` 바꾼 뒤에는 **프론트 서버 재시작** (`npm run dev` 다시 실행).
- [ ] **에러 배너**: 화면에 "시세 API에 연결할 수 없습니다" 나오면 → URL/포트 불일치 또는 API 미실행.
- [ ] **새로고침**: 페이지 오른쪽 위 **🔄 새로고침**으로 다시 불러오기.

---

## 5. 흐름 요약

```
[크롤러] --INSERT--> [prices] (metal_id=1,2)
                         ^
[metals] (id=1 gold, id=2 silver)   |
                         |         |
[API /api/prices/today] --JOIN--> DB 조회 --> JSON --> [프론트 fetch] --> 화면
```

- **metals 비어 있음** → JOIN 결과 없음 → API가 `gold`/`silver` null 반환.
- **프론트가 잘못된 포트로 요청** → fetch 실패 → 에러 처리 시 "연결할 수 없습니다" 표시.
- **Next.js가 예전 응답 캐시** → `cache: 'no-store'` 로 매 요청마다 API 호출하도록 되어 있음.

---

*이전: [05-deploy.md](./05-deploy.md)*
