import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuantityStepper from '../../components/ui/QuantityStepper'
import { useDismiss } from '../../hooks/useDismiss'
import { useInventory, type InventoryRow } from '../../state/InventoryContext'

/** 소진 임박 알림 — 소진 임박 / 주의 그룹, 그룹 안은 D-day 임박순. 항목을 누르면 발주관리에서 그 품목 선택 */
export default function DepletionWidget() {
  const navigate = useNavigate()
  const { rows, thresholds, setThresholds } = useInventory()
  const [open, setOpen] = useState(false)
  const popRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(popRef, open, close)

  // 입고 예정(발주 전송)인 품목은 목록에서 빠진다
  const byDays = (a: InventoryRow, b: InventoryRow) => a.days - b.days || a.name.localeCompare(b.name, 'ko')
  const groups = [
    { label: '소진 임박', items: rows.filter((r) => r.status === 'danger').sort(byDays) },
    { label: '주의', items: rows.filter((r) => r.status === 'warn').sort(byDays) },
  ]

  return (
    <section className="flex h-[652px] flex-col rounded-card bg-white pb-[22px] pl-[31px] pr-8 pt-[33px]">
      <h2 className="text-[20px] font-bold text-gray-900">소진 임박 알림</h2>

      <div className="mt-[49px] min-h-0 flex-1 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.label} className="mb-[22px]">
            <p className="text-[14px] font-medium text-gray-700">{g.label}</p>
            {g.items.length === 0 ? (
              <p className="mt-3 text-[14px] text-gray-400">해당 품목이 없어요</p>
            ) : (
              <ul className="mt-[13px] flex flex-col gap-[9px]">
                {g.items.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/order?item=${r.id}`)}
                      className="flex h-[39px] w-full items-center justify-between rounded-btn bg-gray-100 pl-[18px] pr-[19px] text-[14px] font-medium text-gray-900 transition-colors hover:bg-gray-200"
                    >
                      {r.name}
                      <span className="font-num">D-{r.days}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div ref={popRef} className="relative border-t border-gray-300 pt-[22px]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-[16px] font-medium text-gray-800 underline underline-offset-2 hover:text-gray-900"
        >
          소진 임박 알림 임계치 설정
        </button>
        <p className="mt-[9px] text-[16px] leading-[1.45] text-gray-500">
          재고가 며칠치 이하로 내려가면 사전 알림을 받을지 설정해요. 다음 발주 제안에 자동 반영돼요.
        </p>

        {open && (
          <div className="absolute bottom-[calc(100%-8px)] left-0 z-30 w-[300px] animate-fade-in rounded-card bg-white p-5 shadow-modal">
            <p className="text-[16px] font-semibold text-gray-900">알림 기준 설정</p>
            <div className="mt-4 flex flex-col gap-3 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">
                  소진 임박 <span className="text-gray-400">· 일 이하</span>
                </span>
                <QuantityStepper
                  value={thresholds.danger}
                  min={1}
                  onChange={(v) => setThresholds({ danger: v, warn: Math.max(thresholds.warn, v + 1) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">
                  주의 <span className="text-gray-400">· 일 이하</span>
                </span>
                <QuantityStepper value={thresholds.warn} min={thresholds.danger + 1} onChange={(v) => setThresholds({ ...thresholds, warn: v })} />
              </div>
            </div>
            <p className="mt-3 text-[13px] text-gray-500">바꾸면 재고 표와 알림 목록에 바로 반영돼요.</p>
          </div>
        )}
      </div>
    </section>
  )
}
