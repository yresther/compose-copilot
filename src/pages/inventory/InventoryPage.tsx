import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import docEditImg from '../../assets/illust/doc-edit.png'
import docSearchImg from '../../assets/illust/doc-search.png'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import { TextLink } from '../../components/ui/SectionCard'
import TipBanner from '../../components/ui/TipBanner'
import { useToast } from '../../components/ui/Toast'
import { CATEGORIES, useInventory } from '../../state/InventoryContext'
import { useOrders } from '../../state/OrdersContext'
import UrgentOrderBanner, { URGENT_ITEM_ID } from '../order/UrgentOrderBanner'
import DepletionWidget from './DepletionWidget'
import InventoryTable from './InventoryTable'

const ACCESS = [
  { key: 'view', image: docSearchImg, title: '조회 전용', desc: '재고 현황과 소진 예측 타임라인 보기만 가능' },
  { key: 'edit', image: docEditImg, title: '입력 권한', desc: '재고 현황 조회 + 남은 재고 직접 등록 및 수정 가능' },
]

// 재고현황 (06_inventory.png) — 발주관리에서 전송한 품목은 '입고 예정'으로 반영
export default function InventoryPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { rows, saveStocks } = useInventory()
  const { incoming } = useOrders()

  // 발주관리 등에서 품목(?item=)을 넘기면 그 품목의 카테고리를 먼저 연다
  const paramItem = params.get('item')
  const [category, setCategory] = useState(() => rows.find((r) => r.id === paramItem)?.categoryKey ?? CATEGORIES[0].key)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, number>>({})
  const [tipClosed, setTipClosed] = useState(false)

  const copyInvite = async (key: string) => {
    const link = `https://compose-copilot.demo/invite/${key}-${Math.random().toString(36).slice(2, 8)}`
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // 클립보드 권한이 없어도 데모 흐름은 그대로
    }
    toast.show(`${key === 'view' ? '조회 전용' : '입력 권한'} 초대링크를 복사했어요`)
  }

  return (
    <div className="pb-24">
      <PageHeader title="재고현황" basis className="pt-6" />

      <div className="px-page">
        {/* 팥 발주가 전송되면 배너가 사라진다 */}
        {!incoming[URGENT_ITEM_ID] && <UrgentOrderBanner className="mt-[45px]" onOrder={() => navigate(`/order?item=${URGENT_ITEM_ID}`)} />}

        <div className={`${incoming[URGENT_ITEM_ID] ? 'mt-[45px]' : 'mt-6'} grid grid-cols-[796fr_373fr] gap-[18px]`}>
          {/* 전체 재고현황 */}
          <section className="h-[652px] rounded-card bg-white pl-[34px] pr-[33px] pt-[31px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-gray-900">전체 재고현황</h2>
              {editing ? (
                <div className="flex items-center gap-[18px]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setDraft({})
                    }}
                    className="text-[15px] text-gray-500 hover:text-gray-800"
                  >
                    취소
                  </button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const short = saveStocks(draft)
                      setEditing(false)
                      setDraft({})
                      toast.show(
                        short > 0
                          ? `재고를 저장했어요. 부족한 품목 ${short}개를 실시간 브리핑 · 오늘의 할 일의 발주 제안에 추가했어요`
                          : '재고를 저장했어요. 소진 예상일과 알림에 바로 반영돼요',
                      )
                    }}
                  >
                    저장하기
                  </Button>
                </div>
              ) : (
                <span className="text-[17px]">
                  <TextLink onClick={() => setEditing(true)}>재고 직접 수정하기</TextLink>
                </span>
              )}
            </div>
            <div className="mt-[26px]">
              <InventoryTable
                rows={rows}
                category={category}
                onCategory={setCategory}
                highlightId={paramItem}
                editing={editing}
                draft={draft}
                onDraft={(id, v) => setDraft((d) => ({ ...d, [id]: v }))}
              />
            </div>
          </section>

          <DepletionWidget />
        </div>

        {/* 직원 재고 접근 설정 */}
        <section className="mt-[41px] rounded-card bg-white px-[34px] pb-[45px] pt-[25px]">
          <h2 className="text-[20px] font-bold text-gray-900">직원 재고 접근 설정</h2>
          <p className="mt-[9px] text-[16px] text-gray-700">직원이 재고 현황을 조회하거나 직접 입력할 수 있도록 권한을 설정해요.</p>
          <div className="mt-[30px] grid grid-cols-2 gap-5">
            {ACCESS.map((a) => (
              <div key={a.key} className="flex h-[110px] items-center rounded-card bg-gray-100 pl-[27px] pr-[23px]">
                <span className="flex h-[69px] w-[69px] shrink-0 items-center justify-center rounded-full bg-white">
                  <img src={a.image} alt="" className="h-[46px] w-[46px]" />
                </span>
                <div className="ml-[21px] min-w-0 flex-1">
                  <p className="text-[18px] font-semibold text-gray-900">{a.title}</p>
                  <div className="mt-[9px] flex items-center justify-between gap-3">
                    <p className="truncate text-[14px] text-gray-600">{a.desc}</p>
                    <button
                      type="button"
                      onClick={() => copyInvite(a.key)}
                      className="h-[25px] shrink-0 rounded-btn border border-gray-400 bg-white px-[13px] text-[13px] text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      초대링크 생성
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!tipClosed && (
            <TipBanner
              className="mt-[19px] h-[82px]"
              headlineSize="md"
              headline="직원이 마감 후 남은 재고를 직접 등록해야 다음날 발주 제안 정확도가 높아져요."
              onClose={() => setTipClosed(true)}
            />
          )}
        </section>
      </div>
    </div>
  )
}
