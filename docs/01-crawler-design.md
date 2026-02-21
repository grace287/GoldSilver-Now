# 크롤러 설계서 (GoldSilver Now)

> 문서 버전: 1.0  
> 대상: 금 1돈 매수/매도, 은 시세 수집 (한국금거래소 등)

---

## 1. 목적 및 범위

- **목적**: 한국금거래소(또는 동일 수준 시세 제공 사이트)에서 금·은 시세를 주기적으로 수집하여 DB에 저장한다.
- **MVP 수집 대상**
  - 금 1돈 **살 때** (매수가)
  - 금 1돈 **팔 때** (매도가)
  - **은** 시세 (매수/매도 또는 단일 시세 — 사이트 구조에 따름)
- **제외 (MVP)**: 국제 금(XAU) 시세, 환율, 다른 금속

---

## 2. 아키텍처 개요

```
[스케줄러] ─주기 호출→ [크롤러] ─raw HTML/text→ [파서] ─정제 데이터→ [저장소]
     │                      │                         │
  APScheduler           requests + BS4            DB Writer
  (5~10분)              또는 httpx                  (PostgreSQL)
```

- **크롤러**: HTTP 요청 + HTML 파싱 (BeautifulSoup).
- **파서**: 숫자 추출, 단위 정규화(원/kg 등 → 원/1돈 등), 유효성 검사.
- **저장소**: DB 삽입 인터페이스(서비스/리포지토리). 직접 SQL 또는 ORM.

---

## 3. 기술 스택

| 구분 | 선택 | 비고 |
|------|------|------|
| 언어 | Python 3.10+ | typing, asyncio 활용 권장 |
| HTTP | requests 또는 httpx | httpx는 async 지원 |
| 파싱 | BeautifulSoup4 (bs4) | lxml 파서 권장 (설치 시) |
| 스케줄 | APScheduler | MVP 권장. Celery는 Redis 등 인프라 필요 시 전환 |
| 설정 | .env + pydantic-settings | URL, 주기, DB 연결 등 |
| 로깅 | logging (표준) | 파일 + 콘솔, 로테이션 권장 |

---

## 4. 수집 주기 및 정책

- **기본 주기**: 5분 또는 10분 (설정값으로 관리).
- **동작**
  - 매 주기마다 금(매수/매도), 은 시세 1회씩 수집.
  - 실패 시 재시도: 최대 2~3회, 지수 백오프(1s, 2s, 4s).
- **차단 완화**
  - User-Agent: 일반 브라우저 값 사용, 필요 시 리스트 로테이션.
  - 요청 간 최소 간격: 1~2초 (같은 도메인).
  - 필요 시 Referer 설정 (사이트 정책에 따름).

---

## 5. 데이터 흐름

1. **스케줄러**가 주기마다 `run_crawl()`(또는 동등 함수) 호출.
2. **크롤러**가 대상 URL(들) 요청 → HTML 응답 수신.
3. **파서**가 HTML에서 숫자·단위 추출 → `RawPrice` 또는 `PriceRow` DTO 생성.
4. **정제**에서 단위 통일(원), 소수 자리 통일, 이상치 제거(선택).
5. **저장**에서 `metals` 테이블 기준으로 `metal_id` 매핑 후 `prices` 테이블에 INSERT.

---

## 6. 출력 데이터 형식 (정제 후)

DB 저장 직전 형태 예시:

```python
@dataclass
class PriceRecord:
    metal_id: int       # 1=gold, 2=silver
    buy_price: Decimal  # 매수가 (원)
    sell_price: Decimal # 매도가 (원). 은은 단일 시세일 경우 buy=sell 가능
    source: str         # e.g. "korea_gold_exchange"
    crawled_at: datetime  # 수집 시각 (UTC 권장)
```

- 금: buy_price(살 때), sell_price(팔 때) 각각 저장.
- 은: 사이트가 매수/매도 구분이 없으면 동일값으로 저장 가능.

---

## 7. 에러 처리 및 로깅

- **네트워크/타임아웃**: 로그 남기고 재시도 → 전부 실패 시 해당 주기 스킵, 다음 주기에 재시도.
- **파싱 실패**: 로그에 URL, HTML 스니펫(압축) 기록. DB에는 넣지 않음.
- **DB 저장 실패**: 로그 + 재시도 1회. 실패 시 해당 레코드는 DLQ/파일 저장 검토(Phase 2).
- **로그 레벨**: INFO 정상 수집/저장, WARNING 재시도/파싱 실패, ERROR 저장 실패/연속 실패.

---

## 8. 폴더/모듈 구성 (권장)

```
crawler/
├── __init__.py
├── config.py          # 설정 로드 (URL, 주기, DB URL)
├── scheduler.py       # APScheduler 등록 및 run_crawl 주기 실행
├── fetcher.py         # HTTP 요청 (get_page(url) 등)
├── parser.py          # HTML → PriceRecord (사이트별 파서 함수)
├── normalizer.py      # 단위/소수 정제
├── repository.py      # DB INSERT (또는 backend 쪽 서비스 호출)
└── main.py            # 진입점 (scheduler 시작 또는 1회 실행)
```

- **parser**는 사이트 구조가 바뀌면 수정되는 유일한 지점이 되도록 분리.

---

## 9. 설정 항목 (예시)

| 키 | 설명 | 예시 |
|----|------|------|
| CRAWL_INTERVAL_MINUTES | 수집 주기(분) | 5 또는 10 |
| GOLD_SOURCE_URL | 금 시세 페이지 URL | (대상 사이트 URL) |
| SILVER_SOURCE_URL | 은 시세 페이지 URL | (대상 사이트 URL) |
| USER_AGENT | HTTP User-Agent | Mozilla/5.0 ... |
| REQUEST_TIMEOUT_SEC | 요청 타임아웃 | 10 |
| RETRY_COUNT | 재시도 횟수 | 3 |

---

## 10. 테스트 관점

- **단위**: 파서에 HTML 스니펫 넣었을 때 기대한 숫자/PriceRecord 나오는지.
- **통합**: mock HTTP로 크롤러+파서+정제까지 실행 후 출력 구조 확인.
- **E2E**: 실제 URL 호출은 선택(차단/변경 리스크). 스테이징/개발용 URL이 있으면 활용.

---

## 11. 향후 확장 (Phase 2)

- 국제 금(XAU) 시세 API 연동 시 **fetcher**에 API 클라이언트 추가, **parser**는 JSON 파싱으로 분기.
- Celery 전환 시 `scheduler.py`를 Beat 스케줄 + Worker 태스크로 교체.
- 다중 소스(여러 거래소) 지원 시 `parser`를 소스별 모듈로 분리 (`parser_korea_gold.py` 등).

---

*다음 문서: [02-erd.md](./02-erd.md)*
