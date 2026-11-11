// 'AI 추천 근거' 반짝이 아이콘 — 01_dashboard-briefing.png 캡처를 보고 다시 그림
// 큰 별 1개 + 좌상단·우하단 작은 별 2개 (안쪽으로 오목한 4각 별)
type Props = { size?: number; className?: string }

export default function AiSparkleIcon({ size = 14, className = '' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="currentColor" aria-hidden className={className}>
      <path d="M14 4.75Q16.8 10.95 23 13.75Q16.8 16.55 14 22.75Q11.2 16.55 5 13.75Q11.2 10.95 14 4.75Z" />
      <path d="M4.5 0Q5.9 3.1 9 4.5Q5.9 5.9 4.5 9Q3.1 5.9 0 4.5Q3.1 3.1 4.5 0Z" />
      <path d="M23.5 19Q24.9 22.1 28 23.5Q24.9 24.9 23.5 28Q22.1 24.9 19 23.5Q22.1 22.1 23.5 19Z" />
    </svg>
  )
}
