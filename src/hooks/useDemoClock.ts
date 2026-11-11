import { useEffect, useState } from 'react'
import { formatDate, formatTime, kstNow } from '../lib/kst'

/**
 * 오른쪽 위 현재 날짜·시각 — 실제 한국 시간 (1초마다 갱신)
 * sep: 날짜 구분자 — 대시보드 홈은 '-', 그 외 페이지는 '.'
 */
export function useDemoClock(sep: '-' | '.' = '.') {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const p = kstNow(now)
  return `${formatDate(p, sep)} ${formatTime(p)}`
}
