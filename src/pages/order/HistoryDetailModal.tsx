import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import type { HistoryRow } from '../../state/OrdersContext'
import OrderHistoryTable from './OrderHistoryTable'

type Props = { open: boolean; rows: HistoryRow[]; onClose: () => void }

/** 지난 발주내역 '자세히보기' — 최근 30일 발주 전체 */
export default function HistoryDetailModal({ open, rows, onClose }: Props) {
  const shortage = rows.filter((r) => r.result === 'shortage').length
  return (
    <Modal open={open} onClose={onClose} width={1100}>
      <div className="px-12 pb-10 pt-[50px]">
        <h2 className="text-subhead text-gray-900">최근 30일 발주내역</h2>
        <p className="mt-2 text-[16px] text-gray-600">
          총 <span className="font-num font-semibold text-gray-800">{rows.length}건</span> · 재고부족{' '}
          <span className="font-num font-semibold text-danger">{shortage}건</span>
        </p>
        <div className="mt-6 max-h-[460px] overflow-y-auto">
          <OrderHistoryTable rows={rows} />
        </div>
        <div className="mt-8 flex justify-center">
          <Button size="lg" className="w-[244px]" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
