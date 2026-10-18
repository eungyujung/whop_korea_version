import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEFAULT_SETTINGS } from "../src/server/settings-defaults";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // 이미 있는 설정값은 덮어쓰지 않는다 (운영 중 바꾼 값 보존)
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.platformSetting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }
  console.log("platform_settings 시드 완료:", DEFAULT_SETTINGS);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
