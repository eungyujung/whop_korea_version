// 운영 설정값의 초기값. 실제 값은 DB(platform_settings)에 있고, 시드 때 한 번만 들어간다.
// 값을 바꾸려면 DB를 수정한다 (pnpm db:studio → platform_settings).
export const DEFAULT_SETTINGS = {
  platform_fee_bps: "1000", // 광고주 충전 수수료 1000bps = 10%
  duplicate_click_window_hours: "24", // 같은 IP+UA 중복 클릭 판정 기간
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
