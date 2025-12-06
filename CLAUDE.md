# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

cors-anywhere-gateway는 [cors-anywhere](https://github.com/Rob--W/cors-anywhere)를 래핑한 인증 지원 HTTP Fetch 게이트웨이입니다. 한국 정부 API 등 지역 제한 API에 접근하기 위해 사용됩니다.

**Cloudflare WAF 우회**: URL을 Base64URL로 인코딩하여 경로에 `http://`가 노출되지 않도록 하여 Open Proxy 패턴 탐지를 회피합니다.

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x (ESM)
- **Build**: esbuild (single bundle output)
- **Package Manager**: pnpm
- **Linter/Formatter**: Biome

## Commands

```bash
pnpm dev              # tsx watch mode
pnpm build            # esbuild → dist/index.js
pnpm start            # node dist/index.js
pnpm lint             # biome check
pnpm typecheck        # tsc --noEmit
docker compose up -d  # 프로덕션 컨테이너 실행
```

## Architecture

```
클라이언트 → Base64URL encode → gateway/fetch/{encoded} → decode → cors-anywhere → 목적지
```

핵심 흐름:
1. `src/server.ts`: HTTP 서버가 요청 받음 → Base64URL 디코딩 → cors-anywhere로 전달
2. `src/config.ts`: 환경변수 로드 (PORT, API_KEY 등)

## API Usage

```bash
# 1. URL을 Base64URL로 인코딩
echo -n "http://example.com/api" | base64 | tr '+/' '-_' | tr -d '='
# → aHR0cDovL2V4YW1wbGUuY29tL2FwaQ

# 2. 요청
curl -H "x-api-key: ${API_KEY}" http://localhost:8080/fetch/aHR0cDovL2V4YW1wbGUuY29tL2FwaQ

# Health check
curl http://localhost:8080/       # {"status":"ok"}
curl http://localhost:8080/health # {"status":"ok"}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | 서버 포트 |
| API_KEY | (empty) | 인증 키 (비어있으면 인증 스킵) |
| ORIGIN_WHITELIST | (empty) | 허용 origin (쉼표 구분) |

## Implementation Notes

- 모든 요청은 Base64URL 인코딩 필수 (보안 + Cloudflare WAF 우회)
- `http://`, `https://` 스킴만 허용 (SSRF 방지)
- 민감한 헤더(cookie, x-api-key)는 목적지로 전달되지 않음
