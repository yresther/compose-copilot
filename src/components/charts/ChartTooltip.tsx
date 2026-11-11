import type { ReactNode } from 'react'

/** 차트 툴팁 공통 상자 — 흰 카드 + 제목 + 라벨/값 행 */
export function ChartTooltipBox({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="w-[187px] rounded-input bg-white px-[18px] py-[14px] text-[13px] shadow-float">
      <p className="font-num text-gray-600">{title}</p>
      <dl className="mt-2.5 flex flex-col gap-1.5">{children}</dl>
    </div>
  )
}

/** 툴팁 한 줄 — 왼쪽 점(선택) + 라벨, 오른쪽 값 */
export function ChartTooltipRow({ label, value, dot, strong }: { label: string; value: ReactNode; dot?: string; strong?: boolean }) {
  return (
    <div className="flex items-center">
      {dot && <span className="mr-1.5 h-1 w-1 rounded-full" style={{ background: dot }} />}
      <dt className={strong ? 'text-gray-700' : 'text-gray-400'}>{label}</dt>
      <dd className={`ml-auto font-num ${strong ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{value}</dd>
    </div>
  )
}
