import { Check, Search } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { CATALOG } from '../../state/OrdersContext'
import ProductThumb from './ProductThumb'

type Props = {
  open: boolean
  /** 이미 발주 목록에 있는 품목 — 고를 수 없음 */
  existingIds: string[]
  onClose: () => void
  onAdd: (ids: string[]) => void
}

/** 검색어를 노란 글씨로 표시 */
function highlight(text: string, q: string) {
  const i = q ? text.indexOf(q) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <span className="text-yellow-700">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  )
}

// 품목 직접 추가하기 (05_order-management-Add item directly.png)
export default function AddItemModal({ open, existingIds, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const q = query.trim()
  const results = CATALOG.filter((c) => !q || c.name.includes(q))

  const close = () => {
    setQuery('')
    setPicked([])
    onClose()
  }

  return (
    <Modal open={open} onClose={close}>
      <div className="px-[35px] pb-8 pt-9">
        <h2 className="text-subhead text-gray-900">품목 직접 추가하기</h2>

        <label className="mt-10 block text-[16px] font-semibold text-gray-700" htmlFor="item-search">
          품목명 검색
        </label>
        <div className="relative mt-3">
          <input
            id="item-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예) 초코, 우유, 원두"
            className="h-12 w-full rounded-input border-[1.5px] border-transparent bg-gray-200 pl-5 pr-12 text-[16px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-yellow-300 focus:bg-white"
          />
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <ul className="mt-2.5 max-h-[300px] overflow-y-auto rounded-card bg-white px-4 shadow-float">
          {results.length === 0 && <li className="py-10 text-center text-[15px] text-gray-500">검색 결과가 없어요.</li>}
          {results.map((c) => {
            const exists = existingIds.includes(c.id)
            const on = picked.includes(c.id)
            return (
              <li key={c.id} className="border-b border-gray-200 last:border-b-0">
                <button
                  type="button"
                  disabled={exists}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== c.id) : [...p, c.id]))}
                  className={`flex h-[72px] w-full items-center gap-6 rounded-input px-4 text-left transition-colors ${
                    on ? 'bg-yellow-50' : 'hover:bg-gray-100'
                  } disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent`}
                >
                  <ProductThumb id={c.id} size={48} />
                  <span className="text-[16px] text-gray-900">{highlight(c.name, q)}</span>
                  {exists && <span className="text-[13px] text-gray-500">이미 목록에 있어요</span>}
                  <span className="ml-auto font-num text-[15px] text-gray-500">{c.spec}</span>
                  <Check size={18} strokeWidth={2.5} className={on ? 'text-yellow-700' : 'invisible'} />
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="w-[177px]"
            disabled={picked.length === 0}
            onClick={() => {
              onAdd(picked)
              close()
            }}
          >
            발주 목록에 추가하기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
