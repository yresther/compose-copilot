import { MessageCircleMore } from 'lucide-react'
import AiSparkleIcon from '../icons/AiSparkleIcon'
import { useAskAI } from '../../state/AskAIContext'
import AskAIPanel from '../ai/AskAIPanel'

// 우측 하단 'AI에게 추가질문하기' — 누르면 오른쪽에 AI 코파일럿 대화창이 열린다
// 크기: 초기 캡처 대비 1.1배 (말풍선 13px 글자, 버튼 55px)
export default function FloatingAskAI() {
  const { open, setOpen } = useAskAI()

  return (
    <>
      <AskAIPanel />
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="group fixed bottom-14 right-14 z-40 flex flex-col items-end">
          <span className="relative mb-[9px] flex items-center gap-[5px] rounded-full bg-white px-[11px] py-[5px] text-[13px] font-medium text-gray-900 shadow-float">
            <AiSparkleIcon size={13} className="text-yellow-700" />
            AI에게 추가질문하기
            <span className="absolute -bottom-[4px] right-[26px] h-[9px] w-[9px] rotate-45 bg-white" />
          </span>
          <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-yellow-300 text-white shadow-float transition-transform group-hover:scale-105">
            <MessageCircleMore size={29} fill="currentColor" stroke="#FFD21F" strokeWidth={1.5} />
          </span>
        </button>
      )}
    </>
  )
}
