import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import Modal from '../../components/ui/Modal'
import { TextLink } from '../../components/ui/SectionCard'
import TipBanner from '../../components/ui/TipBanner'
import { useToast } from '../../components/ui/Toast'
import { formatNumber, formatWon } from '../../lib/format'
import { useStockBadge } from '../../state/InventoryContext'
import { ORDER_DATA, useOrders, type HistoryRow, type OrderItem } from '../../state/OrdersContext'
import AddItemModal from './AddItemModal'
import HistoryDetailModal from './HistoryDetailModal'
import OrderConfirmModal from './OrderConfirmModal'
import OrderHistoryTable from './OrderHistoryTable'
import OrderItemCard from './OrderItemCard'
import UrgentOrderBanner from './UrgentOrderBanner'

type Category = 'all' | 'syrup' | 'dairy' | 'beans' | 'ice'
const CATEGORIES = ORDER_DATA.categories as { value: Category; label: string }[]
const { urgent, history } = ORDER_DATA

// 발주관리 (05_order-management.png) — 데모 시나리오 1: 액션 제안 → 발주 승인 → 재고 반영
export default function OrderPage() {
  const toast = useToast()
  const [params] = useSearchParams()
  const { items, setQty, remove, add, submittedAt, submit, cancelSubmit, newRows } = useOrders()
  const done = submittedAt !== null
  // 품목 배지는 재고현황 칩과 같은 기준 (직접 추가 · 재고 부족은 그대로)
  const stockBadge = useStockBadge()
  const withStockBadge = (it: OrderItem): OrderItem => {
    if (it.manual || it.badge?.text === '재고 부족') return it
    const b = stockBadge(it.id)
    return b ? { ...it, badge: b } : it
  }

  // 액션 제안(?item=)·긴급 배너에서 고른 품목을 강조하고 그 카드로 스크롤
  const [highlightId, setHighlightId] = useState<string | null>(params.get('item'))
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})
  const addedFromParam = useRef(false)
  useEffect(() => {
    const id = params.get('item')
    if (!id || addedFromParam.current || items.some((it) => it.id === id)) return
    addedFromParam.current = true
    if (done) {
      toast.show('오늘 발주는 이미 전송했어요. 전송 취소 후 품목을 추가할 수 있어요')
      return
    }
    // 재고 부족 발주 제안 카드에서 넘어오면: AI 제안 수량·연결 액션과 함께 추가 (전송하면 그 카드도 완료)
    const actionId = params.get('action')
    const qty = Number(params.get('qty'))
    const added = actionId
      ? add(id, {
          actionId,
          qty,
          aiQty: qty,
          manual: false,
          badge: { tone: 'danger', text: '재고 부족' },
          reason: '재고현황에서 직접 수정한 재고 기준으로 7일치를 채우는 수량이에요',
        })
      : add(id)
    if (added) toast.show(actionId ? '재고 부족 품목을 발주 목록에 추가했어요' : '재고현황에서 고른 품목을 발주 목록에 추가했어요')
  }, [params, done, items, add, toast])
  useEffect(() => {
    if (highlightId) cardRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightId])

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [category, setCategory] = useState<Category>('all')
  const [tipClosed, setTipClosed] = useState(false)

  const total = items.reduce((s, it) => s + it.qty * it.price, 0)
  const allRows: HistoryRow[] = [...newRows, ...(history.rows as HistoryRow[])]
  const tableRows = allRows.filter((r) => category === 'all' || r.category === category)
  const shortages = (history.rows as HistoryRow[]).filter((r) => r.result === 'shortage')
  const urgentItem = items.find((it) => it.id === urgent.itemId)

  const send = () => {
    setConfirmOpen(false)
    submit()
    toast.show('발주 시스템으로 전송했어요. 입고 예정으로 재고에 반영돼요')
  }

  return (
    <div className="pb-24">
      <PageHeader title="발주관리" basis className="pt-6" />

      <div className="px-page">
        {/* 긴급 발주 배너 — 전송하면 사라짐 */}
        {!done && urgentItem && <UrgentOrderBanner className="mt-[45px]" onOrder={() => setHighlightId(urgent.itemId)} />}

        {/* 오늘 발주 수량 제안 */}
        <section className={`${done || !urgentItem ? 'mt-[45px]' : 'mt-5'} rounded-card bg-white pb-[27px] pl-[31px] pr-[39px] pt-[31px]`}>
          <h2 className="text-[20px] font-bold text-gray-900">오늘 발주 수량 제안</h2>
          <p className="mt-[5px] text-[16px] text-gray-700">AI가 판매 이력, 날씨, 재고 소진 속도를 계산해 발주 수량을 책정했어요.</p>

          {items.length === 0 ? (
            <p className="mt-8 rounded-card bg-gray-100 py-14 text-center text-[16px] text-gray-500">
              발주할 품목이 없어요. 품목을 직접 추가해보세요.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-3 gap-5">
              {items.map((it) => (
                <OrderItemCard
                  key={it.id}
                  ref={(el) => {
                    cardRefs.current[it.id] = el
                  }}
                  item={withStockBadge(it)}
                  done={done}
                  highlighted={!done && highlightId === it.id}
                  onQty={(q) => setQty(it.id, q)}
                  onRemove={() => {
                    remove(it.id)
                    toast.show(`${it.name.replace(/^컴포즈 /, '')}을(를) 발주 목록에서 뺐어요`)
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-[26px]">
            <div>
              <p className="text-[16px] text-gray-700">{done ? `발주 금액 · ${submittedAt} 전송 완료` : '예상 발주 금액'}</p>
              <p className="mt-1.5 flex items-baseline gap-2.5">
                <span className="font-num text-[26px] font-bold text-gray-900">{formatWon(total)}</span>
                <span className="text-[17px] text-gray-700">/ {formatNumber(items.length)}개 품목</span>
              </p>
            </div>
            <div className="flex gap-[18px]">
              {done ? (
                <Button variant="outline" className="h-[47px] w-[176px] text-[17px] font-medium" onClick={() => setCancelOpen(true)}>
                  전송 취소
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="flex h-[47px] w-[176px] items-center justify-center gap-2 rounded-input border border-dashed border-gray-400 text-[17px] text-gray-500 transition-colors hover:border-gray-500 hover:text-gray-700 disabled:cursor-default disabled:opacity-50"
                >
                  <Plus size={20} strokeWidth={1.5} />
                  품목 직접 추가
                </button>
              )}
              <Button
                className="h-[47px] w-[177px] text-[17px] font-medium"
                disabled={done || items.length === 0}
                onClick={() => setConfirmOpen(true)}
              >
                {done ? '전송 완료' : '발주 시스템으로 전송'}
              </Button>
            </div>
          </div>
        </section>

        {/* 지난 발주내역 */}
        <section className="mt-5 rounded-card bg-white px-[29px] pb-7 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">지난 발주내역</h2>
              <p className="mt-[11px] text-[14px] text-gray-700">최근 30일 AI제안 vs 실제 발주</p>
            </div>
            <div className="mr-[24px] flex items-center gap-5">
              <Dropdown variant="plain" options={CATEGORIES} value={category} onChange={setCategory} ariaLabel="품목 분류" />
              <TextLink size="sm" onClick={() => setDetailOpen(true)}>
                자세히보기
              </TextLink>
            </div>
          </div>

          {/* 요약 3칸 */}
          <div className="mt-[29px] grid grid-cols-[455fr_310fr_310fr] gap-[14px] pr-[24px]">
            <div className="flex h-[87px] items-center rounded-card bg-gray-100 px-5">
              <div className="w-[118px]">
                <p className="text-[14px] text-gray-700">최근 발주</p>
                <p className="mt-1.5 text-[20px] font-bold text-gray-900">재고부족 {shortages.length}건</p>
              </div>
              <span className="ml-5 h-[54px] w-px bg-gray-300" />
              <ul className="ml-auto mr-[15px] flex flex-col gap-1.5 text-right text-[15px]">
                {shortages.map((r) => (
                  <li key={r.date + r.item}>
                    <span className="font-num text-gray-700">{r.date}</span>
                    <span className="ml-3 inline-block min-w-[44px] font-semibold text-gray-900">{r.item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {[history.summary.quarter, history.summary.month].map((s) => (
              <div key={s.label} className="flex h-[87px] items-end justify-between rounded-card bg-gray-100 px-[27px] pb-4">
                <div>
                  <p className="text-[14px] text-gray-700">{s.label}</p>
                  <p className="mt-1 font-num text-[26px] font-bold text-gray-900">{s.value}</p>
                </div>
                <p className="mb-1 text-[14px] text-gray-600">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-[19px] pr-[24px]">
            <OrderHistoryTable rows={tableRows} />
          </div>

          {!tipClosed && <TipBanner inline className="mr-[24px] mt-[13px]" headline={history.tip} onClose={() => setTipClosed(true)} />}
        </section>
      </div>

      {/* 전송 취소 확인 */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} width={520}>
        <div className="px-10 pb-9 pt-11 text-center">
          <h2 className="text-[22px] font-bold text-gray-900">발주 전송을 취소할까요?</h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-gray-600">
            본사 발주 시스템 접수가 취소되고, 수량을 다시 고칠 수 있어요.
            <br />
            오늘의 할 일의 완료 표시와 입고 예정도 함께 취소돼요.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" size="lg" className="w-[150px]" onClick={() => setCancelOpen(false)}>
              닫기
            </Button>
            <Button
              size="lg"
              className="w-[180px]"
              onClick={() => {
                setCancelOpen(false)
                cancelSubmit()
                toast.show('발주 전송을 취소했어요')
              }}
            >
              전송 취소하기
            </Button>
          </div>
        </div>
      </Modal>
      <OrderConfirmModal open={confirmOpen} items={items} onClose={() => setConfirmOpen(false)} onConfirm={send} />
      <AddItemModal
        open={addOpen}
        existingIds={items.map((it) => it.id)}
        onClose={() => setAddOpen(false)}
        onAdd={(ids) => {
          ids.forEach((id) => add(id))
          toast.show(`${ids.length}개 품목을 발주 목록에 추가했어요`)
        }}
      />
      <HistoryDetailModal
        open={detailOpen}
        rows={[...allRows, ...(history.moreRows as HistoryRow[])]}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
