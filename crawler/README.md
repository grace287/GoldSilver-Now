# Crawler (GoldSilver Now)

Python 크롤러입니다. npm이 아닌 Python으로 실행하세요.

## 실행 방법

**프로젝트 루트** (`GoldSilver-Now/`)에서:

```bash
# 1회 수집 후 종료
python -m crawler.main

# 주기 수집 (5~10분 간격)
python -m crawler.main --schedule
```

`crawler` 폴더 안에서 실행할 때:

```bash
cd crawler
python main.py
python main.py --schedule
```

## 실행 전 필수 (순서대로)

1. **DB·Redis 기동**: 프로젝트 루트에서 `docker compose up -d db redis`
2. **마이그레이션**: `cd backend` 후 `alembic upgrade head` (metals, prices 테이블 생성)
3. 그 다음 크롤러 실행

테이블이 없으면 `relation "prices" does not exist` 에러가 납니다. 2번을 먼저 실행하세요.

## 요구 사항

- Python 3.10+
- `pip install -r requirements.txt`
