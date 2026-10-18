# whop_korea_version

한국의 whop 웹페이지 제작.

코드를 저장소로 옮기는 방법

git add . 
git commit -m "작업 내용 한 줄 설명"
git push

해당 방법이 오류가 난다면 해결방법

git push -u origin HEAD

저장 상태 확인 방법
git status        # 저장 안 된 변경 확인
git log --oneline -5   # 최근 커밋 확인

편리하게 저장하는 방법

echo 'alias save="git add . && git commit -m \"wip: $(date +%F_%H:%M)\" && git push"' >> ~/.bashrc
source ~/.bashrc

수수료는 광고주에게 받아야한다.
출금은 1만원부터 가능하도록 해야 잦은 출금으로 인한 이체비용을 줄일 수 있다.

---

## PromoPool(가칭) MVP 실행 방법 (로컬)

웹사이트 링크 홍보(클릭당 보상) MVP. 결제·정산 없이 DB 숫자로만 동작한다. 설계는 `docs/PLAN.md`.

### 처음 한 번
```bash
pnpm install                 # 의존성 설치 (Prisma 클라이언트도 자동 생성)
cp .env.example .env         # 환경변수 파일 (이미 있으면 생략)
#   .env 의 AUTH_SECRET 에 `openssl rand -hex 32` 결과를 넣는다
pnpm db:up                   # Docker로 PostgreSQL 실행
pnpm db:migrate              # 테이블 생성
pnpm db:seed                 # 설정값(수수료 10% 등) 입력
```

### 매번
```bash
pnpm db:up    # DB가 꺼져 있으면
pnpm dev      # http://localhost:3000
```

### 자주 쓰는 명령
| 명령 | 설명 |
|---|---|
| `pnpm build` | 프로덕션 빌드 (타입 검사 포함) |
| `pnpm db:studio` | DB를 브라우저에서 보고 수정 (수수료율 등 `platform_settings` 변경) |
| `pnpm db:reset` | DB 전체 초기화 후 마이그레이션·시드 재실행 |
| `docker compose down` | DB 컨테이너 중지 (데이터는 유지) |

### 구조
- `src/app` 화면과 라우트 (`/r/[code]` = 추적 링크)
- `src/server` 서버 로직 (DB, 로그인, 캠페인, 클릭 판정)
- `prisma/schema.prisma` DB 구조
