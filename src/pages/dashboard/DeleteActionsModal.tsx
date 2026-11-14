import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import type { ActionCardData } from '../../components/ui/ActionCard'

type Props = { open: boolean; items: ActionCardData[]; onClose: () => void; onConfirm: () => void }

/** 선택한 할 일 삭제 전 확인 — 발주 전송 확인 모달과 같은 모양 */
export default function DeleteActionsModal({ open, items, onClose, onConfirm }: Props) {
  return (
    <Modal open={open} onClose={onClose} width={520}>
      <div className="px-12 pb-10 pt-[46px]">
        <h2 className="text-subhead text-gray-900">{items.length > 1 ? '선택한 할 일을 삭제할까요?' : '이 할 일을 삭제할까요?'}</h2>
        <p className="mt-2 text-[16px] text-gray-600">삭제하면 목록에서 사라지고 되돌릴 수 없어요.</p>

        <ul className="mt-6 divide-y divide-gray-200 rounded-card border border-gray-300">
          {items.map((a) => (
            <li key={a.id} className="flex h-[52px] items-center gap-3 px-5 text-[15px]">
              <span className="text-[14px] text-gray-500">{a.category}</span>
              <span className="font-semibold text-gray-900">{a.title}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" size="lg" className="w-[160px]" onClick={onClose}>
            취소
          </Button>
          <Button size="lg" className="w-[200px]" onClick={onConfirm}>
            삭제하기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
