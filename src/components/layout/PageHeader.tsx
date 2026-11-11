import { RotateCw } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { basisNow } from '../../lib/kst'

type Props = {
  title: string
  /** 제목 옆 설명 (최근 6개월 데이터 기반 · 자동업데이트) */
  description?: string
  /** true면 'HH:MM 기준' + 새로고침 아이콘 표시 — 처음 열 때와 새로고침할 때의 현재 시각(KST) */
  basis?: boolean
  /** 처음 보일 기준 문구 (기본: 현재 시각 'HH:MM 기준'). 새로고침하면 현재 시각으로 바뀜 */
  basisInitial?: string
  /** 오른쪽 영역 (날짜 선택 등) */
  right?: ReactNode
  /** 기준 시각을 페이지가 함께 쓸 때 (예: 브랜드 비교 안내문) — 새로고침 시 호출 */
  onRefresh?: (basisText: string) => void
  className?: string
}

// 페이지 제목 행 — 제목 + 기준 시각 + 새로고침
export default function PageHeader({ title, description, basis, basisInitial, right, onRefresh, className = 'pt-[30px]' }: Props) {
  const [spin, setSpin] = useState(0)
  const [basisText, setBasisText] = useState(() => basisInitial ?? basisNow())

  const refresh = () => {
    setSpin((s) => s + 360)
    const text = basisNow()
    setBasisText(text)
    onRefresh?.(text)
  }

  return (
    <div className={`flex items-center justify-between px-page ${className}`}>
      <div className="flex items-center">
        <h1 className="text-pagetitle text-gray-900">{title}</h1>
        {description && <span className="ml-[17px] text-[16px] text-gray-700">{description}</span>}
        {basis && (
          <>
            <span className="ml-4 font-num text-[14px] text-gray-500">{basisText}</span>
            <button type="button" aria-label="새로고침" onClick={refresh} className="ml-[7px] text-gray-400 hover:text-gray-600">
              <RotateCw size={15} style={{ transform: `rotate(${spin}deg)`, transition: 'transform 600ms ease' }} />
            </button>
          </>
        )}
      </div>
      {right}
    </div>
  )
}
