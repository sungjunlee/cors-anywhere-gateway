# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

cors-anywhere-gateway는 [cors-anywhere](https://github.com/Rob--W/cors-anywhere)를 래핑한 인증 지원 HTTP Fetch 게이트웨이입니다. 한국 정부 API 등 지역 제한 API에 접근하기 위해 사용됩니다.

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x (ESM)
- **Build**: esbuild (single bundle output)
- **Package Manager**: pnpm
- **Linter/Formatter**: Biome

## Commands

```bash
# Development
pnpm dev              # tsx watch mode

# Build
pnpm build            # esbuild → dist/index.js

# Production
pnpm start            # node dist/index.js

# Code Quality
pnpm lint             # biome check
pnpm lint:fix         # biome check --write
pnpm typecheck        # tsc --noEmit

# Docker
docker compose up -d  # 프로덕션 컨테이너 실행
```

## Architecture

```
클라이언트 → cors-anywhere-gateway (x-api-key 헤더) → 목적지 서버
```

핵심 흐름:
1. `src/index.ts`: 엔트리포인트, 설정 출력 후 서버 시작
2. `src/server.ts`: cors-anywhere 서버 생성 및 미들웨어 연결
3. `src/middleware/auth.ts`: `handleInitialRequest`에서 x-api-key 검증
4. `src/config.ts`: 환경변수 로드 (PORT, API_KEY, ORIGIN_WHITELIST 등)

## API Usage

```bash
# URL 형식: http://<gateway>:<port>/<target-url>
curl -H "x-api-key: ${API_KEY}" http://localhost:8080/http://example.com
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | 서버 포트 |
| API_KEY | (empty) | 인증 키 (비어있으면 인증 스킵) |
| ORIGIN_WHITELIST | (empty) | 허용 origin (쉼표 구분) |
| RATE_LIMIT_MAX | 100 | 윈도우당 최대 요청 |
| TIMEOUT | 30000 | 타임아웃 (ms) |

## Implementation Notes

- cors-anywhere의 `handleInitialRequest` 콜백을 사용하여 API 키 인증 구현
- 민감한 헤더(cookie, x-api-key)는 목적지로 전달되지 않도록 `removeHeaders` 설정
- Docker 이미지는 Alpine 기반 (~50MB), non-root 사용자로 실행
