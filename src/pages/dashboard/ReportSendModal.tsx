import { useState } from 'react'
import Button from '../../components/ui/Button'
import CheckOptionCard from '../../components/ui/CheckOptionCard'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import dashboard from '../../data/dashboard.json'
import { fillDates } from '../../lib/kst'

const { report } = dashboard

type Props = { open: boolean; onClose: () => void }

// 마감 리포트 전송 모달 (states/01_dashboard-briefing-closing-send.png)
export default function ReportSendModal({ open, onClose }: Props) {
  const toast = useToast()
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(report.channels.map((c) => [c.id, c.checked])),
  )
  const canSend = Object.values(selected).some(Boolean)

  const send = () => {
    onClose()
    toast.show('마감 리포트를 전송했어요')
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-12 pb-10 pt-[57px]">
        <h2 className="text-subhead text-gray-900">오늘의 마감 리포트 전송</h2>
        <p className="mt-3.5 text-[16px] text-gray-600">
          <span className="font-semibold text-gray-700">{report.store}</span> · {fillDates(report.date)} · 총 매출 {report.total}
        </p>

        <div className="mt-10 flex flex-col gap-[13px]">
          {report.channels.map((c) => (
            <CheckOptionCard
              key={c.id}
              checked={selected[c.id]}
              onChange={(v) => setSelected((s) => ({ ...s, [c.id]: v }))}
              label={c.label}
              aside={c.value}
            />
          ))}
        </div>

        <div className="mt-11 flex flex-col items-center">
          <Button size="lg" className="w-[244px]" disabled={!canSend} onClick={send}>
            전송하기
          </Button>
          <button type="button" onClick={onClose} className="mt-4 text-[16px] text-gray-600 hover:text-gray-900">
            닫기
          </button>
          <p className="mt-8 text-[14px] text-gray-600">
            매일 {report.autoTime}에 자동으로 받고싶다면
            <button
              type="button"
              onClick={() => toast.show('자동 전송 설정은 준비중이에요')}
              className="ml-3.5 font-semibold text-gray-900 underline underline-offset-2"
            >
              자동 전송 설정하기
            </button>
          </p>
        </div>
      </div>
    </Modal>
  )
}
