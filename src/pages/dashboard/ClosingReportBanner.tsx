import { ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'

type Props = { onPreview: () => void; onSend: () => void }

// 마감 모드 하단에 떠 있는 리포트 배너
export default function ClosingReportBanner({ onPreview, onSend }: Props) {
  return (
    <div className="sticky bottom-[58px] z-30 mx-14 mt-10 flex h-[110px] items-center rounded-card bg-brown-600 pl-[26px] pr-[26px] shadow-modal">
      {/* 리포트 3D 아이콘 에셋이 없어 임시 이모지로 표시 */}
      <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[16px] bg-white text-[34px]">
        🧾
      </span>
      <div className="ml-[23px]">
        <p className="text-[16px] font-semibold text-white">오늘의 마감 레포트가 준비됐어요. 지금 확인해볼까요?</p>
        <p className="mt-1.5 text-[14px] text-gray-400">매출 · 발주 관련 핵심만 정리했어요</p>
      </div>
      <div className="ml-auto flex gap-3">
        <Button variant="outline-dark" className="h-[47px] w-[116px] border-gray-400 text-[16px] font-medium" onClick={onPreview}>
          미리보기
        </Button>
        <Button variant="accent" className="h-[47px] w-[176px] text-[17px] font-semibold" onClick={onSend}>
          레포트 전송하기
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  )
}
