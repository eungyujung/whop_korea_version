import "server-only";
import { prisma } from "./db";
import { DEFAULT_SETTINGS, type SettingKey } from "./settings-defaults";

// DB(platform_settings) 값을 우선 사용하고, 시드 전이라 값이 없으면 기본값을 쓴다
export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.platformSetting.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key];
}

export async function getIntSetting(key: SettingKey): Promise<number> {
  const value = Number.parseInt(await getSetting(key), 10);
  if (!Number.isFinite(value)) throw new Error(`설정값 ${key}가 숫자가 아닙니다`);
  return value;
}
