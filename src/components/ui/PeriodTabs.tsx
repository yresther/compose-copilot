type Item<K extends string> = { key: K; label: string }

type Props<K extends string> = {
  items: Item<K>[]
  value: K
  onChange: (key: K) => void
  /** dark: 다크 배경 위 노란 알약 (대시보드 홈) / light: 밝은 배경 위 검정 알약 (매출 리포트) / chip: 회색 알약 + 검정 선택 (리뷰 분석 채널) */
  variant?: 'dark' | 'light' | 'chip'
}

/** 기간 탭 (오늘/어제/지난주/지난달) */
export default function PeriodTabs<K extends string>({ items, value, onChange, variant = 'dark' }: Props<K>) {
  const styles =
    variant === 'dark'
      ? { on: 'bg-yellow-300 font-semibold text-gray-900', off: 'bg-brown-800 font-medium text-gray-500 hover:text-gray-300' }
      : variant === 'chip'
        ? { on: 'bg-brown-800 font-semibold text-white', off: 'bg-gray-300 font-normal text-gray-500 hover:text-gray-700' }
        : { on: 'bg-brown-900 font-semibold text-white', off: 'font-normal text-gray-500 hover:text-gray-800' }

  return (
    <div role="tablist" className="flex gap-[5px]">
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={`h-[30px] rounded-full px-[10px] text-[14px] transition-colors ${active ? styles.on : styles.off}`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
