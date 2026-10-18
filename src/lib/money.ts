// 금액은 원 단위 정수(bigint)로만 다룬다

export function formatKRW(amount: bigint | number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// bps(1/10000) 수수료 계산, 원 미만 절사
export function calcFee(amount: bigint, feeBps: number): bigint {
  return (amount * BigInt(feeBps)) / BigInt(10000);
}

export function formatBps(bps: number): string {
  return `${bps / 100}%`;
}
