// 숫자 표기 — 화면 문구는 모두 여기서 만든다

export const formatNumber = (n: number) => n.toLocaleString('ko-KR')

export const formatWon = (n: number) => `${formatNumber(n)}원`

/** 그래프 세로축: 50만 · 1,200만 · 1.5억 */
export function formatAxisWon(n: number) {
  if (n === 0) return '0'
  if (n >= 100_000_000) return `${+(n / 100_000_000).toFixed(1)}억`
  return `${formatNumber(Math.round(n / 10_000))}만`
}

/** 그래프 눈금 간격을 1·2·2.5·5 × 10^k 로 깔끔하게 */
export function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw))
  const base = raw / pow
  const nice = base <= 1 ? 1 : base <= 2 ? 2 : base <= 2.5 ? 2.5 : base <= 5 ? 5 : 10
  return nice * pow
}

/** 증감률 (+17%, -3%) */
export const formatRate = (current: number, previous: number) => {
  const rate = Math.round(((current - previous) / previous) * 100)
  return `${rate >= 0 ? '+' : ''}${rate}%`
}
